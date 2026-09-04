const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth");
const controller = require("../controllers/inventoryController");

router.use(protect, restrictTo("Super Admin", "Admin"));
router.get("/", controller.getInventory);
router.get("/transactions", controller.getTransactions);
router.get("/audits", controller.getAudits);
router.get("/reorder-alerts", controller.getReorderAlerts);
router.get("/warehouse/:warehouseId", controller.getInventoryByWarehouse);
router.get("/:itemType/:itemId", controller.getInventoryByItem);
router.post("/stock-in", controller.stockIn);
router.post("/stock-out", controller.stockOut);
router.post("/transfer", controller.transfer);
router.post("/audit", controller.audit);
module.exports = router;
