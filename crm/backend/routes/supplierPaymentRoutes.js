const express = require("express");

const router = express.Router();

const supplierPaymentController = require(
    "../controllers/supplierPaymentController"
);

/*
=================================================
SUPPLIER PAYMENT ROUTES
Base URL : /api/supplier-payments
=================================================
*/

// Create Supplier Payment
router.post(
    "/",
    supplierPaymentController.createSupplierPayment
);

// Get All Supplier Payments
router.get(
    "/",
    supplierPaymentController.getSupplierPayments
);

// Get Supplier Payment By ID
router.get(
    "/:id",
    supplierPaymentController.getSupplierPaymentById
);

// Update Supplier Payment
router.put(
    "/:id",
    supplierPaymentController.updateSupplierPayment
);

// Activate Supplier Payment
router.patch(
    "/:id/activate",
    supplierPaymentController.activateSupplierPayment
);

// Deactivate Supplier Payment
router.patch(
    "/:id/deactivate",
    supplierPaymentController.deactivateSupplierPayment
);

// Hard Delete Supplier Payment
router.delete(
    "/:id",
    supplierPaymentController.deleteSupplierPayment
);

module.exports = router;