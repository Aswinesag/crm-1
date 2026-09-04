const Subscription = require("../models/Subscription");
const SubscriptionReminder = require("../models/SubscriptionReminder");
const Invoice = require("../models/Invoice");
const sendEmail = require("../utils/sendEmail");

const STAGES = [60, 30, 15, 7, 3, 1];
const dayMs = 86400000;
const IST_OFFSET_MS = 330 * 60000;
const cycleKey = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
const businessDay = (value) => Math.floor((new Date(value).getTime() + IST_OFFSET_MS) / dayMs);
const daysRemaining = (expiry, now) => businessDay(expiry) - businessDay(now);
const selectRenewalStage = (remaining) => remaining <= 0 ? "EXPIRY" : ([...STAGES].reverse().find((days) => remaining <= days) ? `${[...STAGES].reverse().find((days) => remaining <= days)}_DAY` : null);
const pendingDays = () => String(process.env.SUBSCRIPTION_PAYMENT_REMINDER_DAYS || "3,7")
  .split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0 && n <= 90).sort((a, b) => a - b);

const upsertReminder = (data) => SubscriptionReminder.updateOne(
  { subscription: data.subscription, reminderType: data.reminderType, reminderStage: data.reminderStage, cycleKey: data.cycleKey },
  { $setOnInsert: data }, { upsert: true }
).catch((error) => { if (error.code !== 11000) throw error; });

const generateDueReminders = async (now = new Date()) => {
  const active = await Subscription.find({ status: "Active", expiryDate: { $ne: null, $lte: new Date(now.getTime() + 60 * dayMs) } }).lean();
  for (const sub of active) {
    const remaining = daysRemaining(sub.expiryDate, now);
    if (remaining < 0) {
      const changed = await Subscription.updateOne({ _id: sub._id, status: "Active", expiryDate: sub.expiryDate }, { $set: { status: "Expired" } });
      if (changed.modifiedCount) await upsertReminder({ subscription: sub._id, customerName: sub.customerName, customerEmail: sub.customerEmail, reminderType: "Expired", reminderStage: "EXPIRY", cycleKey: cycleKey(sub.expiryDate), scheduledFor: now });
    } else if (remaining === 0) {
      await upsertReminder({ subscription: sub._id, customerName: sub.customerName, customerEmail: sub.customerEmail, reminderType: "Expired", reminderStage: "EXPIRY", cycleKey: cycleKey(sub.expiryDate), scheduledFor: now });
    } else {
      const hasUnpaidRenewal = sub.nextRenewalInvoice && await Invoice.exists({
        _id: sub.nextRenewalInvoice,
        invoiceType: "SubscriptionRenewal",
        paymentStatus: { $ne: "Paid" },
        subscription: sub._id,
      });
      if (hasUnpaidRenewal) continue;
      const stage = selectRenewalStage(remaining);
      if (stage) await upsertReminder({ subscription: sub._id, customerName: sub.customerName, customerEmail: sub.customerEmail, reminderType: "Renewal", reminderStage: stage, cycleKey: cycleKey(sub.expiryDate), scheduledFor: now });
    }
  }

  const renewals = await Invoice.find({ invoiceType: "SubscriptionRenewal", paymentStatus: { $ne: "Paid" }, subscription: { $ne: null } }).lean();
  for (const invoice of renewals) {
    const age = Math.floor((now - invoice.createdAt) / dayMs);
    const stage = [...pendingDays()].reverse().find((days) => age >= days);
    if (!stage) continue;
    const sub = await Subscription.findById(invoice.subscription).lean();
    if (!sub || !["Active", "Expired", "RenewalPending"].includes(sub.status)) continue;
    await upsertReminder({ subscription: sub._id, customerName: sub.customerName, customerEmail: sub.customerEmail, reminderType: "PaymentPending", reminderStage: `DAY_${stage}`, cycleKey: String(invoice._id), scheduledFor: now, relatedInvoice: invoice._id });
  }
};

const emailText = (reminder, invoice) => {
  if (reminder.reminderType === "PaymentPending") return `Hello ${reminder.customerName}, payment for renewal invoice ${invoice?.invoiceNumber || ""} is pending. Amount due: INR ${invoice?.balanceDue || 0}. Please complete payment through the approved CRM workflow.`;
  if (reminder.reminderType === "Expired") return `Hello ${reminder.customerName}, your subscription expired on ${reminder.cycleKey}. Please contact us to renew.`;
  return `Hello ${reminder.customerName}, your subscription is approaching expiry on ${reminder.cycleKey}. Please contact us to arrange renewal.`;
};

const processDueReminders = async (now = new Date(), sender = sendEmail) => {
  for (let count = 0; count < 100; count += 1) {
    const reminder = await SubscriptionReminder.findOneAndUpdate(
      { scheduledFor: { $lte: now }, attempts: { $lt: 3 }, $or: [{ status: "Pending" }, { status: "Failed" }, { status: "Processing", leaseUntil: { $lte: now } }] },
      { $set: { status: "Processing", leaseUntil: new Date(now.getTime() + 5 * 60000), lastAttemptAt: now }, $inc: { attempts: 1 } },
      { new: true, sort: { scheduledFor: 1 } }
    );
    if (!reminder) break;
    try {
      const invoice = reminder.relatedInvoice ? await Invoice.findById(reminder.relatedInvoice).lean() : null;
      if (invoice?.paymentStatus === "Paid") { reminder.status = "Sent"; reminder.sentAt = now; reminder.failureReason = "Suppressed because invoice is paid"; }
      else { await sender({ to: reminder.customerEmail, subject: reminder.reminderType === "PaymentPending" ? "Subscription renewal payment pending" : "Subscription renewal reminder", text: emailText(reminder, invoice) }); reminder.status = "Sent"; reminder.sentAt = now; reminder.failureReason = ""; }
    } catch { reminder.status = "Failed"; reminder.failureReason = "Email delivery failed"; }
    reminder.leaseUntil = null; await reminder.save();
  }
};

const runSubscriptionReminderJob = async () => { const now = new Date(); await generateDueReminders(now); await processDueReminders(now); };
module.exports = { STAGES, selectRenewalStage, generateDueReminders, processDueReminders, runSubscriptionReminderJob };
