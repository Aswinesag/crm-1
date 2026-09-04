const express = require("express");
const router = express.Router();

const {
  createStockOut,
  getStockOuts,
  getStockOutById,
  updateStockOut,
  deleteStockOut,
} = require("../controllers/stockOutController");


// ===============================
// STOCK OUT ROUTES
// ===============================

// Create Stock Out
router.post("/", createStockOut);

// Get All Stock Outs
router.get("/",  getStockOuts);

// Get Single Stock Out
router.get("/:id", getStockOutById);

// Update Stock Out
router.put("/:id", updateStockOut);

// Delete Stock Out
router.delete("/:id", deleteStockOut);

module.exports = router;