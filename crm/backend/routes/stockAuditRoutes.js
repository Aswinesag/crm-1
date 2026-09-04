const express = require("express");

const router = express.Router();

const {

    createStockAudit,

    getStockAudits,

    getStockAuditById,

    updateStockAudit,

    deleteStockAudit,

} = require("../controllers/stockAuditController");


// Create
router.post("/", createStockAudit);

// Get All
router.get("/", getStockAudits);

// Get One
router.get("/:id", getStockAuditById);

// Update
router.put("/:id", updateStockAudit);

// Delete
router.delete("/:id", deleteStockAudit);

module.exports = router;