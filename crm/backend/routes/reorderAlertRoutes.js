const express = require("express");

const router = express.Router();

const {
    getReorderAlerts
} = require("../controllers/reorderAlertController");

// ==============================================
// GET REORDER ALERTS
// ==============================================

router.get("/", getReorderAlerts);

module.exports = router;