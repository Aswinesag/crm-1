const express = require("express");

const router = express.Router();

const {

    createStockTransfer,

    getStockTransfers,

    getStockTransferById,

    deleteStockTransfer

} = require("../controllers/stockTransferController");


// Create
router.post("/", createStockTransfer);

// Get All
router.get("/", getStockTransfers);

// Get One
router.get("/:id", getStockTransferById);

// Delete
router.delete("/:id", deleteStockTransfer);

module.exports = router;