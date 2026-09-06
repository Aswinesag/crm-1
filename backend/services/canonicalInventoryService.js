const crypto = require("crypto");
const mongoose = require("mongoose");
const InventoryBalance = require("../models/InventoryBalance");
const InventoryTransaction = require("../models/InventoryTransaction");
const InventoryAudit = require("../models/InventoryAudit");
const Warehouse = require("../models/Warehouse");
const Product = require("../models/Product");
const RawMaterial = require("../models/RawMaterial");
const Component = require("../models/Component");

const models = { Product, RawMaterial, Component };
const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
const nonnegative = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;
const validateIdentity = async ({ itemType, item, warehouse, session }) => {
  if (!models[itemType] || !mongoose.isValidObjectId(item) || !mongoose.isValidObjectId(warehouse)) throw Object.assign(new Error("Invalid item type, item, or warehouse"), { statusCode: 400 });
  const [foundItem, foundWarehouse] = await Promise.all([models[itemType].findById(item).session(session).lean(), Warehouse.findById(warehouse).session(session).lean()]);
  if (!foundItem) throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  if (!foundWarehouse) throw Object.assign(new Error("Warehouse not found"), { statusCode: 404 });
};
const ledger = ({ itemType, item, warehouse, quantity, movementType, beforeQuantity, afterQuantity, batchId = "", referenceType, referenceId, reason, notes, userId }) => ({ itemType, item, warehouse, quantity, movementType, beforeQuantity, afterQuantity, batchId, referenceType: String(referenceType || "Manual").trim().slice(0, 60), referenceId: String(referenceId || "").trim().slice(0, 120), reason: String(reason || "").trim().slice(0, 250), notes: String(notes || "").trim().slice(0, 1000), performedBy: userId });

const stockIn = async (input, userId) => {
  if (!positive(input.quantity)) throw Object.assign(new Error("Quantity must be greater than zero"), { statusCode: 400 });
  const quantity = Number(input.quantity), session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => { await validateIdentity({ ...input, session }); const before = await InventoryBalance.findOneAndUpdate({ itemType: input.itemType, item: input.item, warehouse: input.warehouse }, { $inc: { quantity }, $setOnInsert: { itemType: input.itemType, item: input.item, warehouse: input.warehouse } }, { upsert: true, new: false, session }); const beforeQuantity = before?.quantity || 0, afterQuantity = beforeQuantity + quantity; const [transaction] = await InventoryTransaction.create([ledger({ ...input, quantity, movementType: "StockIn", beforeQuantity, afterQuantity, userId })], { session }); result = { balance: await InventoryBalance.findOne({ itemType: input.itemType, item: input.item, warehouse: input.warehouse }).session(session), transaction }; }); return result; } finally { await session.endSession(); }
};
const stockOut = async (input, userId) => {
  if (!positive(input.quantity)) throw Object.assign(new Error("Quantity must be greater than zero"), { statusCode: 400 });
  const quantity = Number(input.quantity), session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => { await validateIdentity({ ...input, session }); const before = await InventoryBalance.findOneAndUpdate({ itemType: input.itemType, item: input.item, warehouse: input.warehouse, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } }, { new: false, session }); if (!before) throw Object.assign(new Error("Insufficient stock"), { statusCode: 409 }); const afterQuantity = before.quantity - quantity; const [transaction] = await InventoryTransaction.create([ledger({ ...input, quantity, movementType: "StockOut", beforeQuantity: before.quantity, afterQuantity, userId })], { session }); result = { balance: await InventoryBalance.findById(before._id).session(session), transaction }; }); return result; } finally { await session.endSession(); }
};
const transfer = async (input, userId) => {
  if (!positive(input.quantity) || input.sourceWarehouse === input.destinationWarehouse) throw Object.assign(new Error("Positive quantity and different warehouses are required"), { statusCode: 400 });
  const quantity = Number(input.quantity), batchId = `TRF-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`, session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => { await validateIdentity({ itemType: input.itemType, item: input.item, warehouse: input.sourceWarehouse, session }); if (!mongoose.isValidObjectId(input.destinationWarehouse) || !(await Warehouse.exists({ _id: input.destinationWarehouse }).session(session))) throw Object.assign(new Error("Destination warehouse not found"), { statusCode: 404 }); const sourceBefore = await InventoryBalance.findOneAndUpdate({ itemType: input.itemType, item: input.item, warehouse: input.sourceWarehouse, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } }, { new: false, session }); if (!sourceBefore) throw Object.assign(new Error("Insufficient stock"), { statusCode: 409 }); const destinationBefore = await InventoryBalance.findOneAndUpdate({ itemType: input.itemType, item: input.item, warehouse: input.destinationWarehouse }, { $inc: { quantity }, $setOnInsert: { itemType: input.itemType, item: input.item, warehouse: input.destinationWarehouse } }, { upsert: true, new: false, session }); const destinationQuantity = destinationBefore?.quantity || 0; const entries = await InventoryTransaction.create([ledger({ ...input, warehouse: input.sourceWarehouse, quantity, movementType: "TransferOut", beforeQuantity: sourceBefore.quantity, afterQuantity: sourceBefore.quantity - quantity, batchId, userId }), ledger({ ...input, warehouse: input.destinationWarehouse, quantity, movementType: "TransferIn", beforeQuantity: destinationQuantity, afterQuantity: destinationQuantity + quantity, batchId, userId })], { session, ordered: true }); result = { batchId, transactions: entries }; }); return result; } finally { await session.endSession(); }
};
const audit = async (input, userId) => {
  if (!nonnegative(input.physicalQuantity)) throw Object.assign(new Error("Physical quantity must be zero or greater"), { statusCode: 400 });
  const physicalQuantity = Number(input.physicalQuantity), session = await mongoose.startSession(); let result;
  try { await session.withTransaction(async () => { await validateIdentity({ ...input, session }); let balance = await InventoryBalance.findOne({ itemType: input.itemType, item: input.item, warehouse: input.warehouse }).session(session); if (!balance) [balance] = await InventoryBalance.create([{ itemType: input.itemType, item: input.item, warehouse: input.warehouse, quantity: 0 }], { session }); const systemQuantity = balance.quantity, difference = physicalQuantity - systemQuantity; balance.quantity = physicalQuantity; await balance.save({ session }); const [auditRecord] = await InventoryAudit.create([{ itemType: input.itemType, item: input.item, warehouse: input.warehouse, systemQuantity, physicalQuantity, difference, reason: String(input.reason || "").trim().slice(0, 250), notes: String(input.notes || "").trim().slice(0, 1000), auditedBy: userId }], { session }); let transaction = null; if (difference !== 0) [transaction] = await InventoryTransaction.create([ledger({ ...input, quantity: Math.abs(difference), movementType: difference > 0 ? "AdjustmentIncrease" : "AdjustmentDecrease", beforeQuantity: systemQuantity, afterQuantity: physicalQuantity, batchId: `AUD-${auditRecord._id}`, userId })], { session }); result = { audit: auditRecord, balance, transaction }; }); return result; } finally { await session.endSession(); }
};
module.exports = { models, validateIdentity, ledger, stockIn, stockOut, transfer, audit };
