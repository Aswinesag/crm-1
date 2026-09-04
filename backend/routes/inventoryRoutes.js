const express = require("express");

const router = express.Router();

const {
  upsertInventory,getInventoryByWarehouse,getInventoryByMaterial,getInventory,
} = require("../controllers/inventoryController");
const {
  transferInventory,
} = require("../controllers/inventory/transferInventory");

router.post("/", upsertInventory);

router.get(
  "/warehouse/:warehouseId",
  getInventoryByWarehouse
);

router.get(
  "/material/:materialId",
  getInventoryByMaterial
);

router.get("/", getInventory);

router.post("/transfer", transferInventory);

module.exports = router;