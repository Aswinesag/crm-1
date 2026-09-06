const express = require("express");

const router = express.Router();

const {
  createGRN,
  getAllGRNs,
  getSingleGRN,
  updateGRN,
  deleteGRN,
  postGRN,
  reverseGRN,
} = require("../controllers/grn/grnController");

const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("Super Admin", "Admin"));

// ==============================================
// CREATE GRN
// ==============================================
router.post("/", createGRN);

// ==============================================
// GET ALL GRNS
// ==============================================
router.get("/", getAllGRNs);

router.post("/:id/post", postGRN);
router.post("/:id/reverse", reverseGRN);

// ==============================================
// GET SINGLE GRN
// ==============================================
router.get("/:id", getSingleGRN);

// ==============================================
// UPDATE GRN
// ==============================================
router.put("/:id", updateGRN);

// ==============================================
// DELETE GRN
// ==============================================
router.delete("/:id", deleteGRN);

module.exports = router;
