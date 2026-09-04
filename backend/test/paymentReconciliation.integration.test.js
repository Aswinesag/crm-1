const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const crypto = require("crypto");
const express = require("express");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const RazorpayWebhookEvent = require("../models/RazorpayWebhookEvent");
const { finalizeSuccessfulPayment, reconcilePaymentAttempt, reconcileInvoiceAttempts } = require("../services/paymentReconciliationService");
const { razorpayWebhook } = require("../controllers/razorpayWebhookController");
const paymentRoutes = require("../routes/paymentRoutes");
const { migratePaymentAttemptIndexes } = require("../utils/migrations/migratePaymentAttemptIndexes");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const SubscriptionReminder = require("../models/SubscriptionReminder");
const { generateDueReminders, processDueReminders } = require("../services/subscriptionReminderService");

const uri = process.env.TEST_MONGODB_URI;

const createPair = async (suffix) => {
  const userId = new mongoose.Types.ObjectId();
  const invoice = await Invoice.create({
    invoiceNumber: `TEST-INV-${suffix}`, invoiceDate: new Date(), salesOrderNo: `SO-${suffix}`,
    customerName: "Webhook Test", gstin: "TESTGSTIN", billingAddress: "Test billing",
    shippingAddress: "Test shipping", paymentTerms: "Immediate", dueDate: new Date(Date.now() + 86400000),
    items: [{ productCode: "P1", productName: "Test", quantity: 1, unit: "Each", rate: 100,
      discount: 0, gstPercent: 0, taxableAmount: 100, gstAmount: 0, amount: 100 }],
    subtotal: 100, cgst: 0, sgst: 0, igst: 0, freightCharges: 0, grandTotal: 100,
    amountPaid: 0, balanceDue: 100, paymentStatus: "Unpaid", currency: "INR", createdBy: userId,
  });
  const payment = await Payment.create({
    invoice: invoice._id, invoiceNumber: invoice.invoiceNumber, customerName: invoice.customerName,
    amount: 100, amountPaise: 10000, currency: "INR", receipt: `receipt_${suffix}`,
    razorpayOrderId: `order_${suffix}`, status: "Created", createdBy: userId,
  });
  return { invoice, payment };
};

test("transactional reconciliation integration", { skip: !uri }, async (t) => {
  await mongoose.connect(uri);
  await Payment.syncIndexes();
  t.after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

  await t.test("raw webhook route is signature-protected, deduplicated, and does not require JWT", async (st) => {
    const previousSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    process.env.RAZORPAY_WEBHOOK_SECRET = "integration_webhook_secret";
    const app = express();
    app.post("/webhook", express.raw({ type: "application/json", limit: "256kb" }), razorpayWebhook);
    app.use(express.json());
    app.use("/payments", paymentRoutes);
    const server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    st.after(() => {
      process.env.RAZORPAY_WEBHOOK_SECRET = previousSecret;
      server.close();
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const body = Buffer.from(JSON.stringify({ event: "refund.processed", payload: {} }));
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
    const headers = { "content-type": "application/json", "x-razorpay-signature": signature, "x-razorpay-event-id": "evt_http_dedupe" };

    const first = await fetch(`${base}/webhook`, { method: "POST", headers, body });
    assert.equal(first.status, 200);
    assert.equal((await first.json()).status, "Ignored");
    const duplicate = await fetch(`${base}/webhook`, { method: "POST", headers, body });
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).duplicate, true);
    assert.equal(await RazorpayWebhookEvent.countDocuments({ eventId: "evt_http_dedupe" }), 1);

    const invalid = await fetch(`${base}/webhook`, { method: "POST", headers: { ...headers, "x-razorpay-event-id": "evt_invalid", "x-razorpay-signature": "0".repeat(64) }, body });
    assert.equal(invalid.status, 401);
    assert.equal(await RazorpayWebhookEvent.countDocuments({ eventId: "evt_invalid" }), 0);
    assert.equal((await fetch(`${base}/payments`)).status, 401);
    assert.equal((await fetch(`${base}/payments/${new mongoose.Types.ObjectId()}/reconcile`, { method: "POST" })).status, 401);
  });

  await t.test("authoritative lookup recovers captured payments", async () => {
    const { invoice, payment } = await createPair("lookup-captured");
    const client = { orders: { fetchPayments: async () => ({ items: [{
      id: "pay_lookup", order_id: payment.razorpayOrderId, status: "captured", amount: 10000, currency: "INR", created_at: 1700000000,
    }] }) } };
    const result = await reconcilePaymentAttempt(payment._id, { razorpayClient: client });
    assert.equal(result.outcome, "Paid");
    assert.equal((await Invoice.findById(invoice._id)).paymentStatus, "Paid");
  });

  await t.test("failed-only and stale empty attempts become retryable and preserve history", async () => {
    const failed = await createPair("lookup-failed");
    const failedClient = { orders: { fetchPayments: async () => ({ items: [{ id: "pay_failed", order_id: failed.payment.razorpayOrderId, status: "failed", amount: 10000, currency: "INR" }] }) } };
    assert.equal((await reconcilePaymentAttempt(failed.payment._id, { razorpayClient: failedClient })).outcome, "Retryable");
    const secondAttempt = await Payment.create({ invoice: failed.invoice._id, invoiceNumber: failed.invoice.invoiceNumber,
      customerName: "Webhook Test", amount: 100, amountPaise: 10000, currency: "INR", receipt: "receipt_retry_second",
      razorpayOrderId: "order_retry_second", status: "Created", createdBy: new mongoose.Types.ObjectId() });
    assert.ok(secondAttempt._id);
    assert.equal(await Payment.countDocuments({ invoice: failed.invoice._id }), 2);

    const stale = await createPair("lookup-stale");
    stale.payment.attemptExpiresAt = new Date(Date.now() - 1000);
    await stale.payment.save();
    const emptyClient = { orders: { fetchPayments: async () => ({ items: [] }) } };
    assert.equal((await reconcilePaymentAttempt(stale.payment._id, { razorpayClient: emptyClient })).outcome, "Retryable");
  });

  await t.test("Retryable attempts remain reconcilable for captured, failed, empty, and unavailable states", async () => {
    const captured = await createPair("retry-late-captured");
    captured.payment.status = "Retryable";
    captured.payment.retryAllowed = true;
    await captured.payment.save();
    let lookupCount = 0;
    const capturedClient = { orders: { fetchPayments: async () => { lookupCount += 1; return { items: [{ id: "pay_retry_late", order_id: captured.payment.razorpayOrderId, status: "captured", amount: 10000, currency: "INR" }] }; } } };
    assert.equal((await reconcilePaymentAttempt(captured.payment._id, { razorpayClient: capturedClient })).outcome, "Paid");
    assert.equal(lookupCount, 1);

    const failed = await createPair("retry-still-failed");
    failed.payment.status = "Retryable"; failed.payment.retryAllowed = true; await failed.payment.save();
    const failedClient = { orders: { fetchPayments: async () => ({ items: [{ id: "pay_retry_failed", order_id: failed.payment.razorpayOrderId, status: "failed" }] }) } };
    assert.equal((await reconcilePaymentAttempt(failed.payment._id, { razorpayClient: failedClient })).outcome, "Retryable");
    assert.equal((await Payment.findById(failed.payment._id)).status, "Retryable");

    const empty = await createPair("retry-still-empty");
    empty.payment.status = "Retryable"; empty.payment.retryAllowed = true; await empty.payment.save();
    assert.equal((await reconcilePaymentAttempt(empty.payment._id, { razorpayClient: { orders: { fetchPayments: async () => ({ items: [] }) } } })).outcome, "Retryable");

    const unavailable = await createPair("retry-unavailable");
    unavailable.payment.status = "Retryable"; unavailable.payment.retryAllowed = true; await unavailable.payment.save();
    await assert.rejects(reconcilePaymentAttempt(unavailable.payment._id, { razorpayClient: { orders: { fetchPayments: async () => { throw new Error("offline"); } } } }), /Unable to query/);
    const unchanged = await Payment.findById(unavailable.payment._id);
    assert.equal(unchanged.status, "Retryable");
    assert.equal(unchanged.retryAllowed, true);
  });

  await t.test("Pay Now preflight discovers a late capture before considering a Created attempt", async () => {
    const old = await createPair("preflight-old");
    old.payment.status = "Retryable"; old.payment.retryAllowed = true; await old.payment.save();
    await Payment.create({ invoice: old.invoice._id, invoiceNumber: old.invoice.invoiceNumber, customerName: "Webhook Test",
      amount: 100, amountPaise: 10000, currency: "INR", receipt: "receipt_preflight_new", razorpayOrderId: "order_preflight_new",
      status: "Created", createdBy: new mongoose.Types.ObjectId() });
    const client = { orders: { fetchPayments: async (orderId) => ({ items: orderId === old.payment.razorpayOrderId
      ? [{ id: "pay_preflight_old", order_id: orderId, status: "captured", amount: 10000, currency: "INR" }]
      : [] }) } };
    const result = await reconcileInvoiceAttempts(old.invoice._id, { razorpayClient: client });
    assert.equal(result.outcome, "Paid");
    assert.equal((await Payment.findById(old.payment._id)).status, "Paid");
    assert.equal((await Invoice.findById(old.invoice._id)).paymentStatus, "Paid");
  });

  await t.test("a second late capture becomes ManualReview without changing the paid Invoice", async () => {
    const old = await createPair("double-old");
    old.payment.status = "Retryable"; old.payment.retryAllowed = true; await old.payment.save();
    const newer = await Payment.create({ invoice: old.invoice._id, invoiceNumber: old.invoice.invoiceNumber, customerName: "Webhook Test",
      amount: 100, amountPaise: 10000, currency: "INR", receipt: "receipt_double_new", razorpayOrderId: "order_double_new",
      status: "Created", createdBy: new mongoose.Types.ObjectId() });
    await finalizeSuccessfulPayment({ orderId: old.payment.razorpayOrderId, paymentId: "pay_double_old", amountPaise: 10000, currency: "INR" });
    await assert.rejects(finalizeSuccessfulPayment({ orderId: newer.razorpayOrderId, paymentId: "pay_double_new", amountPaise: 10000, currency: "INR" }), /Another successful payment/);
    const [loser, invoice] = await Promise.all([Payment.findById(newer._id), Invoice.findById(old.invoice._id)]);
    assert.equal(loser.status, "Created");
    assert.equal(loser.reconciliationStatus, "ManualReview");
    assert.equal(loser.retryAllowed, false);
    assert.equal(invoice.amountPaid, 100);
    assert.equal(invoice.balanceDue, 0);
    assert.equal(invoice.paymentReferences.length, 1);
  });

  await t.test("recent empty and authorized attempts stay active", async () => {
    const recent = await createPair("lookup-recent");
    recent.payment.attemptExpiresAt = new Date(Date.now() + 60000);
    await recent.payment.save();
    const emptyClient = { orders: { fetchPayments: async () => ({ items: [] }) } };
    assert.equal((await reconcilePaymentAttempt(recent.payment._id, { razorpayClient: emptyClient })).outcome, "Active");
    const authorized = await createPair("lookup-authorized");
    const authorizedClient = { orders: { fetchPayments: async () => ({ items: [{ id: "pay_auth", order_id: authorized.payment.razorpayOrderId, status: "authorized", amount: 10000, currency: "INR" }] }) } };
    assert.equal((await reconcilePaymentAttempt(authorized.payment._id, { razorpayClient: authorizedClient })).outcome, "Active");
    assert.equal((await Invoice.findById(authorized.invoice._id)).paymentStatus, "Unpaid");
  });

  await t.test("Razorpay lookup failure cannot change financial state or permit retry", async () => {
    const { invoice, payment } = await createPair("lookup-error");
    const failingClient = { orders: { fetchPayments: async () => { throw new Error("network unavailable"); } } };
    await assert.rejects(reconcilePaymentAttempt(payment._id, { razorpayClient: failingClient }), /Unable to query/);
    const current = await Payment.findById(payment._id);
    assert.equal(current.status, "Created");
    assert.equal(current.retryAllowed, false);
    assert.equal((await Invoice.findById(invoice._id)).paymentStatus, "Unpaid");
  });

  await t.test("index migration preserves records and permits history while preventing parallel active attempts", async () => {
    const collection = mongoose.connection.collection("payment_migration_fixture");
    await collection.createIndex({ invoice: 1 }, { name: "invoice_1", unique: true, sparse: true });
    const invoiceId = new mongoose.Types.ObjectId();
    await collection.insertOne({ invoice: invoiceId, status: "Retryable" });
    await migratePaymentAttemptIndexes(collection);
    await collection.insertOne({ invoice: invoiceId, status: "Retryable" });
    await collection.insertOne({ invoice: invoiceId, status: "Created" });
    await assert.rejects(collection.insertOne({ invoice: invoiceId, status: "Created" }), /duplicate key/);
    assert.equal(await collection.countDocuments({ invoice: invoiceId }), 3);
    await collection.drop();
  });

  await t.test("racing captured attempts can produce only one Paid result", async () => {
    const first = await createPair("race-first");
    first.payment.status = "Retryable";
    first.payment.retryAllowed = true;
    await first.payment.save();
    const second = await Payment.create({ invoice: first.invoice._id, invoiceNumber: first.invoice.invoiceNumber,
      customerName: "Webhook Test", amount: 100, amountPaise: 10000, currency: "INR", receipt: "receipt_race_second",
      razorpayOrderId: "order_race_second", status: "Created", createdBy: new mongoose.Types.ObjectId() });
    const results = await Promise.allSettled([
      finalizeSuccessfulPayment({ orderId: first.payment.razorpayOrderId, paymentId: "pay_race_first", amountPaise: 10000, currency: "INR" }),
      finalizeSuccessfulPayment({ orderId: second.razorpayOrderId, paymentId: "pay_race_second", amountPaise: 10000, currency: "INR" }),
    ]);
    assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(await Payment.countDocuments({ invoice: first.invoice._id, status: "Paid" }), 1);
    assert.equal((await Invoice.findById(first.invoice._id)).paymentStatus, "Paid");
    const loser = await Payment.findOne({ invoice: first.invoice._id, status: { $ne: "Paid" } });
    assert.equal(loser.reconciliationStatus, "ManualReview");
    assert.equal(loser.retryAllowed, false);
  });

  await t.test("webhook finalizes Payment, Invoice, and audit event atomically and idempotently", async () => {
    const { invoice, payment } = await createPair("success");
    payment.status = "Retryable";
    payment.retryAllowed = true;
    await payment.save();
    const event = await RazorpayWebhookEvent.create({ eventId: "evt_success", eventType: "payment.captured", status: "Processing" });
    const first = await finalizeSuccessfulPayment({ orderId: payment.razorpayOrderId, paymentId: "pay_success", amountPaise: 10000, currency: "INR", webhookEventId: event._id });
    assert.equal(first.idempotent, false);
    const [paidPayment, paidInvoice, processed] = await Promise.all([
      Payment.findById(payment._id), Invoice.findById(invoice._id), RazorpayWebhookEvent.findById(event._id),
    ]);
    assert.equal(paidPayment.status, "Paid");
    assert.equal(paidInvoice.paymentStatus, "Paid");
    assert.equal(paidInvoice.paymentReferences.length, 1);
    assert.equal(processed.status, "Processed");

    const retryEvent = await RazorpayWebhookEvent.create({ eventId: "evt_retry", eventType: "order.paid", status: "Processing" });
    const retry = await finalizeSuccessfulPayment({ orderId: payment.razorpayOrderId, paymentId: "pay_success", amountPaise: 10000, currency: "INR", webhookEventId: retryEvent._id });
    assert.equal(retry.idempotent, true);
    assert.equal((await Invoice.findById(invoice._id)).paymentReferences.length, 1);
    await assert.rejects(
      finalizeSuccessfulPayment({ orderId: payment.razorpayOrderId, paymentId: "pay_conflict", amountPaise: 10000, currency: "INR" }),
      /another payment/
    );
  });

  await t.test("mismatched and unknown events cannot mutate financial state", async () => {
    const { invoice, payment } = await createPair("mismatch");
    await assert.rejects(
      finalizeSuccessfulPayment({ orderId: payment.razorpayOrderId, paymentId: "pay_mismatch", amountPaise: 9999, currency: "INR" }),
      /amount does not match/
    );
    await assert.rejects(
      finalizeSuccessfulPayment({ orderId: "order_unknown", paymentId: "pay_unknown", amountPaise: 10000, currency: "INR" }),
      /No local payment/
    );
    assert.equal((await Payment.findById(payment._id)).status, "Created");
    assert.equal((await Invoice.findById(invoice._id)).paymentStatus, "Unpaid");
  });

  await t.test("an injected invoice update failure rolls back the Payment update", async () => {
    const { invoice, payment } = await createPair("rollback");
    const original = Invoice.findOneAndUpdate;
    Invoice.findOneAndUpdate = () => Promise.resolve(null);
    try {
      await assert.rejects(
        finalizeSuccessfulPayment({ orderId: payment.razorpayOrderId, paymentId: "pay_rollback", amountPaise: 10000, currency: "INR" }),
        /Invoice was concurrently modified/
      );
    } finally {
      Invoice.findOneAndUpdate = original;
    }
    assert.equal((await Payment.findById(payment._id)).status, "Created");
    assert.equal((await Invoice.findById(invoice._id)).paymentStatus, "Unpaid");
  });

  await t.test("subscription activation and early renewal are transactional and idempotent", async () => {
    const initial = await createPair("subscription-initial");
    const plan = await SubscriptionPlan.create({ name: "Annual", code: "ANNUAL", durationMonths: 12, amount: 100, createdBy: new mongoose.Types.ObjectId() });
    const subscription = await Subscription.create({ customerName: "Subscriber", customerEmail: "subscriber@example.com", plan: plan._id,
      planName: plan.name, durationMonths: 12, invoice: initial.invoice._id, status: "PendingPayment", createdBy: new mongoose.Types.ObjectId() });
    initial.invoice.invoiceType = "Subscription"; initial.invoice.subscriptionPlan = plan._id; initial.invoice.subscription = subscription._id; await initial.invoice.save();
    const paidAt = new Date("2026-01-31T10:00:00Z");
    await finalizeSuccessfulPayment({ orderId: initial.payment.razorpayOrderId, paymentId: "pay_subscription_initial", amountPaise: 10000, currency: "INR", paidAt });
    const active = await Subscription.findById(subscription._id);
    assert.equal(active.status, "Active"); assert.equal(active.expiryDate.toISOString(), "2027-01-31T10:00:00.000Z");
    await finalizeSuccessfulPayment({ orderId: initial.payment.razorpayOrderId, paymentId: "pay_subscription_initial", amountPaise: 10000, currency: "INR", paidAt });
    assert.equal((await Subscription.findById(subscription._id)).appliedPayments.length, 1);

    const renewal = await createPair("subscription-renewal");
    renewal.invoice.invoiceType = "SubscriptionRenewal"; renewal.invoice.subscriptionPlan = plan._id; renewal.invoice.subscription = subscription._id; await renewal.invoice.save();
    await finalizeSuccessfulPayment({ orderId: renewal.payment.razorpayOrderId, paymentId: "pay_subscription_renewal", amountPaise: 10000, currency: "INR", paidAt: new Date("2026-12-15T10:00:00Z") });
    const renewed = await Subscription.findById(subscription._id);
    assert.equal(renewed.expiryDate.toISOString(), "2028-01-31T10:00:00.000Z");
    assert.equal(renewed.appliedPayments.length, 2);
  });

  await t.test("reminders are cycle-idempotent, concurrently claimed, and failures are bounded", async () => {
    const plan = await SubscriptionPlan.create({ name: "Six Month", code: "SIX", durationMonths: 6, amount: 100, createdBy: new mongoose.Types.ObjectId() });
    const now = new Date("2026-01-01T03:00:00Z");
    const sub = await Subscription.create({ customerName: "Reminder", customerEmail: "reminder@example.com", plan: plan._id, planName: plan.name,
      durationMonths: 6, status: "Active", startDate: now, expiryDate: new Date("2026-03-02T03:00:00Z"), createdBy: new mongoose.Types.ObjectId() });
    await Promise.all([generateDueReminders(now), generateDueReminders(now)]);
    assert.equal(await SubscriptionReminder.countDocuments({ subscription: sub._id, reminderStage: "60_DAY" }), 1);
    let sent = 0; const sender = async () => { sent += 1; };
    await Promise.all([processDueReminders(now, sender), processDueReminders(now, sender)]);
    assert.equal(sent, 1); assert.equal((await SubscriptionReminder.findOne({ subscription: sub._id })).status, "Sent");

    await SubscriptionReminder.create({ subscription: sub._id, customerName: sub.customerName, customerEmail: sub.customerEmail,
      reminderType: "Renewal", reminderStage: "30_DAY", cycleKey: "failure-cycle", scheduledFor: now });
    const failing = async () => { throw new Error("smtp down"); };
    await processDueReminders(now, failing); await processDueReminders(now, failing); await processDueReminders(now, failing); await processDueReminders(now, failing);
    const failed = await SubscriptionReminder.findOne({ subscription: sub._id, cycleKey: "failure-cycle" });
    assert.equal(failed.status, "Failed"); assert.equal(failed.attempts, 3);
  });

  await t.test("unpaid renewal switches reminder ownership and expiry remains valid through the business day", async () => {
    const plan = await SubscriptionPlan.findOne();
    const now = new Date("2026-01-01T03:00:00Z");
    const renewalSub = await Subscription.create({ customerName: "Pending Renewal", customerEmail: "pending@example.com", plan: plan._id,
      planName: plan.name, durationMonths: plan.durationMonths, status: "Active", startDate: now,
      expiryDate: new Date("2026-01-31T03:00:00Z"), createdBy: new mongoose.Types.ObjectId() });
    const pair = await createPair("pending-reminder");
    pair.invoice.invoiceType = "SubscriptionRenewal"; pair.invoice.subscription = renewalSub._id; pair.invoice.subscriptionPlan = plan._id; await pair.invoice.save();
    renewalSub.nextRenewalInvoice = pair.invoice._id; await renewalSub.save();
    await Invoice.collection.updateOne({ _id: pair.invoice._id }, { $set: { createdAt: new Date(now.getTime() - 4 * 86400000) } });
    const previousDays = process.env.SUBSCRIPTION_PAYMENT_REMINDER_DAYS;
    process.env.SUBSCRIPTION_PAYMENT_REMINDER_DAYS = "3,7";
    try { await generateDueReminders(now); } finally { process.env.SUBSCRIPTION_PAYMENT_REMINDER_DAYS = previousDays; }
    assert.equal(await SubscriptionReminder.countDocuments({ subscription: renewalSub._id, reminderType: "Renewal" }), 0);
    assert.equal(await SubscriptionReminder.countDocuments({ subscription: renewalSub._id, reminderType: "PaymentPending", reminderStage: "DAY_3" }), 1);

    const expirySub = await Subscription.create({ customerName: "Expiry Day", customerEmail: "expiry@example.com", plan: plan._id,
      planName: plan.name, durationMonths: plan.durationMonths, status: "Active", startDate: new Date("2025-07-01T03:00:00Z"),
      expiryDate: new Date("2026-01-01T00:00:00Z"), createdBy: new mongoose.Types.ObjectId() });
    await generateDueReminders(now);
    assert.equal((await Subscription.findById(expirySub._id)).status, "Active");
    assert.equal(await SubscriptionReminder.countDocuments({ subscription: expirySub._id, reminderType: "Expired", reminderStage: "EXPIRY" }), 1);
    await generateDueReminders(new Date("2026-01-02T03:00:00Z"));
    assert.equal((await Subscription.findById(expirySub._id)).status, "Expired");
    assert.equal(await SubscriptionReminder.countDocuments({ subscription: expirySub._id, reminderType: "Expired", reminderStage: "EXPIRY" }), 1);
  });

  await t.test("subscription update failure rolls back Payment and Invoice finalization", async () => {
    const pair = await createPair("subscription-rollback");
    const plan = await SubscriptionPlan.findOne();
    const subscription = await Subscription.create({ customerName: "Rollback", customerEmail: "rollback@example.com", plan: plan._id,
      planName: plan.name, durationMonths: plan.durationMonths, invoice: pair.invoice._id, status: "PendingPayment", createdBy: new mongoose.Types.ObjectId() });
    pair.invoice.invoiceType = "Subscription"; pair.invoice.subscriptionPlan = plan._id; pair.invoice.subscription = subscription._id; await pair.invoice.save();
    const original = Subscription.findOneAndUpdate; Subscription.findOneAndUpdate = () => Promise.resolve(null);
    try { await assert.rejects(finalizeSuccessfulPayment({ orderId: pair.payment.razorpayOrderId, paymentId: "pay_sub_rollback", amountPaise: 10000, currency: "INR" }), /Subscription was concurrently modified/); }
    finally { Subscription.findOneAndUpdate = original; }
    assert.equal((await Payment.findById(pair.payment._id)).status, "Created");
    assert.equal((await Invoice.findById(pair.invoice._id)).paymentStatus, "Unpaid");
    assert.equal((await Subscription.findById(subscription._id)).status, "PendingPayment");
  });
});
