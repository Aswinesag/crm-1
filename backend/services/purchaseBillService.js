const crypto = require("crypto");
const mongoose = require("mongoose");
const PurchaseBill = require("../models/PurchaseBill");
const PurchaseOrder = require("../models/PurchaseOrder");
const GRN = require("../models/grn/grnModel");

const fail = (message, statusCode = 400, code) => Object.assign(new Error(message), { statusCode, businessCode: code });
const normalizeInvoice = (value) => String(value || "").trim().toUpperCase();
const toMinor = (value, field = "amount") => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw fail(`${field} must be a non-negative number`);
  return Math.round((number + Number.EPSILON) * 100);
};
const fromMinor = (value) => Number(value || 0) / 100;
const roundQty = (value) => Math.round((Number(value) + Number.EPSILON) * 1e6) / 1e6;
const makeNumber = () => `PB-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
const tolerancePercent = () => {
  const value = Number(process.env.PURCHASE_BILL_PRICE_TOLERANCE_PERCENT || 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
};
const addAudit = (bill, action, userId, reason = "") => bill.auditTrail.push({ action, user: userId, reason });

const calculateLine = (quantity, unitPrice, discount = 0, tax = 0) => {
  const unitPriceMinor = toMinor(unitPrice, "Unit price");
  const discountMinor = toMinor(discount, "Discount");
  const taxMinor = toMinor(tax, "Tax");
  const subtotalMinor = Math.round(quantity * unitPriceMinor);
  if (discountMinor > subtotalMinor) throw fail("Line discount cannot exceed line subtotal");
  return { unitPriceMinor, discountMinor, taxMinor, subtotalMinor, totalMinor: subtotalMinor - discountMinor + taxMinor };
};

const prepareLines = (po, incomingLines) => {
  if (!Array.isArray(incomingLines) || incomingLines.length === 0) throw fail("At least one bill line is required");
  const seen = new Set();
  return incomingLines.map((incoming) => {
    const key = String(incoming.poLineId || "");
    if (!mongoose.isValidObjectId(key) || seen.has(key)) throw fail("Each valid PO line may appear only once", 400, "INVALID_PO_LINE");
    seen.add(key);
    const poLine = po.items.id(key);
    if (!poLine) throw fail("Bill line does not belong to the Purchase Order", 400, "INVALID_PO_LINE");
    const quantity = roundQty(incoming.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) throw fail("Bill quantity must be positive");
    const amounts = calculateLine(quantity, incoming.unitPrice, incoming.discount || 0, incoming.tax || 0);
    return { poLineId: poLine._id, itemType: poLine.itemType, item: poLine.item?._id || poLine.item, itemCodeSnapshot: poLine.itemCodeSnapshot || poLine.item?.productCode || poLine.item?.materialCode || poLine.item?.componentCode || "", itemNameSnapshot: poLine.itemNameSnapshot || poLine.item?.productName || poLine.item?.materialName || poLine.item?.componentName || "", unitSnapshot: poLine.unitSnapshot || "", quantity, ...amounts };
  });
};

const setTotals = (bill) => {
  bill.subtotalMinor = bill.lines.reduce((sum, line) => sum + line.subtotalMinor, 0);
  bill.discountTotalMinor = bill.lines.reduce((sum, line) => sum + line.discountMinor, 0);
  bill.taxTotalMinor = bill.lines.reduce((sum, line) => sum + line.taxMinor, 0);
  bill.grandTotalMinor = bill.lines.reduce((sum, line) => sum + line.totalMinor, 0);
};

const validateHeader = async (input, session) => {
  if (!mongoose.isValidObjectId(input.purchaseOrder)) throw fail("Valid Purchase Order is required");
  const po = await PurchaseOrder.findById(input.purchaseOrder).populate("items.item").session(session || null);
  if (!po) throw fail("Purchase Order not found", 404);
  if (po.status === "CANCELLED") throw fail("Cancelled Purchase Orders cannot be billed", 409, "PO_CANCELLED");
  if (!['APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED'].includes(po.status)) throw fail("Purchase Order is not approved for billing", 409);
  if (!mongoose.isValidObjectId(input.supplier) || String(input.supplier) !== String(po.vendorId)) throw fail("Supplier must match the Purchase Order", 409, "SUPPLIER_MISMATCH");
  if (input.currency && input.currency !== "INR") throw fail("Only INR Purchase Bills are supported");
  return po;
};

const computeMatch = async (bill, po, session, userId) => {
  const [grns, otherBills] = await Promise.all([
    GRN.find({ purchaseOrder: po._id, status: "Posted", postingState: "Posted" }).session(session || null),
    PurchaseBill.find({ purchaseOrder: po._id, _id: { $ne: bill._id }, reservationActive: true }).session(session || null),
  ]);
  const received = new Map(), billed = new Map();
  for (const grn of grns) for (const line of grn.items) received.set(String(line.poLineId), roundQty((received.get(String(line.poLineId)) || 0) + Number(line.acceptedQuantity || 0)));
  for (const other of otherBills) for (const line of other.lines) billed.set(String(line.poLineId), roundQty((billed.get(String(line.poLineId)) || 0) + Number(line.quantity || 0)));
  let quantityMatched = true, priceMatched = true, totalExceptions = 0, hasQuantityException = false;
  const tolerance = tolerancePercent();
  bill.lines.forEach((line) => {
    const poLine = po.items.id(line.poLineId); const reasons = [];
    if (!poLine) reasons.push({ code: "INVALID_PO_LINE", message: "Purchase Order line no longer exists" });
    else if (poLine.itemType !== line.itemType || String(poLine.item) !== String(line.item)) reasons.push({ code: "ITEM_IDENTITY_MISMATCH", message: "Bill item identity no longer matches the Purchase Order line" });
    const orderedQuantity = Number(poLine?.quantity || 0), receivedQuantity = received.get(String(line.poLineId)) || 0, previouslyBilledQuantity = billed.get(String(line.poLineId)) || 0;
    const remainingBillableQuantity = roundQty(Math.max(0, receivedQuantity - previouslyBilledQuantity));
    if (receivedQuantity === 0) reasons.push({ code: "NO_RECEIPT", message: "No accepted quantity has been posted for this PO line" });
    if (line.quantity > orderedQuantity) reasons.push({ code: "QUANTITY_EXCEEDS_PO", message: `Bill quantity exceeds ordered quantity by ${roundQty(line.quantity - orderedQuantity)}` });
    if (line.quantity > remainingBillableQuantity) {
      reasons.push({ code: "QUANTITY_EXCEEDS_RECEIPT", message: `Bill quantity exceeds remaining received quantity by ${roundQty(line.quantity - remainingBillableQuantity)}` });
      if (previouslyBilledQuantity > 0) reasons.push({ code: "OVERBILLED", message: `Previous bills already reserve ${previouslyBilledQuantity}; only ${remainingBillableQuantity} remains billable` });
    }
    const poUnitPriceMinor = toMinor(poLine?.unitPrice || 0), priceVarianceMinor = line.unitPriceMinor - poUnitPriceMinor;
    const priceVariancePercent = poUnitPriceMinor === 0 ? (priceVarianceMinor === 0 ? 0 : 100) : Math.abs(priceVarianceMinor) / poUnitPriceMinor * 100;
    if (priceVariancePercent > tolerance + 1e-9) reasons.push({ code: "PRICE_MISMATCH", message: `Supplier unit price differs from PO price by INR ${fromMinor(Math.abs(priceVarianceMinor)).toFixed(2)} (${priceVariancePercent.toFixed(2)}%)` });
    const quantityReasons = reasons.some((r) => ["NO_RECEIPT", "QUANTITY_EXCEEDS_PO", "QUANTITY_EXCEEDS_RECEIPT", "OVERBILLED", "INVALID_PO_LINE", "ITEM_IDENTITY_MISMATCH"].includes(r.code));
    if (quantityReasons) { quantityMatched = false; hasQuantityException = true; }
    if (reasons.some((r) => r.code === "PRICE_MISMATCH")) priceMatched = false;
    totalExceptions += reasons.length;
    line.matchResult = { orderedQuantity, receivedQuantity, previouslyBilledQuantity, remainingBillableQuantity, quantityVariance: roundQty(line.quantity - remainingBillableQuantity), poUnitPriceMinor, billedUnitPriceMinor: line.unitPriceMinor, priceVarianceMinor, priceVariancePercent, status: reasons.length ? "EXCEPTION" : "MATCHED", reasons };
  });
  bill.matchStatus = totalExceptions ? "EXCEPTION" : "MATCHED";
  bill.matchSummary = { quantityMatched, priceMatched, duplicateInvoice: false, totalExceptions, checkedAt: new Date() };
  bill.grnsConsidered = grns.map((grn) => grn._id);
  bill.reservationActive = !hasQuantityException;
  bill.matchHistory.push({ checkedAt: bill.matchSummary.checkedAt, checkedBy: userId, matchStatus: bill.matchStatus, totalExceptions, lines: bill.lines.map((line) => line.matchResult.toObject ? line.matchResult.toObject() : line.matchResult) });
  return bill;
};

const createDraft = async (input, userId) => {
  const po = await validateHeader(input);
  const normalized = normalizeInvoice(input.supplierInvoiceNumber);
  if (!normalized) throw fail("Supplier invoice number is required");
  const bill = new PurchaseBill({ billNumber: makeNumber(), supplierInvoiceNumber: String(input.supplierInvoiceNumber).trim(), normalizedSupplierInvoiceNumber: normalized, supplier: po.vendorId, purchaseOrder: po._id, currency: "INR", invoiceDate: input.invoiceDate, dueDate: input.dueDate || null, notes: input.notes || "", lines: prepareLines(po, input.lines), createdBy: userId });
  setTotals(bill); addAudit(bill, "CREATED", userId); return bill.save();
};

const updateDraft = async (id, input, userId) => {
  const bill = await PurchaseBill.findById(id); if (!bill) throw fail("Purchase Bill not found", 404); if (bill.status !== "DRAFT") throw fail("Only Draft Purchase Bills can be edited", 409);
  const merged = { purchaseOrder: input.purchaseOrder || bill.purchaseOrder, supplier: input.supplier || bill.supplier, currency: input.currency || bill.currency };
  const po = await validateHeader(merged); const normalized = normalizeInvoice(input.supplierInvoiceNumber ?? bill.supplierInvoiceNumber); if (!normalized) throw fail("Supplier invoice number is required");
  bill.supplierInvoiceNumber = String(input.supplierInvoiceNumber ?? bill.supplierInvoiceNumber).trim(); bill.normalizedSupplierInvoiceNumber = normalized; bill.supplier = po.vendorId; bill.purchaseOrder = po._id; bill.invoiceDate = input.invoiceDate || bill.invoiceDate; bill.dueDate = input.dueDate === undefined ? bill.dueDate : input.dueDate || null; bill.notes = input.notes ?? bill.notes;
  if (input.lines) bill.lines = prepareLines(po, input.lines); setTotals(bill); addAudit(bill, "UPDATED", userId); return bill.save();
};

const runMatchTransaction = async (id, userId, action) => {
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    let bill = await PurchaseBill.findById(id).session(session); if (!bill) throw fail("Purchase Bill not found", 404);
    if (action === "SUBMIT" && bill.status !== "DRAFT") { if (["SUBMITTED", "APPROVED"].includes(bill.status)) { result = bill; return; } throw fail("This bill cannot be submitted", 409); }
    if (action === "REMATCH" && bill.status !== "SUBMITTED") throw fail("Only a submitted, non-approved bill can be rematched", 409);
    await PurchaseOrder.updateOne({ _id: bill.purchaseOrder }, { $inc: { billingVersion: 1 } }, { session });
    const po = await PurchaseOrder.findById(bill.purchaseOrder).session(session); if (!po) throw fail("Purchase Order not found", 404); if (po.status === "CANCELLED") throw fail("Cancelled Purchase Orders cannot be matched", 409, "PO_CANCELLED");
    await computeMatch(bill, po, session, userId); bill.status = "SUBMITTED";
    if (action === "SUBMIT") { bill.submittedAt = new Date(); bill.submittedBy = userId; addAudit(bill, "SUBMITTED", userId); }
    addAudit(bill, action === "SUBMIT" ? (bill.matchStatus === "MATCHED" ? "MATCHED" : "EXCEPTION_RAISED") : "REMATCHED", userId);
    await bill.save({ session }); result = bill;
  }); return result; } finally { await session.endSession(); }
};

const changeFinalState = async (id, userId, action, reason = "") => {
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    const bill = await PurchaseBill.findById(id).session(session); if (!bill) throw fail("Purchase Bill not found", 404); if (bill.status !== "SUBMITTED") throw fail("Only submitted bills can be reviewed", 409);
    await PurchaseOrder.updateOne({ _id: bill.purchaseOrder }, { $inc: { billingVersion: 1 } }, { session });
    if (action === "APPROVE" && bill.matchStatus !== "MATCHED") throw fail("Exception bills require the explicit override approval action", 409);
    if (action === "OVERRIDE") { if (bill.matchStatus !== "EXCEPTION") throw fail("Only exception bills use override approval", 409); if (!String(reason).trim()) throw fail("Exception override reason is required"); bill.exceptionOverride = { approved: true, reason: String(reason).trim(), approvedBy: userId, approvedAt: new Date() }; }
    if (action === "REJECT") { if (!String(reason).trim()) throw fail("Rejection reason is required"); bill.status = "REJECTED"; bill.reservationActive = false; bill.rejectedAt = new Date(); bill.rejectedBy = userId; bill.rejectionReason = String(reason).trim(); addAudit(bill, "REJECTED", userId, reason); }
    else { bill.status = "APPROVED"; bill.reservationActive = true; bill.approvedAt = new Date(); bill.approvedBy = userId; addAudit(bill, action === "OVERRIDE" ? "EXCEPTION_OVERRIDDEN" : "APPROVED", userId, reason); }
    await bill.save({ session }); result = bill;
  }); return result; } finally { await session.endSession(); }
};

const preview = async (input) => { const po = await validateHeader(input); const temp = new PurchaseBill({ billNumber: "PREVIEW", supplierInvoiceNumber: input.supplierInvoiceNumber || "PREVIEW", normalizedSupplierInvoiceNumber: "PREVIEW", supplier: po.vendorId, purchaseOrder: po._id, invoiceDate: input.invoiceDate || new Date(), lines: prepareLines(po, input.lines), createdBy: new mongoose.Types.ObjectId() }); setTotals(temp); await computeMatch(temp, po, null, temp.createdBy); return temp.toObject(); };

module.exports = { fail, normalizeInvoice, toMinor, fromMinor, createDraft, updateDraft, submit: (id, userId) => runMatchTransaction(id, userId, "SUBMIT"), rematch: (id, userId) => runMatchTransaction(id, userId, "REMATCH"), approve: (id, userId) => changeFinalState(id, userId, "APPROVE"), approveException: (id, userId, reason) => changeFinalState(id, userId, "OVERRIDE", reason), reject: (id, userId, reason) => changeFinalState(id, userId, "REJECT", reason), preview };
