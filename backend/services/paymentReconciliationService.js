const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const RazorpayWebhookEvent = require("../models/RazorpayWebhookEvent");
const { getRazorpayClient } = require("./razorpayClient");
const { applySubscriptionPayment } = require("./subscriptionService");

class ReconciliationError extends Error {
  constructor(message, statusCode = 409, permanent = true) {
    super(message);
    this.name = "ReconciliationError";
    this.statusCode = statusCode;
    this.permanent = permanent;
  }
}

const publicPayment = (payment) => ({
  id: String(payment._id),
  invoice: payment.invoice ? String(payment.invoice._id || payment.invoice) : null,
  invoiceNumber: payment.invoiceNumber,
  customerName: payment.customerName,
  customerEmail: payment.customerEmail || "",
  customerContact: payment.customerContact || "",
  amount: payment.amount,
  amountPaise: payment.amountPaise,
  currency: payment.currency,
  receipt: payment.receipt,
  razorpayOrderId: payment.razorpayOrderId,
  razorpayPaymentId: payment.razorpayPaymentId || "",
  status: payment.status,
  signatureVerified: payment.signatureVerified,
  verifiedAt: payment.verifiedAt,
  paidAt: payment.paidAt,
  verificationAttempts: payment.verificationAttempts,
  lastReconciledAt: payment.lastReconciledAt,
  reconciliationAttempts: payment.reconciliationAttempts,
  reconciliationStatus: payment.reconciliationStatus,
  retryAllowed: payment.retryAllowed,
  attemptExpiresAt: payment.attemptExpiresAt,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

const validateAuthoritativePayment = (payment, { amountPaise, currency }) => {
  if (amountPaise !== undefined && payment.amountPaise !== amountPaise) {
    throw new ReconciliationError("Webhook payment amount does not match the local order");
  }
  if (currency !== undefined && payment.currency !== currency) {
    throw new ReconciliationError("Webhook payment currency does not match the local order");
  }
};

const markWebhookProcessed = async (webhookEventId, session) => {
  if (!webhookEventId) return;
  const result = await RazorpayWebhookEvent.updateOne(
    { _id: webhookEventId, status: "Processing" },
    { $set: { status: "Processed", processedAt: new Date(), processingError: "", leaseUntil: null } },
    { session }
  );
  if (result.modifiedCount !== 1) {
    throw new ReconciliationError("Webhook event processing lease was lost", 409, false);
  }
};

const finalizeSuccessfulPayment = async ({
  orderId,
  paymentId,
  amountPaise,
  currency,
  paidAt = new Date(),
  webhookEventId = null,
}) => {
  const session = await mongoose.startSession();
  let result;
  let idempotent = false;
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findOne({ razorpayOrderId: orderId }).session(session);
      if (!payment) throw new ReconciliationError("No local payment exists for this Razorpay order", 404);

      validateAuthoritativePayment(payment, { amountPaise, currency });
      if (payment.status === "Paid") {
        if (payment.razorpayPaymentId !== paymentId) {
          throw new ReconciliationError("Payment order is already linked to another payment");
        }
        if (payment.invoice) {
          const invoice = await Invoice.findById(payment.invoice).session(session);
          if (!invoice || invoice.paymentStatus !== "Paid" || invoice.balanceDue !== 0 || invoice.amountPaid !== payment.amount) {
            throw new ReconciliationError("Paid payment and linked invoice require reconciliation", 422);
          }
        }
        idempotent = true;
        result = payment;
        await markWebhookProcessed(webhookEventId, session);
        return;
      }

      if (!payment.invoice) {
        const updatedLegacy = await Payment.findOneAndUpdate(
          { _id: payment._id, status: { $in: ["Created", "Retryable"] }, razorpayPaymentId: { $exists: false } },
          { $set: { razorpayPaymentId: paymentId, status: "Paid", signatureVerified: true, verifiedAt: paidAt, paidAt, lastVerificationError: "", reconciliationStatus: "Captured", retryAllowed: false, retryReason: "", lastReconciledAt: new Date() }, $inc: { verificationAttempts: 1 } },
          { new: true, runValidators: true, session }
        );
        if (!updatedLegacy) throw new ReconciliationError("Payment was concurrently finalized", 409, false);
        result = updatedLegacy;
        await markWebhookProcessed(webhookEventId, session);
        return;
      }

      const invoice = await Invoice.findById(payment.invoice).session(session);
      if (!invoice) throw new ReconciliationError("Linked invoice not found", 422);
      if (invoice.paymentStatus === "Paid" || invoice.amountPaid !== 0 ||
          invoice.balanceDue !== payment.amount || invoice.grandTotal !== payment.amount) {
        throw new ReconciliationError("Invoice financial state requires reconciliation", 422);
      }

      const paidPayment = await Payment.findOneAndUpdate(
        { _id: payment._id, status: { $in: ["Created", "Retryable"] }, razorpayPaymentId: { $exists: false } },
        { $set: { razorpayPaymentId: paymentId, status: "Paid", signatureVerified: true, verifiedAt: paidAt, paidAt, lastVerificationError: "", reconciliationStatus: "Captured", retryAllowed: false, retryReason: "", lastReconciledAt: new Date() }, $inc: { verificationAttempts: 1 } },
        { new: true, runValidators: true, session }
      );
      if (!paidPayment) throw new ReconciliationError("Payment was concurrently finalized", 409, false);

      const paidInvoice = await Invoice.findOneAndUpdate(
        { _id: invoice._id, paymentStatus: { $in: ["Unpaid", "Overdue"] }, amountPaid: 0, balanceDue: payment.amount },
        { $set: { amountPaid: payment.amount, balanceDue: 0, paymentStatus: "Paid", lastPaymentDate: paidAt }, $addToSet: { paymentReferences: payment._id } },
        { new: true, runValidators: true, session }
      );
      if (!paidInvoice) throw new ReconciliationError("Invoice was concurrently modified", 409, false);
      await applySubscriptionPayment({ invoice: paidInvoice, payment: paidPayment, paidAt, session });
      result = paidPayment;
      await markWebhookProcessed(webhookEventId, session);
    });
    return { payment: result, idempotent };
  } catch (error) {
    const localPayment = await Payment.findOne({ razorpayOrderId: orderId });
    const competingPaid = localPayment?.invoice
      ? await Payment.exists({ invoice: localPayment.invoice, status: "Paid", _id: { $ne: localPayment._id } })
      : null;
    if (competingPaid || error?.code === 11000) {
      if (localPayment && localPayment.status !== "Paid") {
        await Payment.updateOne(
          { _id: localPayment._id, status: { $ne: "Paid" } },
          { $set: { reconciliationStatus: "ManualReview", retryAllowed: false, retryReason: "Another payment already finalized this invoice", lastReconciledAt: new Date() } }
        );
      }
      throw new ReconciliationError("Another successful payment already exists for this invoice", 409);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

const getAttemptStaleMinutes = () => {
  const value = Number.parseInt(process.env.PAYMENT_ATTEMPT_STALE_MINUTES, 10);
  return Number.isInteger(value) && value >= 5 && value <= 10080 ? value : 30;
};

const markReconciliation = (id, values) => Payment.findByIdAndUpdate(
  id,
  { $set: { ...values, lastReconciledAt: new Date() } },
  { new: true, runValidators: true }
);

const reconcilePaymentAttempt = async (paymentId, options = {}) => {
  if (!mongoose.isValidObjectId(paymentId)) throw new ReconciliationError("Invalid payment ID", 400);
  let payment = await Payment.findById(paymentId);
  if (!payment) throw new ReconciliationError("Payment not found", 404);
  if (payment.status === "Paid") return { outcome: "Paid", payment, retryAllowed: false, idempotent: true };
  const priorRetryAllowed = payment.status === "Retryable" ? payment.retryAllowed : false;
  const priorRetryReason = payment.status === "Retryable" ? payment.retryReason : "";

  const now = options.now || new Date();
  const claimCutoff = new Date(now.getTime() - 120000);
  payment = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $in: ["Created", "Retryable"] }, $or: [{ reconciliationStatus: { $ne: "Checking" } }, { lastReconciledAt: { $lte: claimCutoff } }] },
    { $set: { reconciliationStatus: "Checking", lastReconciledAt: now, retryAllowed: false, retryReason: "" }, $inc: { reconciliationAttempts: 1 } },
    { new: true, runValidators: true }
  );
  if (!payment) throw new ReconciliationError("Payment reconciliation is already in progress", 409, false);

  let response;
  try {
    const client = options.razorpayClient || getRazorpayClient();
    response = await client.orders.fetchPayments(payment.razorpayOrderId);
  } catch (error) {
    await markReconciliation(payment._id, {
      reconciliationStatus: "Error",
      retryAllowed: payment.status === "Retryable" ? priorRetryAllowed : false,
      retryReason: payment.status === "Retryable" ? priorRetryReason : "Razorpay lookup temporarily failed",
    });
    const dependencyError = new ReconciliationError("Unable to query Razorpay payment state", 503, false);
    dependencyError.cause = error;
    throw dependencyError;
  }

  const items = Array.isArray(response?.items) ? response.items : [];
  const associated = items.filter((item) => item && item.order_id === payment.razorpayOrderId);
  const captured = associated.filter((item) => item.status === "captured");
  if (captured.length) {
    const matching = captured.filter((item) => item.amount === payment.amountPaise && item.currency === payment.currency);
    if (captured.length !== 1 || matching.length !== 1 || !matching[0].id) {
      payment = await markReconciliation(payment._id, { reconciliationStatus: "ManualReview", retryAllowed: false, retryReason: "Captured payment conflicts with local financial data" });
      throw new ReconciliationError("Captured Razorpay payment requires manual review", 409);
    }
    const entity = matching[0];
    const paidAt = Number.isSafeInteger(entity.created_at) ? new Date(entity.created_at * 1000) : now;
    const result = await finalizeSuccessfulPayment({ orderId: payment.razorpayOrderId, paymentId: entity.id, amountPaise: entity.amount, currency: entity.currency, paidAt });
    return { outcome: "Paid", payment: result.payment, retryAllowed: false, idempotent: result.idempotent };
  }

  if (associated.some((item) => item.status === "authorized" || item.status === "created")) {
    payment = await markReconciliation(payment._id, { reconciliationStatus: "Active", retryAllowed: false, retryReason: "Razorpay payment is awaiting capture or completion" });
    return { outcome: "Active", payment, retryAllowed: false };
  }
  if (associated.some((item) => item.status === "refunded")) {
    payment = await markReconciliation(payment._id, { reconciliationStatus: "ManualReview", retryAllowed: false, retryReason: "Refund reconciliation is not supported" });
    return { outcome: "ManualReview", payment, retryAllowed: false };
  }

  const failedOnly = associated.length > 0 && associated.every((item) => item.status === "failed");
  const expiresAt = payment.attemptExpiresAt || new Date(payment.createdAt.getTime() + getAttemptStaleMinutes() * 60000);
  const staleWithNoPayments = associated.length === 0 && now >= expiresAt;
  if (failedOnly || staleWithNoPayments) {
    const reason = failedOnly ? "All Razorpay payment attempts failed" : "No Razorpay payment was found before the attempt expired";
    payment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $in: ["Created", "Retryable"] } },
      { $set: { status: "Retryable", reconciliationStatus: "Retryable", retryAllowed: true, retryReason: reason, lastReconciledAt: now } },
      { new: true, runValidators: true }
    );
    if (!payment) throw new ReconciliationError("Payment state changed during reconciliation", 409, false);
    return { outcome: "Retryable", payment, retryAllowed: true };
  }

  if (payment.status === "Retryable" && associated.length === 0) {
    payment = await markReconciliation(payment._id, { reconciliationStatus: "Retryable", retryAllowed: true, retryReason: "No captured Razorpay payment was found" });
    return { outcome: "Retryable", payment, retryAllowed: true };
  }

  payment = await markReconciliation(payment._id, { reconciliationStatus: "Active", retryAllowed: false, retryReason: "Payment attempt is still within its active period", attemptExpiresAt: expiresAt });
  return { outcome: "Active", payment, retryAllowed: false };
};

const reconcileInvoiceAttempts = async (invoiceId, options = {}) => {
  const [retryableAttempts, createdAttempt] = await Promise.all([
    Payment.find({ invoice: invoiceId, status: "Retryable" }).sort({ createdAt: -1 }).limit(5),
    Payment.findOne({ invoice: invoiceId, status: "Created" }).sort({ createdAt: -1 }),
  ]);
  const attempts = [...retryableAttempts, ...(createdAttempt ? [createdAttempt] : [])];
  for (const attempt of attempts) {
    const result = await reconcilePaymentAttempt(attempt._id, options);
    if (result.outcome === "Paid" || !result.retryAllowed) return { ...result, attemptId: String(attempt._id) };
  }
  return { outcome: "Clear", retryAllowed: true };
};

module.exports = { ReconciliationError, finalizeSuccessfulPayment, reconcilePaymentAttempt, reconcileInvoiceAttempts, getAttemptStaleMinutes, publicPayment };
