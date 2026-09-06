const express = require("express");

const router = express.Router();

const {
  createRFQ,
  getAllRFQs,
  getSingleRFQ,
  sendRFQ,
  submitQuotation,
  closeRFQ,
  getRFQById,
  createPurchaseOrder,
} = require("../controllers/rfq/rfqController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("Super Admin", "Admin"));



// CREATE RFQ
router.post("/", createRFQ);



// GET ALL RFQs
router.get("/", getAllRFQs);



// GET SINGLE RFQ
router.get("/:id", getSingleRFQ);



// SEND RFQ
router.put("/:id/send", sendRFQ);



// SUBMIT QUOTATION
router.put("/:id/quotation", submitQuotation);



// CLOSE RFQ
router.put("/:id/close", closeRFQ);
router.post("/:id/purchase-order", createPurchaseOrder);

module.exports = router;
