const express = require("express");
const router = express.Router();

const {
  getLowStockMaterials,
} = require("../controllers/lowStockAlertController");

router.get("/low-stock", getLowStockMaterials);

module.exports = router;