const express = require("express");

const router =
  express.Router();

const {
  createStockIssue,
  getAllStockIssues,
  getStockIssueById,
} = require(
  "../../controllers/stockIssue/stockIssueController"
);

router.post(
  "/",
  createStockIssue
);

router.get(
  "/",
  getAllStockIssues
);

router.get(
  "/:id",
  getStockIssueById
);

module.exports = router;