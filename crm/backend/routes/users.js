const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const {
  createUser,
  getAllUsers,
  getSelfOrSubordinates,
  updateUser,
  deleteUser,
  updateSelfProfile,
  getDeletedUsers,
  deleteAvatar
} = require("../controllers/userController");
const upload = require('../middleware/multer');
const router = express.Router();

// Protect all routes
router.use(protect);

// GET all users (Super Admin & Admin only)
router.get("/", restrictTo("Super Admin", "Admin"), getAllUsers);

// CREATE user (Super Admin can create all roles, Admin can create Coordinator/Engineer)
router.post(
  "/",
  restrictTo("Super Admin", "Admin"),
  createUser
);

// GET self or subordinates (All authenticated users)
router.get("/self-or-subordinates", getSelfOrSubordinates);

// NEW: Self-update route (any logged-in user)
router.put('/me', upload.single('avatar'), updateSelfProfile);

router.delete('/me/avatar', deleteAvatar);

// UPDATE user (Super Admin & Admin only)
router.put("/:id", restrictTo("Super Admin", "Admin"), updateUser);

// DELETE user (Super Admin only)
router.delete("/:id", restrictTo("Super Admin"), deleteUser);

router.get('/trash',restrictTo('Super Admin'),getDeletedUsers);

module.exports = router;
