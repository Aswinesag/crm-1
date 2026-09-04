const express = require("express");

const router = express.Router();

const purchaseReturnController = require(
    "../controllers/purchaseReturnController"
);

/*
=================================================
PURCHASE RETURN ROUTES
Base URL : /api/purchase-returns
=================================================
*/

// Create Purchase Return
router.post(
    "/",
    purchaseReturnController.createPurchaseReturn
);

// Get All Purchase Returns
router.get(
    "/",
    purchaseReturnController.getPurchaseReturns
);

// Get Purchase Return By ID
router.get(
    "/:id",
    purchaseReturnController.getPurchaseReturnById
);

// Update Purchase Return
router.put(
    "/:id",
    purchaseReturnController.updatePurchaseReturn
);

// Delete Purchase Return
router.delete(
    "/:id",
    purchaseReturnController.deletePurchaseReturn
);

module.exports = router;