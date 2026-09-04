const express = require("express");

const router = express.Router();

const {
  getERPSummary,
  getPurchaseSummary,
  getWarehouseSummary,
  getTopVendors
} = require(
  "../../controllers/dashboard/erpDashboardController"
);

router.get("/summary", getERPSummary);

router.get(
  "/purchase-summary",
  getPurchaseSummary
);

router.get(
  "/warehouse-summary",
  getWarehouseSummary
);

router.get(
  "/top-vendors",
  getTopVendors
);

module.exports = router;