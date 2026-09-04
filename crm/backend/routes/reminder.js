const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const { getReminders , addReminder } = require("../controllers/reminderController");
const router = express.Router();

// Protect all routes
router.use(protect);

// GET /api/reminders - Get reminders
router.get("/", getReminders);
router.post("/addReminder", addReminder);

module.exports = router;