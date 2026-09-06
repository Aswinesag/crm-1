const express = require("express");

const router =
  express.Router();
const blockLegacyMaterialWrites = require("../../middleware/blockLegacyMaterialWrites");

const {
  createStockIssue,
  getAllStockIssues,
  getStockIssueById,
} = require(
  "../../controllers/stockIssue/stockIssueController"
);

router.post(
  "/",
  blockLegacyMaterialWrites
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
