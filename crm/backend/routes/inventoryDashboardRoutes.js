const express = require("express");

const router = express.Router();

const {
  getInventoryDashboard
} = require(
  "../controllers/dashboard/inventoryDashboardController"
);

router.get(
  "/inventory",
  getInventoryDashboard
);

module.exports = router;