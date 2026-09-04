const express = require("express");

const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");

const {
  createWarehouse,getWarehouses,getWarehouseById,updateWarehouse,deleteWarehouse,
} = require("../controllers/warehouseController");

router.use(protect, restrictTo("Super Admin", "Admin"));

router.post("/", createWarehouse);

router.get("/", getWarehouses);

router.get("/:id", getWarehouseById);

router.put("/:id", updateWarehouse);

router.delete("/:id", deleteWarehouse);

module.exports = router;
