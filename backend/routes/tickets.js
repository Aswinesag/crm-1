const express = require("express");
const router = express.Router();

// ✅ FIXED: destructuring import
const { protect, restrictTo } = require("../middleware/auth");

const {
  createTicket,
  getTicketCount,getAllTickets,updateTicketStatus
} = require("../controllers/ticketController");

// ✅ DEBUG (optional, you can remove later)
console.log("Handler:", protect, createTicket);

// ✅ Create Ticket
router.post(
  "/",
  protect,                // ✅ correct middleware
  // restrictTo("admin"), // 👉 optional (uncomment if needed)
  createTicket
);

// ✅ Get Count
router.get(
  "/count",
  protect,                // ✅ correct middleware
  getTicketCount
);

// GET ALL TICKETS
router.get("/", getAllTickets);

// ✅ UPDATE TICKET STATUS
router.put(
  "/:id",
  protect,              // optional but recommended
  updateTicketStatus
);

module.exports = router;