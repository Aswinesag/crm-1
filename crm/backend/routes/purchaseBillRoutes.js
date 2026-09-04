const express = require("express");

const router = express.Router();

const purchaseBillController = require(
    "../controllers/purchaseBillController"
);

/*
=================================================
PURCHASE BILL ROUTES

Base URL :
/api/purchase-bills
=================================================
*/

// Create Purchase Bill
router.post(
    "/",
    purchaseBillController.createPurchaseBill
);

// Get All Purchase Bills
router.get(
    "/",
    purchaseBillController.getPurchaseBills
);

// Get Purchase Bill By ID
router.get(
    "/:id",
    purchaseBillController.getPurchaseBillById
);

// Update Purchase Bill
router.put(
    "/:id",
    purchaseBillController.updatePurchaseBill
);

// Delete Purchase Bill
router.delete(
    "/:id",
    purchaseBillController.deletePurchaseBill
);

module.exports = router;