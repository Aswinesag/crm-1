const express = require("express");

const router = express.Router();
const blockLegacyMaterialWrites = require("../middleware/blockLegacyMaterialWrites");

const {
  stockInMaterial,
} = require("../controllers/stockController");
const {
  stockOutMaterial,
} = require("../controllers/stockOutMaterial");

const {
  getStockTransactions,
} = require("../controllers/stockTransactionController");

router.post("/in", blockLegacyMaterialWrites);

router.post("/out", blockLegacyMaterialWrites);

router.get("/transactions", getStockTransactions);

module.exports = router;
