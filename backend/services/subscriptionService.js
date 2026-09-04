const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");

const addMonthsClamped = (dateValue, months) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime()) || ![6, 12].includes(months)) throw new Error("Invalid subscription period");
  const day = date.getUTCDate();
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
};

const applySubscriptionPayment = async ({ invoice, payment, paidAt, session }) => {
  if (!invoice || invoice.invoiceType === "Standard") return null;
  if (!invoice.subscription) throw new Error("Subscription invoice is missing its subscription reference");
  const subscription = await Subscription.findById(invoice.subscription).session(session);
  if (!subscription) throw new Error("Linked subscription not found");
  const plan = await SubscriptionPlan.findById(invoice.subscriptionPlan).session(session);
  if (!plan) throw new Error("Linked subscription plan not found");
  if (subscription.appliedPayments.some((id) => id.equals(payment._id))) return subscription;

  const activationDate = new Date(paidAt);
  const isRenewal = invoice.invoiceType === "SubscriptionRenewal";
  const baseDate = isRenewal && subscription.expiryDate && subscription.expiryDate > activationDate
    ? subscription.expiryDate : activationDate;
  const startDate = subscription.startDate || activationDate;
  const expiryDate = addMonthsClamped(baseDate, plan.durationMonths);
  const updated = await Subscription.findOneAndUpdate(
    { _id: subscription._id, appliedPayments: { $ne: payment._id } },
    { $set: { status: "Active", plan: plan._id, planName: plan.name, durationMonths: plan.durationMonths, startDate, expiryDate, latestPayment: payment._id, lastRenewedAt: isRenewal ? activationDate : subscription.lastRenewedAt, nextRenewalInvoice: null }, $addToSet: { appliedPayments: payment._id } },
    { new: true, runValidators: true, session }
  );
  if (!updated) {
    const current = await Subscription.findById(subscription._id).session(session);
    if (!current?.appliedPayments.some((id) => id.equals(payment._id))) throw new Error("Subscription was concurrently modified");
    return current;
  }
  return updated;
};

module.exports = { addMonthsClamped, applySubscriptionPayment };
