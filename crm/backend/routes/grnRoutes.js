const express = require("express");

const router = express.Router();

const {
  createGRN,
  getAllGRNs,
  getSingleGRN,
  updateGRN,
  deleteGRN,
} = require("../controllers/grn/grnController");

const { protect } = require("../middleware/auth");

// ==============================================
// CREATE GRN
// ==============================================
router.post("/", protect, createGRN);

// ==============================================
// GET ALL GRNS
// ==============================================
router.get("/", protect, getAllGRNs);

// ==============================================
// GET SINGLE GRN
// ==============================================
router.get("/:id", protect, getSingleGRN);

// ==============================================
// UPDATE GRN
// ==============================================
router.put("/:id", protect, updateGRN);

// ==============================================
// DELETE GRN
// ==============================================
router.delete("/:id", protect, deleteGRN);

module.exports = router;