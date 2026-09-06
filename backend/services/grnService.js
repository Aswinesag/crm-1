const crypto = require("crypto");
const mongoose = require("mongoose");
const GRN = require("../models/grn/grnModel");
const PurchaseOrder = require("../models/PurchaseOrder");
const InventoryBalance = require("../models/InventoryBalance");
const InventoryTransaction = require("../models/InventoryTransaction");
const Warehouse = require("../models/Warehouse");
const { models, validateIdentity, ledger } = require("./canonicalInventoryService");

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validId = (value) => mongoose.isValidObjectId(value);
const itemSnapshot = (item) => ({
  itemCodeSnapshot: item.productCode || item.materialCode || item.componentCode || "",
  itemNameSnapshot: item.productName || item.materialName || item.componentName || "",
});
const updatePOStatus = (po) => {
  const received = po.items.reduce((sum, line) => sum + Number(line.receivedQuantity || 0), 0);
  const ordered = po.items.reduce((sum, line) => sum + Number(line.quantity), 0);
  if (received <= 0) {
    if (["PARTIALLY_RECEIVED", "RECEIVED"].includes(po.status)) po.status = "APPROVED";
  } else po.status = received >= ordered ? "RECEIVED" : "PARTIALLY_RECEIVED";
};

const prepareDraft = async (input, userId, existing = null) => {
  if (!validId(input.purchaseOrder)) throw fail("Valid Purchase Order is required");
  const po = await PurchaseOrder.findById(input.purchaseOrder).populate("items.item");
  if (!po) throw fail("Purchase Order not found", 404);
  if (["CANCELLED", "RECEIVED"].includes(po.status)) throw fail("This Purchase Order cannot accept another GRN", 409);
  const warehouse = input.warehouse || po.warehouseId;
  if (!validId(warehouse) || !(await Warehouse.exists({ _id: warehouse }))) throw fail("Valid receiving warehouse is required");
  if (po.warehouseId && String(po.warehouseId) !== String(warehouse)) throw fail("GRN warehouse must match the Purchase Order warehouse", 409);
  if (!Array.isArray(input.items) || input.items.length === 0) throw fail("At least one received item is required");
  const seen = new Set();
  const lines = input.items.map((incoming) => {
    if (!validId(incoming.poLineId) || seen.has(String(incoming.poLineId))) throw fail("Each PO line may appear only once in a GRN");
    seen.add(String(incoming.poLineId));
    const poLine = po.items.id(incoming.poLineId);
    if (!poLine) throw fail("GRN item does not match a Purchase Order line");
    const quantity = Number(incoming.quantityReceived);
    const accepted = incoming.acceptedQuantity === undefined ? quantity : Number(incoming.acceptedQuantity);
    const rejected = incoming.rejectedQuantity === undefined ? 0 : Number(incoming.rejectedQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || accepted < 0 || rejected < 0 || accepted + rejected !== quantity) throw fail("Received quantity must be positive and equal accepted plus rejected quantity");
    if (quantity > Number(poLine.quantity) - Number(poLine.receivedQuantity || 0)) throw fail("Received quantity exceeds the current pending quantity", 409);
    return { poLineId: poLine._id, itemType: poLine.itemType, item: poLine.item?._id || poLine.item, orderedQuantitySnapshot: poLine.quantity, previouslyReceivedSnapshot: poLine.receivedQuantity || 0, quantityReceived: quantity, acceptedQuantity: accepted, rejectedQuantity: rejected, unitPriceSnapshot: poLine.unitPrice || 0, ...itemSnapshot(poLine.item || {}), notes: incoming.notes || incoming.remarks || "" };
  });
  const values = { purchaseOrder: po._id, vendor: po.vendorId, warehouse, receiptDate: input.receiptDate || input.deliveryDate || new Date(), items: lines, notes: input.notes || input.remarks || "", receivedBy: userId };
  if (existing) { Object.assign(existing, values); return existing.save(); }
  return GRN.create({ ...values, grnNumber: `GRN-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}` });
};

const post = async (id, userId) => {
  if (!validId(id)) throw fail("Invalid GRN ID");
  const session = await mongoose.startSession(); let result;
  try {
    await session.withTransaction(async () => {
      const grn = await GRN.findById(id).session(session);
      if (!grn) throw fail("GRN not found", 404);
      if (grn.status === "Posted") { result = { grn, alreadyPosted: true }; return; }
      if (grn.status !== "Draft") throw fail("Only a Draft GRN can be posted", 409);
      const po = await PurchaseOrder.findById(grn.purchaseOrder).session(session);
      if (!po || po.status === "CANCELLED") throw fail("Purchase Order is unavailable for receipt", 409);
      for (const line of grn.items) {
        const poLine = po.items.id(line.poLineId);
        if (!poLine || poLine.itemType !== line.itemType || String(poLine.item) !== String(line.item)) throw fail("GRN line no longer matches its Purchase Order line", 409);
        if (Number(poLine.receivedQuantity || 0) + line.quantityReceived > poLine.quantity) throw fail("Posting would exceed the Purchase Order quantity", 409);
        await validateIdentity({ itemType: line.itemType, item: line.item, warehouse: grn.warehouse, session });
      }
      for (const line of grn.items) {
        const poLine = po.items.id(line.poLineId);
        poLine.receivedQuantity = Number(poLine.receivedQuantity || 0) + line.quantityReceived;
        line.previouslyReceivedSnapshot = poLine.receivedQuantity - line.quantityReceived;
        if (line.acceptedQuantity > 0) {
          const before = await InventoryBalance.findOneAndUpdate({ itemType: line.itemType, item: line.item, warehouse: grn.warehouse }, { $inc: { quantity: line.acceptedQuantity }, $setOnInsert: { itemType: line.itemType, item: line.item, warehouse: grn.warehouse } }, { upsert: true, new: false, session });
          const beforeQuantity = before?.quantity || 0;
          await InventoryTransaction.create([ledger({ itemType: line.itemType, item: line.item, warehouse: grn.warehouse, quantity: line.acceptedQuantity, movementType: "StockIn", beforeQuantity, afterQuantity: beforeQuantity + line.acceptedQuantity, batchId: String(line._id), referenceType: "GRN", referenceId: String(grn._id), reason: `Posted ${grn.grnNumber}`, notes: line.notes, userId })], { session });
        }
      }
      updatePOStatus(po); await po.save({ session });
      grn.status = "Posted"; grn.postingState = "Posted"; grn.postedAt = new Date(); grn.postedBy = userId; await grn.save({ session });
      result = { grn, purchaseOrder: po, alreadyPosted: false };
    });
    return result;
  } finally { await session.endSession(); }
};

const reverse = async (id, userId, reason) => {
  if (!validId(id)) throw fail("Invalid GRN ID");
  const session = await mongoose.startSession(); let result;
  try {
    await session.withTransaction(async () => {
      const grn = await GRN.findById(id).session(session);
      if (!grn) throw fail("GRN not found", 404);
      if (grn.status === "Reversed") throw fail("GRN has already been reversed", 409);
      if (grn.status !== "Posted") throw fail("Only a Posted GRN can be reversed", 409);
      const po = await PurchaseOrder.findById(grn.purchaseOrder).session(session);
      if (!po) throw fail("Purchase Order not found", 409);
      for (const line of grn.items) {
        if (line.acceptedQuantity <= 0) continue;
        const balance = await InventoryBalance.findOne({ itemType: line.itemType, item: line.item, warehouse: grn.warehouse }).session(session);
        if (!balance || balance.quantity < line.acceptedQuantity) throw fail(`Insufficient inventory to reverse ${line.itemNameSnapshot || "GRN item"}`, 409);
      }
      for (const line of grn.items) {
        const poLine = po.items.id(line.poLineId);
        if (!poLine || Number(poLine.receivedQuantity || 0) < line.quantityReceived) throw fail("Purchase Order receipt state cannot be reversed safely", 409);
        poLine.receivedQuantity -= line.quantityReceived;
        if (line.acceptedQuantity > 0) {
          const before = await InventoryBalance.findOneAndUpdate({ itemType: line.itemType, item: line.item, warehouse: grn.warehouse, quantity: { $gte: line.acceptedQuantity } }, { $inc: { quantity: -line.acceptedQuantity } }, { new: false, session });
          if (!before) throw fail("Insufficient inventory for reversal", 409);
          await InventoryTransaction.create([ledger({ itemType: line.itemType, item: line.item, warehouse: grn.warehouse, quantity: line.acceptedQuantity, movementType: "StockOut", beforeQuantity: before.quantity, afterQuantity: before.quantity - line.acceptedQuantity, batchId: `REV-${line._id}`, referenceType: "GRN", referenceId: String(grn._id), reason: `Reversed ${grn.grnNumber}`, notes: reason, userId })], { session });
        }
      }
      updatePOStatus(po); await po.save({ session });
      grn.status = "Reversed"; grn.postingState = "Reversed"; grn.reversedAt = new Date(); grn.reversedBy = userId; grn.reversalReason = String(reason || "").trim(); await grn.save({ session });
      result = { grn, purchaseOrder: po };
    });
    return result;
  } finally { await session.endSession(); }
};

module.exports = { fail, prepareDraft, post, reverse };
