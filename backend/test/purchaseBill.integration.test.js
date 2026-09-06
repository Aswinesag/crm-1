const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../models/Category"), Unit = require("../models/Unit"), Warehouse = require("../models/Warehouse"), RawMaterial = require("../models/RawMaterial"), Vendor = require("../models/Vendor"), PurchaseOrder = require("../models/PurchaseOrder"), GRN = require("../models/grn/grnModel"), PurchaseBill = require("../models/PurchaseBill");
const InventoryBalance = require("../models/InventoryBalance"), Invoice = require("../models/Invoice"), Payment = require("../models/Payment");
const grnService = require("../services/grnService"), billService = require("../services/purchaseBillService");
const purchaseOrderController = require("../controllers/purchaseOrder/purchaseOrderController");
const { protect, restrictTo } = require("../middleware/auth");
const uri = process.env.PURCHASE_BILL_TEST_MONGODB_URI;

test("Purchase Bill routes require JWT authentication and Admin role", async () => {
  const response = () => { const state = { status: 200 }; return { state, res: { status(code) { state.status = code; return this; }, json() { return this; } } }; };
  const missing = response(); await protect({ headers: {} }, missing.res, () => {}); assert.equal(missing.state.status, 401);
  const forbidden = response(); restrictTo("Super Admin", "Admin")({ user: { role: "Engineer" } }, forbidden.res, () => {}); assert.equal(forbidden.state.status, 403);
});

test("Purchase Bill three-way matching is canonical, transactional, concurrent-safe and finance-isolated", { skip: !uri }, async (t) => {
  await mongoose.connect(uri); t.after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });
  await Promise.all([PurchaseOrder.init(), GRN.init(), PurchaseBill.init(), InventoryBalance.init()]);
  const userId = new mongoose.Types.ObjectId();
  const category = await Category.create({ name: "Bill Test" }), unit = await Unit.create({ name: "Bill Unit", shortName: "BU" }), warehouse = await Warehouse.create({ warehouseCode: "BILL-WH", warehouseName: "Bill Receiving", location: "Test" });
  const vendorA = await Vendor.create({ vendorCode: "BILL-A", vendorName: "Supplier A", email: "bill-a@example.test" }), vendorB = await Vendor.create({ vendorCode: "BILL-B", vendorName: "Supplier B", email: "bill-b@example.test" });
  const material = await RawMaterial.create({ materialCode: "BILL-RM", materialName: "Canonical steel", category: category._id, unit: unit._id });
  let serial = 0;
  const makePO = async (quantity = 100, price = 50, vendor = vendorA) => PurchaseOrder.create({ poNumber: `PO-BILL-${++serial}`, vendorId: vendor._id, warehouseId: warehouse._id, status: "APPROVED", createdBy: userId, items: [{ itemType: "RawMaterial", item: material._id, itemCodeSnapshot: material.materialCode, itemNameSnapshot: material.materialName, quantity, unitPrice: price }] });
  const receive = async (po, quantity, accepted = quantity) => { const refreshed = await PurchaseOrder.findById(po._id); const grn = await grnService.prepareDraft({ purchaseOrder: po._id, warehouse: warehouse._id, items: [{ poLineId: refreshed.items[0]._id, quantityReceived: quantity, acceptedQuantity: accepted, rejectedQuantity: quantity - accepted }] }, userId); await grnService.post(grn._id, userId); return grn; };
  const draft = async (po, invoice, quantity, price = 50, supplier = vendorA) => billService.createDraft({ purchaseOrder: po._id, supplier: supplier._id, supplierInvoiceNumber: invoice, invoiceDate: new Date(), lines: [{ poLineId: po.items[0]._id, quantity, unitPrice: price }] }, userId);

  const perfectPO = await makePO(); await receive(perfectPO, 100); const perfect = await draft(perfectPO, "INV-PERFECT", 100); const matched = await billService.submit(perfect._id, userId);
  assert.equal(matched.matchStatus, "MATCHED"); assert.equal(matched.reservationActive, true); assert.equal(matched.lines[0].itemType, "RawMaterial"); assert.equal(String(matched.lines[0].item), String(material._id)); assert.equal(matched.lines[0].matchResult.receivedQuantity, 100); assert.equal(matched.lines[0].matchResult.poUnitPriceMinor, 5000); assert.equal(matched.grandTotalMinor, 500000);
  const idempotent = await billService.submit(perfect._id, userId); assert.equal(idempotent.auditTrail.filter((a) => a.action === "SUBMITTED").length, 1); await billService.approve(perfect._id, userId); await assert.rejects(billService.updateDraft(perfect._id, { notes: "unsafe" }, userId), /Only Draft/); await assert.rejects(grnService.reverse((await GRN.findOne({ purchaseOrder: perfectPO._id }))._id, userId, "unsafe"), /supplier billing depends/);

  const partialPO = await makePO(); await receive(partialPO, 60); const partial = await draft(partialPO, "INV-PART-1", 60); assert.equal((await billService.submit(partial._id, userId)).matchStatus, "MATCHED"); const early = await draft(partialPO, "INV-PART-2", 40); let earlyResult = await billService.submit(early._id, userId); assert.equal(earlyResult.matchStatus, "EXCEPTION"); assert.equal(earlyResult.reservationActive, false); assert(earlyResult.lines[0].matchResult.reasons.some((r) => r.code === "QUANTITY_EXCEEDS_RECEIPT")); await receive(partialPO, 40); earlyResult = await billService.rematch(early._id, userId); assert.equal(earlyResult.matchStatus, "MATCHED"); assert.equal(earlyResult.reservationActive, true);

  const multiPO = await makePO(); await receive(multiPO, 30); await receive(multiPO, 40); await receive(multiPO, 30); const multi = await draft(multiPO, "INV-MULTI", 100); assert.equal((await billService.submit(multi._id, userId)).matchStatus, "MATCHED"); assert.equal((await PurchaseBill.findById(multi._id)).grnsConsidered.length, 3);

  const overPO = await makePO(); await receive(overPO, 100); const overA = await draft(overPO, "INV-OVER-A", 60); await billService.submit(overA._id, userId); const overB = await draft(overPO, "INV-OVER-B", 50); const overResult = await billService.submit(overB._id, userId); assert.equal(overResult.matchStatus, "EXCEPTION"); assert(overResult.lines[0].matchResult.reasons.some((r) => r.code === "OVERBILLED")); assert.equal((await PurchaseBill.aggregate([{ $match: { purchaseOrder: overPO._id, reservationActive: true } }, { $unwind: "$lines" }, { $group: { _id: null, quantity: { $sum: "$lines.quantity" } } }]))[0].quantity, 60);

  const pricePO = await makePO(10, 100); await receive(pricePO, 10); const price = await draft(pricePO, "INV-PRICE", 10, 105); const priceResult = await billService.submit(price._id, userId); assert.equal(priceResult.matchStatus, "EXCEPTION"); assert(priceResult.lines[0].matchResult.reasons.some((r) => r.code === "PRICE_MISMATCH")); await assert.rejects(billService.approve(price._id, userId), /explicit override/); await billService.approveException(price._id, userId, "Commercially authorized variance"); assert.equal((await PurchaseBill.findById(price._id)).exceptionOverride.approved, true);
  process.env.PURCHASE_BILL_PRICE_TOLERANCE_PERCENT = "5"; const boundaryPO = await makePO(2, 100); await receive(boundaryPO, 2); const atBoundary = await draft(boundaryPO, "INV-TOLERANCE", 1, 105); assert.equal((await billService.submit(atBoundary._id, userId)).matchStatus, "MATCHED"); const beyondBoundary = await draft(boundaryPO, "INV-TOLERANCE-OVER", 1, 105.01); assert.equal((await billService.submit(beyondBoundary._id, userId)).matchStatus, "EXCEPTION"); delete process.env.PURCHASE_BILL_PRICE_TOLERANCE_PERCENT;

  const duplicatePO = await makePO(10); await receive(duplicatePO, 10); await draft(duplicatePO, " inv-duplicate ", 5); await assert.rejects(draft(duplicatePO, "INV-DUPLICATE", 5), (error) => error.code === 11000); const otherPO = await makePO(10, 50, vendorB); await receive(otherPO, 10); assert(await draft(otherPO, "INV-DUPLICATE", 10, 50, vendorB)); await assert.rejects(draft(duplicatePO, "INV-WRONG-SUPPLIER", 1, 50, vendorB), /Supplier must match/);

  const concurrentPO = await makePO(20); await receive(concurrentPO, 20); const billA = await draft(concurrentPO, "INV-CONCURRENT-A", 20), billB = await draft(concurrentPO, "INV-CONCURRENT-B", 20); const concurrent = await Promise.all([billService.submit(billA._id, userId), billService.submit(billB._id, userId)]); assert.equal(concurrent.filter((b) => b.reservationActive).length, 1); assert.equal(concurrent.filter((b) => b.matchStatus === "EXCEPTION").length, 1); assert.equal((await PurchaseBill.find({ purchaseOrder: concurrentPO._id, reservationActive: true })).reduce((sum, b) => sum + b.lines[0].quantity, 0), 20);

  const rejectedPO = await makePO(5); await receive(rejectedPO, 5); const rejected = await draft(rejectedPO, "INV-REJECT", 5); await billService.submit(rejected._id, userId); await billService.reject(rejected._id, userId, "Invalid supplier document"); assert.equal((await PurchaseBill.findById(rejected._id)).reservationActive, false);

  const rollbackPO = await makePO(5); await receive(rollbackPO, 5); const rollback = await draft(rollbackPO, "INV-ROLLBACK", 5); const beforeVersion = (await PurchaseOrder.findById(rollbackPO._id).select("+billingVersion")).billingVersion; const originalSave = PurchaseBill.prototype.save; PurchaseBill.prototype.save = async function saveWithFailure(options) { if (this.status === "SUBMITTED") throw new Error("forced match persistence failure"); return originalSave.call(this, options); }; try { await assert.rejects(billService.submit(rollback._id, userId), /forced match persistence failure/); } finally { PurchaseBill.prototype.save = originalSave; } assert.equal((await PurchaseBill.findById(rollback._id)).status, "DRAFT"); assert.equal((await PurchaseOrder.findById(rollbackPO._id).select("+billingVersion")).billingVersion, beforeVersion);

  const responseState = { code: 200, body: null }; await purchaseOrderController.updatePOStatus({ params: { id: perfectPO._id }, body: { status: "CANCELLED" } }, { status(code) { responseState.code = code; return this; }, json(body) { responseState.body = body; return this; } }); assert.equal(responseState.code, 409); assert.match(responseState.body.message, /supplier billing depends/);

  assert.equal(await Invoice.countDocuments(), 0); assert.equal(await Payment.countDocuments(), 0);
});
