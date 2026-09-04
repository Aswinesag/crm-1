const crypto = require("crypto");
const mongoose = require("mongoose");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const Subscription = require("../models/Subscription");
const SubscriptionReminder = require("../models/SubscriptionReminder");
const Invoice = require("../models/Invoice");
const { runSubscriptionReminderJob } = require("../services/subscriptionReminderService");

const text = (value, max) => String(value || "").trim().slice(0, max);
const emailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const invoiceNumber = () => `SUB-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const createPlan = async (req, res) => {
  try {
    const durationMonths = Number(req.body.durationMonths), amount = Number(req.body.amount);
    if (![6, 12].includes(durationMonths) || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Plan duration or amount is invalid" });
    const plan = await SubscriptionPlan.create({ name: text(req.body.name, 120), code: text(req.body.code, 40).toUpperCase(), durationMonths, amount: Math.round(amount * 100) / 100, description: text(req.body.description, 500), createdBy: req.user._id });
    return res.status(201).json({ success: true, data: plan });
  } catch (error) { return res.status(error.code === 11000 ? 409 : 500).json({ success: false, message: error.code === 11000 ? "Plan code already exists" : "Unable to create plan" }); }
};
const getPlans = async (req, res) => res.json({ success: true, data: await SubscriptionPlan.find(req.query.all === "true" ? {} : { isActive: true }).sort({ durationMonths: 1 }).lean() });

const buildInvoice = ({ plan, subscription, body, type, userId }) => {
  const now = new Date(); const number = invoiceNumber();
  return { invoiceNumber: number, invoiceDate: now, salesOrderNo: `SUBSCRIPTION-${subscription._id}`,
    customerName: subscription.customerName, customerEmail: subscription.customerEmail, customerContact: subscription.customerContact,
    gstin: text(body.gstin, 30).toUpperCase() || "UNREGISTERED", billingAddress: text(body.billingAddress, 1000), shippingAddress: text(body.shippingAddress || body.billingAddress, 1000),
    paymentTerms: "Due on receipt", dueDate: new Date(now.getTime() + 7 * 86400000),
    items: [{ productCode: plan.code, productName: plan.name, quantity: 1, unit: "Subscription", rate: plan.amount, discount: 0, gstPercent: 0, taxableAmount: plan.amount, gstAmount: 0, amount: plan.amount }],
    subtotal: plan.amount, cgst: 0, sgst: 0, igst: 0, freightCharges: 0, grandTotal: plan.amount, amountPaid: 0, balanceDue: plan.amount,
    paymentStatus: "Unpaid", currency: "INR", invoiceType: type, subscriptionPlan: plan._id, subscription: subscription._id, createdBy: userId };
};

const purchase = async (req, res) => {
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    if (!mongoose.isValidObjectId(req.body.planId)) throw Object.assign(new Error("Invalid plan ID"), { statusCode: 400 });
    const plan = await SubscriptionPlan.findOne({ _id: req.body.planId, isActive: true }).session(session);
    const customerEmail = text(req.body.customerEmail, 160).toLowerCase();
    if (!plan) throw Object.assign(new Error("Active plan not found"), { statusCode: 404 });
    if (!text(req.body.customerName, 160) || !emailValid(customerEmail) || !text(req.body.billingAddress, 1000)) throw Object.assign(new Error("Valid customer and billing details are required"), { statusCode: 400 });
    const subscription = await Subscription.create([{ customerName: text(req.body.customerName, 160), customerEmail, customerContact: text(req.body.customerContact, 30), plan: plan._id, planName: plan.name, durationMonths: plan.durationMonths, status: "PendingPayment", createdBy: req.user._id }], { session }).then((x) => x[0]);
    const invoice = await Invoice.create([buildInvoice({ plan, subscription, body: req.body, type: "Subscription", userId: req.user._id })], { session }).then((x) => x[0]);
    subscription.invoice = invoice._id; await subscription.save({ session }); result = { subscription, invoice };
  }); return res.status(201).json({ success: true, data: result });
  } catch (error) { return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Unable to create subscription" }); } finally { await session.endSession(); }
};

const renew = async (req, res) => {
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.body.planId)) throw Object.assign(new Error("Invalid identifier"), { statusCode: 400 });
    const subscription = await Subscription.findById(req.params.id).session(session); const plan = await SubscriptionPlan.findOne({ _id: req.body.planId, isActive: true }).session(session);
    if (!subscription || !plan) throw Object.assign(new Error("Subscription or plan not found"), { statusCode: 404 });
    if (subscription.nextRenewalInvoice && await Invoice.exists({ _id: subscription.nextRenewalInvoice, paymentStatus: { $ne: "Paid" } }).session(session)) throw Object.assign(new Error("An unpaid renewal invoice already exists"), { statusCode: 409 });
    const invoice = await Invoice.create([buildInvoice({ plan, subscription, body: { ...req.body, billingAddress: req.body.billingAddress || "Existing customer address" }, type: "SubscriptionRenewal", userId: req.user._id })], { session }).then((x) => x[0]);
    subscription.nextRenewalInvoice = invoice._id; if (subscription.status === "Expired") subscription.status = "RenewalPending"; subscription.updatedBy = req.user._id; await subscription.save({ session }); result = { subscription, invoice };
  }); return res.status(201).json({ success: true, data: result });
  } catch (error) { return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Unable to create renewal" }); } finally { await session.endSession(); }
};
const listSubscriptions = async (req, res) => res.json({ success: true, data: await Subscription.find().populate("plan", "name code amount currency").sort({ createdAt: -1 }).limit(200).lean() });
const listReminders = async (req, res) => res.json({ success: true, data: await SubscriptionReminder.find().sort({ createdAt: -1 }).limit(200).lean() });
const runReminders = async (req, res) => { try { await runSubscriptionReminderJob(); res.json({ success: true, message: "Reminder job completed" }); } catch { res.status(500).json({ success: false, message: "Reminder job failed" }); } };
module.exports = { createPlan, getPlans, purchase, renew, listSubscriptions, listReminders, runReminders };
