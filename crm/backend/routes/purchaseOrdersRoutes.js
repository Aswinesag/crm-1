const express = require("express");

const router = express.Router();

const {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    deletePurchaseOrder,
    updatePurchaseOrderStatus
} = require("../controllers/purchaseOrdersController");

router.post("/", createPurchaseOrder);

router.get("/", getPurchaseOrders);

router.get("/:id", getPurchaseOrderById);

router.put("/:id", updatePurchaseOrder);

router.delete("/:id", deletePurchaseOrder);

router.patch("/:id/status", updatePurchaseOrderStatus);

module.exports = router;