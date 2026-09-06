const crypto = require("crypto");
const mongoose = require("mongoose");
const AccountsPayable = require("../models/AccountsPayable");
const SupplierPayment = require("../models/SupplierPayment");
const PurchaseBill = require("../models/PurchaseBill");
const Vendor = require("../models/Vendor");
const { toMinor } = require("./purchaseBillService");
const { decorate } = require("./accountsPayableService");

const fail = (message, statusCode = 400, code) => Object.assign(new Error(message), { statusCode, businessCode: code });
const normalize = (value) => String(value || "").trim().toUpperCase();
const makeNumber = () => `SP-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
const paymentStatus = (ap) => ap.outstandingAmountMinor === 0 ? "PAID" : ap.paidAmountMinor > 0 ? "PARTIALLY_PAID" : "UNPAID";
const apStatus = (ap) => ap.outstandingAmountMinor === 0 ? "PAID" : ap.paidAmountMinor > 0 ? "PARTIALLY_PAID" : "OPEN";
const validateHeader = async (input, session) => {
  if (!mongoose.isValidObjectId(input.supplier) || !(await Vendor.exists({ _id: input.supplier }).session(session || null))) throw fail("Valid supplier is required");
  const methods = ["BANK_TRANSFER", "CHEQUE", "CASH", "UPI", "OTHER"]; if (!methods.includes(input.paymentMethod)) throw fail("Valid payment method is required");
  const reference = normalize(input.referenceNumber); if (["BANK_TRANSFER", "CHEQUE", "UPI"].includes(input.paymentMethod) && !reference) throw fail("Reference number is required for this payment method");
  const idempotencyKey = String(input.idempotencyKey || "").trim(); if (!idempotencyKey) throw fail("Idempotency key is required"); if (idempotencyKey.length > 200) throw fail("Idempotency key is too long");
  const totalAmountMinor = toMinor(input.totalAmount, "Total payment amount"); if (totalAmountMinor <= 0) throw fail("Total payment amount must be positive");
  if (!Array.isArray(input.allocations) || !input.allocations.length) throw fail("At least one payment allocation is required");
  return { reference, idempotencyKey, totalAmountMinor };
};
const loadAllocations = async (input, totalAmountMinor, session) => {
  const seen = new Set(), requested = [];
  for (const allocation of input.allocations) { const id = String(allocation.accountsPayable || ""); if (!mongoose.isValidObjectId(id) || seen.has(id)) throw fail("Each valid Accounts Payable may be allocated only once"); seen.add(id); const amountMinor = toMinor(allocation.amount, "Allocation amount"); if (amountMinor <= 0) throw fail("Allocation amount must be positive"); requested.push({ id, amountMinor }); }
  if (requested.reduce((sum, allocation) => sum + allocation.amountMinor, 0) !== totalAmountMinor) throw fail("Payment must be fully allocated and allocations must equal the total amount");
  requested.sort((a, b) => a.id.localeCompare(b.id));
  if (session) for (const allocation of requested) { const lock = await AccountsPayable.updateOne({ _id: allocation.id }, { $inc: { paymentVersion: 1 } }, { session }); if (!lock.matchedCount) throw fail("Accounts Payable not found", 404); }
  const rows = await AccountsPayable.find({ _id: { $in: requested.map((allocation) => allocation.id) } }).populate("purchaseBill").session(session || null); const byId = new Map(rows.map((row) => [String(row._id), row]));
  return requested.map((allocation) => { const ap = byId.get(allocation.id); if (!ap) throw fail("Accounts Payable not found", 404); const bill = ap.purchaseBill; if (!bill || bill.status !== "APPROVED") throw fail("Only approved Purchase Bills can be paid", 409, "INVALID_BILL_STATUS"); if (String(ap.supplier) !== String(input.supplier) || String(bill.supplier) !== String(input.supplier)) throw fail("All allocations must belong to the selected supplier", 409, "SUPPLIER_MISMATCH"); if (ap.currency !== (input.currency || "INR") || bill.currency !== ap.currency) throw fail("Payment currency must match the payable", 409); if (ap.status === "CANCELLED" || ap.outstandingAmountMinor <= 0) throw fail("Accounts Payable has no outstanding balance", 409); if (allocation.amountMinor > ap.outstandingAmountMinor) throw fail(`Allocation exceeds outstanding amount for ${bill.billNumber}`, 409, "OVERPAYMENT"); return { ...allocation, ap, bill }; });
};
const create = async (input, userId) => {
  const existingKey = String(input.idempotencyKey || "").trim(); if (existingKey) { const existing = await SupplierPayment.findOne({ idempotencyKey: existingKey }); if (existing) return { payment: existing, idempotent: true }; }
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    const header = await validateHeader(input, session); const existing = await SupplierPayment.findOne({ idempotencyKey: header.idempotencyKey }).session(session); if (existing) { result = { payment: existing, idempotent: true }; return; }
    const allocations = await loadAllocations(input, header.totalAmountMinor, session); const payment = new SupplierPayment({ paymentNumber: makeNumber(), supplier: input.supplier, paymentDate: input.paymentDate || new Date(), currency: input.currency || "INR", paymentMethod: input.paymentMethod, referenceNumber: String(input.referenceNumber || "").trim(), normalizedReferenceNumber: header.reference, totalAmountMinor: header.totalAmountMinor, allocatedAmountMinor: header.totalAmountMinor, unallocatedAmountMinor: 0, idempotencyKey: header.idempotencyKey, notes: input.notes || "", recordedBy: userId, auditTrail: [{ action: "CREATED", actor: userId }, { action: "ALLOCATED", actor: userId }] });
    payment.allocations = allocations.map(({ ap, bill, amountMinor }) => ({ accountsPayable: ap._id, purchaseBill: bill._id, amountMinor, billNumberSnapshot: bill.billNumber, supplierInvoiceNumberSnapshot: bill.supplierInvoiceNumber, dueDateSnapshot: ap.dueDate, outstandingBeforeMinor: ap.outstandingAmountMinor, outstandingAfterMinor: ap.outstandingAmountMinor - amountMinor }));
    for (const { ap, bill, amountMinor } of allocations) { ap.paidAmountMinor += amountMinor; ap.outstandingAmountMinor -= amountMinor; ap.status = apStatus(ap); ap.closedAt = ap.status === "PAID" ? new Date() : null; ap.auditTrail.push({ action: ap.status === "PAID" ? "PAID" : "PARTIAL_PAYMENT", actor: userId, payment: payment._id, amountMinor }); await ap.save({ session }); await PurchaseBill.updateOne({ _id: bill._id, status: "APPROVED", grandTotalMinor: ap.originalAmountMinor }, { $set: { accountsPayable: ap._id, paidAmountMinor: ap.paidAmountMinor, outstandingAmountMinor: ap.outstandingAmountMinor, paymentStatus: paymentStatus(ap) } }, { session }); }
    await payment.save({ session }); result = { payment, idempotent: false };
  }); return result; } catch (error) { if (error?.code === 11000 && existingKey) { const existing = await SupplierPayment.findOne({ idempotencyKey: existingKey }); if (existing) return { payment: existing, idempotent: true }; } throw error; } finally { await session.endSession(); }
};
const reverse = async (id, userId, reason) => {
  if (!mongoose.isValidObjectId(id)) throw fail("Invalid Supplier Payment ID"); if (!String(reason || "").trim()) throw fail("Reversal reason is required"); const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    const payment = await SupplierPayment.findById(id).session(session); if (!payment) throw fail("Supplier Payment not found", 404); if (payment.status === "REVERSED") { result = { payment, alreadyReversed: true }; return; } if (payment.accountingPostingReference) throw fail("Payment linked to downstream accounting cannot be reversed here", 409);
    const ids = payment.allocations.map((allocation) => String(allocation.accountsPayable)).sort(); for (const apId of ids) { const lock = await AccountsPayable.updateOne({ _id: apId }, { $inc: { paymentVersion: 1 } }, { session }); if (!lock.matchedCount) throw fail("Referenced Accounts Payable no longer exists", 409); }
    const aps = await AccountsPayable.find({ _id: { $in: ids } }).session(session); const byId = new Map(aps.map((ap) => [String(ap._id), ap]));
    for (const allocation of payment.allocations) { const ap = byId.get(String(allocation.accountsPayable)); if (!ap || ap.paidAmountMinor < allocation.amountMinor) throw fail("Payment reversal cannot restore payable safely", 409); ap.paidAmountMinor -= allocation.amountMinor; ap.outstandingAmountMinor += allocation.amountMinor; if (ap.outstandingAmountMinor > ap.originalAmountMinor) throw fail("Payment reversal would exceed the original payable", 409); ap.status = apStatus(ap); ap.closedAt = null; ap.auditTrail.push({ action: "PAYMENT_REVERSED", actor: userId, payment: payment._id, amountMinor: allocation.amountMinor, reason: String(reason).trim() }); await ap.save({ session }); await PurchaseBill.updateOne({ _id: allocation.purchaseBill, status: "APPROVED" }, { $set: { paidAmountMinor: ap.paidAmountMinor, outstandingAmountMinor: ap.outstandingAmountMinor, paymentStatus: paymentStatus(ap) } }, { session }); }
    payment.status = "REVERSED"; payment.reversedAt = new Date(); payment.reversedBy = userId; payment.reversalReason = String(reason).trim(); payment.auditTrail.push({ action: "REVERSED", actor: userId, reason: String(reason).trim() }); await payment.save({ session }); result = { payment, alreadyReversed: false };
  }); return result; } finally { await session.endSession(); }
};
const preview = async (input) => { const header = await validateHeader(input); const allocations = await loadAllocations(input, header.totalAmountMinor); return { totalAmountMinor: header.totalAmountMinor, allocatedAmountMinor: header.totalAmountMinor, unallocatedAmountMinor: 0, allocations: allocations.map(({ ap, bill, amountMinor }) => ({ accountsPayable: decorate(ap), purchaseBill: { _id: bill._id, billNumber: bill.billNumber, supplierInvoiceNumber: bill.supplierInvoiceNumber }, amountMinor, postPaymentOutstandingMinor: ap.outstandingAmountMinor - amountMinor })) }; };
const list = async (query = {}) => { const page = Math.max(1, Number(query.page) || 1), limit = Math.min(100, Math.max(1, Number(query.limit) || 10)), filter = {}; if (query.supplier && mongoose.isValidObjectId(query.supplier)) filter.supplier = query.supplier; if (query.status) filter.status = query.status; if (query.paymentMethod) filter.paymentMethod = query.paymentMethod; if (query.search) filter.$or = [{ paymentNumber: { $regex: query.search, $options: "i" } }, { referenceNumber: { $regex: query.search, $options: "i" } }]; const [data, total] = await Promise.all([SupplierPayment.find(filter).populate("supplier", "vendorCode vendorName").sort({ paymentDate: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit), SupplierPayment.countDocuments(filter)]); return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }; };
const detail = async (id) => { if (!mongoose.isValidObjectId(id)) throw fail("Invalid Supplier Payment ID"); const payment = await SupplierPayment.findById(id).populate("supplier", "vendorCode vendorName email").populate("recordedBy reversedBy auditTrail.actor", "name email").populate({ path: "allocations.accountsPayable", populate: { path: "purchaseBill", select: "billNumber supplierInvoiceNumber" } }); if (!payment) throw fail("Supplier Payment not found", 404); return payment; };

module.exports = { fail, normalize, create, reverse, preview, list, detail };
