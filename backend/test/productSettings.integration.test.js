const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
require("dotenv").config();

const controllers = require("../controllers/productSettingsController");

const uri = process.env.TEST_MONGODB_URI;
const enabled = Boolean(uri && /product-settings-test/i.test(uri));

const invoke = async (handler, { body = {}, params = {}, query = {} } = {}) => {
  const response = { statusCode: 200, payload: null };
  const res = {
    status(code) { response.statusCode = code; return this; },
    json(payload) { response.payload = payload; return this; },
  };
  await handler({ body, params, query }, res);
  return response;
};

test("Product Settings CRUD and category relationship", { skip: !enabled }, async (t) => {
  await mongoose.connect(uri);
  assert.match(mongoose.connection.name, /product-settings-test/i);
  t.after(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

  const category = await invoke(controllers.category.create, { body: { name: "Pumps", description: "Pump products", status: "Active" } });
  assert.equal(category.statusCode, 201);
  const categoryId = category.payload.data._id.toString();

  const duplicate = await invoke(controllers.category.create, { body: { name: "pumps" } });
  assert.equal(duplicate.statusCode, 409);

  const subcategory = await invoke(controllers.subcategory.create, { body: { category: categoryId, name: "Centrifugal", status: "Active" } });
  assert.equal(subcategory.statusCode, 201);

  const blockedDelete = await invoke(controllers.category.remove, { params: { id: categoryId } });
  assert.equal(blockedDelete.statusCode, 409);

  const cases = [
    ["brand", { name: "KSB", description: "Test brand", status: "Active" }, { name: "KSB Updated", description: "Test brand", status: "Inactive" }],
    ["unit", { name: "Piece", shortName: "Pc", status: "Active" }, { name: "Pieces", shortName: "Pcs", status: "Inactive" }],
    ["hsn", { hsnCode: "841370", description: "Pumps", gstPercentage: 18 }, { hsnCode: "841370", description: "Pump equipment", gstPercentage: 12 }],
    ["warehouse", { warehouseCode: "TEST-WH", warehouseName: "Test Warehouse", location: "Test City", status: "Active" }, { warehouseCode: "TEST-WH", warehouseName: "Updated Warehouse", location: "Test City", status: "Inactive" }],
  ];

  for (const [key, createBody, updateBody] of cases) {
    const created = await invoke(controllers[key].create, { body: createBody });
    assert.equal(created.statusCode, 201, `${key} create`);
    const id = created.payload.data._id.toString();
    const listed = await invoke(controllers[key].list, { query: { search: "test", limit: "10" } });
    assert.equal(listed.statusCode, 200, `${key} list`);
    const updated = await invoke(controllers[key].update, { params: { id }, body: updateBody });
    assert.equal(updated.statusCode, 200, `${key} update`);
    const removed = await invoke(controllers[key].remove, { params: { id } });
    assert.equal(removed.statusCode, 200, `${key} delete`);
  }

  const subcategoryId = subcategory.payload.data._id.toString();
  assert.equal((await invoke(controllers.subcategory.update, { params: { id: subcategoryId }, body: { category: categoryId, name: "Centrifugal Pumps", status: "Inactive" } })).statusCode, 200);
  assert.equal((await invoke(controllers.subcategory.remove, { params: { id: subcategoryId } })).statusCode, 200);
  assert.equal((await invoke(controllers.category.remove, { params: { id: categoryId } })).statusCode, 200);
});
