const crypto = require("crypto");
const mongoose = require("mongoose");
const PurchaseRequisition = require("../models/PurchaseRequisition");
const RFQ = require("../models/RFQ");
const PurchaseOrder = require("../models/PurchaseOrder");
const Vendor = require("../models/Vendor");
const Warehouse = require("../models/Warehouse");
const { models } = require("./canonicalInventoryService");

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validId = (value) => mongoose.isValidObjectId(value);
const snapshot = (item) => ({ itemCodeSnapshot: item.productCode || item.materialCode || item.componentCode || "", itemNameSnapshot: item.productName || item.materialName || item.componentName || "", unitSnapshot: item.unit?.shortName || item.unit?.name || "" });
const validateCanonicalLines = async (lines) => {
  if (!Array.isArray(lines) || !lines.length) throw fail("At least one canonical item line is required");
  const seen = new Set(), result = [];
  for (const line of lines) {
    const key = `${line.itemType}:${line.item}`;
    if (!models[line.itemType] || !validId(line.item)) throw fail("Invalid canonical procurement item identity");
    if (seen.has(key)) throw fail("Duplicate item lines are not allowed"); seen.add(key);
    const item = await models[line.itemType].findById(line.item).populate("unit", "name shortName").lean();
    if (!item) throw fail("Canonical procurement item not found", 404);
    const quantity = Number(line.requestedQuantity ?? line.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) throw fail("Requested quantity must be greater than zero");
    result.push({ itemType: line.itemType, item: item._id, requestedQuantity: quantity, requiredBy: line.requiredBy || null, estimatedUnitPrice: Number(line.estimatedUnitPrice || 0), notes: line.notes || "", ...snapshot(item) });
  }
  return result;
};
const createRequisition = async (input, userId) => PurchaseRequisition.create({ requisitionNo: input.requisitionNo || `PR-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`, department: input.department, requestedBy: userId, priority: String(input.priority || "MEDIUM").toUpperCase(), requiredDate: input.requiredDate || null, justification: input.justification || "", remarks: input.remarks || "", status: input.status === "DRAFT" ? "DRAFT" : "PENDING", items: await validateCanonicalLines(input.items) });

const createRFQFromPR = async (prId, input, userId) => {
  if (!validId(prId)) throw fail("Invalid Purchase Requisition ID");
  const round = Number(input.sourcingRound || 1), existing = await RFQ.findOne({ sourceRequisition: prId, sourcingRound: round });
  if (existing) return { rfq: existing, alreadyCreated: true };
  const vendorIds = [...new Set((input.vendorIds || []).map(String))];
  if (!vendorIds.length || vendorIds.some((id) => !validId(id)) || await Vendor.countDocuments({ _id: { $in: vendorIds }, status: { $ne: "BLOCKED" } }) !== vendorIds.length) throw fail("One or more selected vendors are invalid");
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    const repeat = await RFQ.findOne({ sourceRequisition: prId, sourcingRound: round }).session(session); if (repeat) { result = { rfq: repeat, alreadyCreated: true }; return; }
    const pr = await PurchaseRequisition.findById(prId).session(session);
    if (!pr) throw fail("Purchase Requisition not found", 404);
    if (pr.legacyIdentity || !pr.items.length || pr.items.some((line) => !line.itemType || !line.item)) throw fail("Legacy procurement item requires migration before RFQ creation", 409);
    if (pr.status !== "APPROVED") throw fail("Only an approved Purchase Requisition can create an RFQ", 409);
    for (const line of pr.items) if (!models[line.itemType] || !(await models[line.itemType].exists({ _id: line.item }).session(session))) throw fail("Canonical requisition item no longer exists", 409);
    const [rfq] = await RFQ.create([{ rfqNumber: input.rfqNumber || `RFQ-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`, sourceRequisition: pr._id, sourcingRound: round, vendorIds, requiredDate: input.requiredDate || pr.requiredDate, remarks: input.remarks || "", status: "DRAFT", createdBy: userId, items: pr.items.map((line) => ({ sourcePRLine: line._id, itemType: line.itemType, item: line.item, requestedQuantity: line.requestedQuantity, unitSnapshot: line.unitSnapshot, itemCodeSnapshot: line.itemCodeSnapshot, itemNameSnapshot: line.itemNameSnapshot, descriptionSnapshot: line.notes })) }], { session });
    pr.status = "RFQ_CREATED"; await pr.save({ session }); result = { rfq, alreadyCreated: false };
  }); return result; } finally { await session.endSession(); }
};

const submitQuotation = async (rfqId, input) => {
  if (!validId(rfqId) || !validId(input.vendorId)) throw fail("Valid RFQ and vendor are required");
  const rfq = await RFQ.findById(rfqId); if (!rfq) throw fail("RFQ not found", 404);
  if (!["DRAFT", "SENT", "QUOTATION_RECEIVED"].includes(rfq.status)) throw fail("RFQ is not accepting quotations", 409);
  if (!rfq.vendorIds.some((id) => String(id) === String(input.vendorId)) || !(await Vendor.exists({ _id: input.vendorId, status: { $ne: "BLOCKED" } }))) throw fail("Vendor was not invited to this RFQ", 409);
  if (!Array.isArray(input.lines) || !input.lines.length) throw fail("Quotation lines are required");
  const seen = new Set(), lines = input.lines.map((line) => { const source = rfq.items.id(line.rfqLineId); if (!source || seen.has(String(line.rfqLineId))) throw fail("Quotation contains an invalid or duplicate RFQ line"); seen.add(String(line.rfqLineId)); const quantity = Number(line.quotedQuantity ?? source.requestedQuantity), price = Number(line.unitPrice); if (quantity <= 0 || quantity > source.requestedQuantity || !Number.isFinite(price) || price < 0) throw fail("Invalid quoted quantity or unit price"); return { rfqLine: source._id, quotedQuantity: quantity, unitPrice: price, discount: Number(line.discount || 0), taxPercent: Number(line.taxPercent || 0), deliveryDays: Number(line.deliveryDays || 0) }; });
  const existing = rfq.quotations.find((quote) => String(quote.vendor) === String(input.vendorId));
  if (existing) { if (existing.status === "SELECTED") throw fail("A selected quotation cannot be changed", 409); existing.lines = lines; existing.paymentTerms = input.paymentTerms || ""; existing.remarks = input.remarks || ""; existing.submittedAt = new Date(); }
  else rfq.quotations.push({ vendor: input.vendorId, lines, paymentTerms: input.paymentTerms || "", remarks: input.remarks || "" });
  rfq.status = "QUOTATION_RECEIVED"; await rfq.save(); return rfq;
};

const createPOFromRFQ = async (rfqId, input, userId) => {
  if (!validId(rfqId) || !validId(input.quotationId) || !validId(input.warehouseId)) throw fail("Valid RFQ, quotation, and warehouse are required");
  if (!(await Warehouse.exists({ _id: input.warehouseId }))) throw fail("Warehouse not found", 404);
  if (!Array.isArray(input.items) || !input.items.length) throw fail("Purchase Order allocations are required");
  const normalized = input.items.map((line) => ({ rfqLineId: String(line.rfqLineId), quantity: Number(line.quantity) })).sort((a, b) => a.rfqLineId.localeCompare(b.rfqLineId));
  const conversionKey = crypto.createHash("sha256").update(`${rfqId}:${input.quotationId}:${input.warehouseId}:${JSON.stringify(normalized)}`).digest("hex");
  const existing = await PurchaseOrder.findOne({ conversionKey }); if (existing) return { purchaseOrder: existing, alreadyCreated: true };
  const session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => {
    const repeat = await PurchaseOrder.findOne({ conversionKey }).session(session); if (repeat) { result = { purchaseOrder: repeat, alreadyCreated: true }; return; }
    const rfq = await RFQ.findById(rfqId).session(session); if (!rfq) throw fail("RFQ not found", 404);
    if (rfq.legacyIdentity || !rfq.items.length || rfq.items.some((line) => !line.itemType || !line.item)) throw fail("Legacy procurement item requires migration before Purchase Order creation", 409);
    const quote = rfq.quotations.id(input.quotationId); if (!quote) throw fail("Quotation does not belong to this RFQ", 409);
    const pr = await PurchaseRequisition.findById(rfq.sourceRequisition).session(session); if (!pr) throw fail("Source Purchase Requisition not found", 409);
    const seen = new Set(), poLines = [];
    for (const allocation of normalized) {
      const rfqLine = rfq.items.id(allocation.rfqLineId), quoteLine = quote.lines.find((line) => String(line.rfqLine) === allocation.rfqLineId);
      if (!rfqLine || !quoteLine || seen.has(allocation.rfqLineId)) throw fail("Allocation is not tied to the selected quotation", 409); seen.add(allocation.rfqLineId);
      if (!Number.isFinite(allocation.quantity) || allocation.quantity <= 0 || Number(quoteLine.orderedQuantity || 0) + allocation.quantity > quoteLine.quotedQuantity || Number(rfqLine.orderedQuantity || 0) + allocation.quantity > rfqLine.requestedQuantity) throw fail("Purchase Order quantity exceeds the remaining sourced or quoted quantity", 409);
      const prLine = pr.items.id(rfqLine.sourcePRLine); if (!prLine || prLine.itemType !== rfqLine.itemType || String(prLine.item) !== String(rfqLine.item) || Number(prLine.orderedQuantity || 0) + allocation.quantity > prLine.requestedQuantity) throw fail("Purchase Requisition allocation is invalid or exhausted", 409);
      rfqLine.orderedQuantity += allocation.quantity; quoteLine.orderedQuantity = Number(quoteLine.orderedQuantity || 0) + allocation.quantity; prLine.orderedQuantity += allocation.quantity;
      poLines.push({ itemType: rfqLine.itemType, item: rfqLine.item, quantity: allocation.quantity, receivedQuantity: 0, unitPrice: quoteLine.unitPrice, unitSnapshot: rfqLine.unitSnapshot, itemCodeSnapshot: rfqLine.itemCodeSnapshot, itemNameSnapshot: rfqLine.itemNameSnapshot, sourcePR: pr._id, sourcePRLine: prLine._id, sourceRFQ: rfq._id, sourceRFQLine: rfqLine._id, sourceQuotation: quote._id });
    }
    const allRFQOrdered = rfq.items.every((line) => line.orderedQuantity >= line.requestedQuantity), anyRFQOrdered = rfq.items.some((line) => line.orderedQuantity > 0); rfq.status = allRFQOrdered ? "ORDERED" : anyRFQOrdered ? "PARTIALLY_ORDERED" : rfq.status; quote.status = "SELECTED";
    const allPROrdered = pr.items.every((line) => line.orderedQuantity >= line.requestedQuantity); pr.status = allPROrdered ? "ORDERED" : "PARTIALLY_ORDERED";
    await rfq.save({ session }); await pr.save({ session });
    const [purchaseOrder] = await PurchaseOrder.create([{ poNumber: input.poNumber || `PO-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`, vendorId: quote.vendor, warehouseId: input.warehouseId, items: poLines, deliveryDate: input.deliveryDate || null, paymentTerms: quote.paymentTerms, notes: input.notes || "", status: "APPROVED", createdBy: userId, sourceRequisition: pr._id, sourceRFQ: rfq._id, sourceQuotation: quote._id, conversionKey }], { session }); result = { purchaseOrder, alreadyCreated: false };
  }); return result; } finally { await session.endSession(); }
};

module.exports = { fail, validateCanonicalLines, createRequisition, createRFQFromPR, submitQuotation, createPOFromRFQ };
