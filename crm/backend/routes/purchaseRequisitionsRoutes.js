const express = require("express");

const router = express.Router();

const {
    createPurchaseRequisition,
    getAllPurchaseRequisitions,
    getPurchaseRequisitionById,
    updatePurchaseRequisition,
    deletePurchaseRequisition,
    approvePurchaseRequisition,
    rejectPurchaseRequisition,
    markAsOrdered,
    markAsCompleted,
    getPurchaseRequisitionDashboard
} = require("../controllers/purchaseRequisitionsController");

// ======================================================
// Dashboard
// ======================================================
router.get("/dashboard", getPurchaseRequisitionDashboard);

// ======================================================
// Create Purchase Requisition
// ======================================================
router.post("/", createPurchaseRequisition);

// ======================================================
// Get All Purchase Requisitions
// ======================================================
router.get("/", getAllPurchaseRequisitions);

// ======================================================
// Get Purchase Requisition By ID
// ======================================================
router.get("/:id", getPurchaseRequisitionById);

// ======================================================
// Update Purchase Requisition
// ======================================================
router.put("/:id", updatePurchaseRequisition);

// ======================================================
// Delete Purchase Requisition
// ======================================================
router.delete("/:id", deletePurchaseRequisition);

// ======================================================
// Approve Purchase Requisition
// ======================================================
router.put("/:id/approve", approvePurchaseRequisition);

// ======================================================
// Reject Purchase Requisition
// ======================================================
router.put("/:id/reject", rejectPurchaseRequisition);

// ======================================================
// Mark Purchase Requisition as Ordered
// ======================================================
router.put("/:id/ordered", markAsOrdered);

// ======================================================
// Mark Purchase Requisition as Completed
// ======================================================
router.put("/:id/completed", markAsCompleted);

// ======================================================
// Export Router
// ======================================================
module.exports = router;