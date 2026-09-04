const { warehouse } = require("./productSettingsController");

const createWarehouse = warehouse.create;
const getWarehouses = warehouse.list;
const getWarehouseById = warehouse.get;
const updateWarehouse = warehouse.update;
const deleteWarehouse = warehouse.remove;

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};
