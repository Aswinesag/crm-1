const express = require("express");

const router = express.Router();

const {
  stockInMaterial,
} = require("../controllers/stockController");
const stockOutMaterial = require("../controllers/stockOutMaterial");

const {
  getStockTransactions,
} = require("../controllers/stockTransactionController");

router.post("/in", stockInMaterial);

router.post("/out", stockOutMaterial);

router.get("/transactions", getStockTransactions);

module.exports = router;