const express = require("express");

const router = express.Router();

const {
  getDashboardSummary, getRecentTransactions, getStockOverview, getTopMaterials, getMonthlyReport, getLowStockDashboardList
} = require("../controllers/dashboard/dashboardController");

router.get(
  "/summary",
  getDashboardSummary
);

router.get(
  "/recent-transactions",
  getRecentTransactions
);

router.get(
  "/stock-overview",
  getStockOverview
);

router.get(
  "/top-materials",
  getTopMaterials
);

router.get(
  "/monthly-report",
  getMonthlyReport
);

router.get(
  "/low-stock-list",
  getLowStockDashboardList
);

module.exports = router;