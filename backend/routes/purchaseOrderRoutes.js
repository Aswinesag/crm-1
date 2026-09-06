const express = require("express");

const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");

const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getSinglePurchaseOrder,
  updatePOStatus,
} = require(
  "../controllers/purchaseOrder/purchaseOrderController"
);

router.use(protect, restrictTo("Super Admin", "Admin"));



// CREATE PO
router.post("/", createPurchaseOrder);



// GET ALL PO
router.get("/", getAllPurchaseOrders);



// GET SINGLE PO
router.get("/:id", getSinglePurchaseOrder);



// UPDATE STATUS
router.put("/:id/status", updatePOStatus);



module.exports = router;
