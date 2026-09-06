const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../models/Category"), Unit = require("../models/Unit"), Warehouse = require("../models/Warehouse"), RawMaterial = require("../models/RawMaterial"), Vendor = require("../models/Vendor"), PurchaseOrder = require("../models/PurchaseOrder"), GRN = require("../models/grn/grnModel");
const InventoryBalance = require("../models/InventoryBalance"), InventoryTransaction = require("../models/InventoryTransaction");
const service = require("../services/grnService");
const { protect, restrictTo } = require("../middleware/auth");
const uri = process.env.GRN_TEST_MONGODB_URI;

test("GRN routes require authentication and permitted roles", async () => {
  const response = () => { const result = { statusCode: 200 }; return { result, res: { status(code) { result.statusCode = code; return this; }, json() { return this; } } }; };
  const missing = response(); await protect({ headers: {} }, missing.res, () => {}); assert.equal(missing.result.statusCode, 401);
  const forbidden = response(); restrictTo("Admin")({ user: { role: "Engineer" } }, forbidden.res, () => {}); assert.equal(forbidden.result.statusCode, 403);
});

test("GRN receipt lifecycle is transactional, idempotent, concurrent-safe, and reversible", { skip: !uri }, async (t) => {
  await mongoose.connect(uri); t.after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });
  await Promise.all([PurchaseOrder.init(), GRN.init(), InventoryBalance.init(), InventoryTransaction.init()]);
  const userId = new mongoose.Types.ObjectId();
  const category = await Category.create({ name: "GRN Test" }), unit = await Unit.create({ name: "GRN Unit", shortName: "GU" });
  const warehouse = await Warehouse.create({ warehouseCode: "GRN-WH", warehouseName: "Receiving", location: "Test" });
  const vendor = await Vendor.create({ vendorCode: "GRN-V", vendorName: "Test Vendor", email: "grn-vendor@example.test" });
  const material = await RawMaterial.create({ materialCode: "GRN-RM", materialName: "Steel", category: category._id, unit: unit._id });
  const makePO = async (suffix, quantity = 100) => PurchaseOrder.create({ poNumber: `PO-GRN-${suffix}`, vendorId: vendor._id, warehouseId: warehouse._id, status: "APPROVED", createdBy: userId, items: [{ itemType: "RawMaterial", item: material._id, quantity, unitPrice: 25 }] });
  const draftFor = async (po, quantity) => service.prepareDraft({ purchaseOrder: po._id, warehouse: warehouse._id, items: [{ poLineId: po.items[0]._id, quantityReceived: quantity }] }, userId);

  const po = await makePO("PARTIAL"), first = await draftFor(po, 40);
  assert.equal(first.status, "Draft"); assert.equal(await InventoryBalance.countDocuments(), 0);
  await service.post(first._id, userId);
  let refreshed = await PurchaseOrder.findById(po._id); assert.equal(refreshed.items[0].receivedQuantity, 40); assert.equal(refreshed.items[0].pendingQuantity, 60); assert.equal(refreshed.status, "PARTIALLY_RECEIVED");
  assert.equal((await InventoryBalance.findOne({ item: material._id })).quantity, 40);
  const second = await draftFor(refreshed, 60); await service.post(second._id, userId);
  refreshed = await PurchaseOrder.findById(po._id); assert.equal(refreshed.items[0].receivedQuantity, 100); assert.equal(refreshed.items[0].pendingQuantity, 0); assert.equal(refreshed.status, "RECEIVED"); assert.equal((await InventoryBalance.findOne({ item: material._id })).quantity, 100);
  const repeat = await service.post(second._id, userId); assert.equal(repeat.alreadyPosted, true); assert.equal((await InventoryBalance.findOne({ item: material._id })).quantity, 100); assert.equal(await InventoryTransaction.countDocuments({ referenceType: "GRN", referenceId: String(second._id), movementType: "StockIn" }), 1);

  const overPO = await makePO("OVER"); overPO.items[0].receivedQuantity = 80; await overPO.save(); await assert.rejects(draftFor(overPO, 30), /exceeds/); assert.equal((await PurchaseOrder.findById(overPO._id)).items[0].receivedQuantity, 80);
  await assert.rejects(service.prepareDraft({ purchaseOrder: overPO._id, warehouse: warehouse._id, items: [{ poLineId: overPO.items[0]._id, quantityReceived: 0 }] }, userId), /positive/);
  await assert.rejects(service.prepareDraft({ purchaseOrder: new mongoose.Types.ObjectId(), warehouse: warehouse._id, items: [{ poLineId: overPO.items[0]._id, quantityReceived: 1 }] }, userId), /not found/);
  await assert.rejects(service.prepareDraft({ purchaseOrder: overPO._id, warehouse: new mongoose.Types.ObjectId(), items: [{ poLineId: overPO.items[0]._id, quantityReceived: 1 }] }, userId), /warehouse/);

  const concurrentPO = await makePO("CONCURRENT", 10), grnA = await draftFor(concurrentPO, 10), grnB = await draftFor(concurrentPO, 10);
  const attempts = await Promise.allSettled([service.post(grnA._id, userId), service.post(grnB._id, userId)]);
  assert.equal(attempts.filter((entry) => entry.status === "fulfilled").length, 1); assert.equal((await PurchaseOrder.findById(concurrentPO._id)).items[0].receivedQuantity, 10);

  const rollbackPO = await makePO("ROLLBACK", 10), rollback = await draftFor(rollbackPO, 5); rollback.items[0].item = new mongoose.Types.ObjectId(); await rollback.save({ validateBeforeSave: false });
  const beforeRollbackStock = (await InventoryBalance.findOne({ item: material._id })).quantity; await assert.rejects(service.post(rollback._id, userId), /no longer matches|not found/); assert.equal((await InventoryBalance.findOne({ item: material._id })).quantity, beforeRollbackStock); assert.equal((await PurchaseOrder.findById(rollbackPO._id)).items[0].receivedQuantity, 0); assert.equal((await GRN.findById(rollback._id)).status, "Draft");

  await service.reverse(second._id, userId, "Test correction"); refreshed = await PurchaseOrder.findById(po._id); assert.equal(refreshed.items[0].receivedQuantity, 40); assert.equal(refreshed.status, "PARTIALLY_RECEIVED"); assert.equal((await InventoryBalance.findOne({ item: material._id })).quantity, beforeRollbackStock - 60); assert.equal(await InventoryTransaction.countDocuments({ referenceType: "GRN", referenceId: String(second._id) }), 2); await assert.rejects(service.reverse(second._id, userId, "Again"), /already/);

  const consumedPO = await makePO("CONSUMED", 8), consumed = await draftFor(consumedPO, 8); await service.post(consumed._id, userId); await InventoryBalance.updateOne({ item: material._id, warehouse: warehouse._id }, { quantity: 0 }); await assert.rejects(service.reverse(consumed._id, userId, "Cannot"), /Insufficient/); assert.equal((await GRN.findById(consumed._id)).status, "Posted"); assert.equal((await PurchaseOrder.findById(consumedPO._id)).items[0].receivedQuantity, 8);
});
