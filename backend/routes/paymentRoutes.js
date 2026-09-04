const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  reconcilePayment,
  getPayments,
} = require("../controllers/paymentController");

const router = express.Router();

router.use(protect);
router.post("/razorpay/order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);
router.post("/:id/reconcile", reconcilePayment);
router.get("/", getPayments);

module.exports = router;
