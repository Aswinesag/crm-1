const express = require("express");

const router = express.Router();

const {
  getAllStockMovements,
  getSingleStockMovement,
  getMovementsByMaterial,
} = require("../controllers/stockMovementController");

const { protect } = require("../middleware/auth");

router.get(
  "/",
  protect,
  getAllStockMovements
);

router.get(
  "/:id",
  protect,
  getSingleStockMovement
);

router.get(
  "/material/:materialId",
  protect,
  getMovementsByMaterial
);

module.exports = router;