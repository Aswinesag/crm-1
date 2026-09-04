const express = require("express");
const router = express.Router();

const {
  createRequestForQuotation,
  getAllRequestForQuotations,
  getRequestForQuotationById,
  updateRequestForQuotation,
  deleteRequestForQuotation,
  updateRequestForQuotationStatus,
} = require("../controllers/requestForQuotationController");

// ==========================================
// Create RFQ
// POST /api/request-for-quotations
// ==========================================
router.post("/", createRequestForQuotation);

// ==========================================
// Get All RFQs
// GET /api/request-for-quotations
// ==========================================
router.get("/", getAllRequestForQuotations);

// ==========================================
// Get RFQ By ID
// GET /api/request-for-quotations/:id
// ==========================================
router.get("/:id", getRequestForQuotationById);

// ==========================================
// Update RFQ
// PUT /api/request-for-quotations/:id
// ==========================================
router.put("/:id", updateRequestForQuotation);

// ==========================================
// Update RFQ Status
// PATCH /api/request-for-quotations/:id/status
// ==========================================
router.patch("/:id/status", updateRequestForQuotationStatus);

// ==========================================
// Delete RFQ
// DELETE /api/request-for-quotations/:id
// ==========================================
router.delete("/:id", deleteRequestForQuotation);

module.exports = router;