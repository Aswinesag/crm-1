const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
require("dotenv").config();

const controllers = require("../controllers/productMasterController");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");
const Unit = require("../models/Unit");
const HsnCode = require("../models/HsnCode");
const { protect, restrictTo } = require("../middleware/auth");

const uri = process.env.TEST_MONGODB_URI;
const enabled = Boolean(uri && /product-master-test/i.test(uri));
const invoke = async (handler, input = {}) => {
  const result = { statusCode: 200 };
  const res = { status(code) { result.statusCode = code; return this; }, json(payload) { result.payload = payload; return this; } };
  await handler({ body: input.body || {}, params: input.params || {}, query: input.query || {}, headers: input.headers || {}, user: input.user }, res, () => { result.next = true; });
  return result;
};

test("Product Master authorization middleware rejects unauthenticated and unauthorized requests", async () => {
  assert.equal((await invoke(protect)).statusCode, 401);
  assert.equal((await invoke(restrictTo("Admin"), { body: {}, user: { role: "Engineer" } })).statusCode, 403);
});

test("Product, Raw Material, and Component CRUD validation", { skip: !enabled }, async (t) => {
  await mongoose.connect(uri);
  assert.match(mongoose.connection.name, /product-master-test/i);
  t.after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });
  const category = await Category.create({ name: "Mechanical", status: "Active" });
  const otherCategory = await Category.create({ name: "Electrical", status: "Active" });
  const subCategory = await SubCategory.create({ category: category._id, name: "Pumps", status: "Active" });
  const brand = await Brand.create({ name: "Test Brand", status: "Active" });
  const unit = await Unit.create({ name: "Piece", shortName: "Pc", status: "Active" });
  const hsn = await HsnCode.create({ hsnCode: "841370", description: "Pumps", gstPercentage: 18 });

  const productBody = { productCode: "prd-001", productName: "Test Pump", productType: "Finished Product", category: category._id.toString(), subCategory: subCategory._id.toString(), brand: brand._id.toString(), unit: unit._id.toString(), hsnCode: hsn._id.toString(), costPrice: 100, sellingPrice: 150, mrp: 180, discount: 5, reorderLevel: 2, status: "Active" };
  const product = await invoke(controllers.product.create, { body: productBody });
  assert.equal(product.statusCode, 201); assert.equal(product.payload.data.productCode, "PRD-001");
  assert.equal((await invoke(controllers.product.create, { body: productBody })).statusCode, 409);
  assert.equal((await invoke(controllers.product.create, { body: { ...productBody, productCode: "PRD-002", category: otherCategory._id.toString() } })).statusCode, 400);
  assert.equal((await invoke(controllers.product.create, { body: { ...productBody, productCode: "PRD-003", category: new mongoose.Types.ObjectId().toString(), subCategory: "" } })).statusCode, 400);
  const productId = product.payload.data._id.toString();
  assert.equal((await invoke(controllers.product.get, { params: { id: productId } })).statusCode, 200);
  const page = await invoke(controllers.product.list, { query: { page: "1", limit: "1", search: "pump", status: "Active" } });
  assert.equal(page.statusCode, 200); assert.equal(page.payload.data.length, 1); assert.equal(page.payload.currentPage, 1);
  assert.equal((await invoke(controllers.product.update, { params: { id: productId }, body: { ...productBody, productName: "Updated Pump" } })).statusCode, 200);
  const removedProduct = await invoke(controllers.product.remove, { params: { id: productId } });
  assert.equal(removedProduct.payload.data.status, "Inactive");

  for (const [controller, body, codeField] of [
    [controllers.rawMaterial, { materialCode: "rm-001", materialName: "Steel", category: category._id.toString(), unit: unit._id.toString(), hsnCode: hsn._id.toString(), costPrice: 20, reorderLevel: 10 }, "materialCode"],
    [controllers.component, { componentCode: "cmp-001", componentName: "Impeller", category: category._id.toString(), unit: unit._id.toString(), hsnCode: hsn._id.toString(), costPrice: 40, reorderLevel: 4 }, "componentCode"],
  ]) {
    const created = await invoke(controller.create, { body }); assert.equal(created.statusCode, 201);
    assert.equal((await invoke(controller.create, { body })).statusCode, 409);
    assert.equal((await invoke(controller.create, { body: { ...body, [codeField]: `${body[codeField]}-bad`, unit: new mongoose.Types.ObjectId().toString() } })).statusCode, 400);
    const id = created.payload.data._id.toString();
    assert.equal((await invoke(controller.list, { query: { search: body[codeField], status: "Active" } })).statusCode, 200);
    assert.equal((await invoke(controller.get, { params: { id } })).statusCode, 200);
    assert.equal((await invoke(controller.update, { params: { id }, body: { ...body, description: "Updated" } })).statusCode, 200);
    assert.equal((await invoke(controller.remove, { params: { id } })).payload.data.status, "Inactive");
  }
});
