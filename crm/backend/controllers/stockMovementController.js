const StockMovement = require("../models/inventory/stockMovementModel");

// =============================================
// GET ALL STOCK MOVEMENTS
// =============================================
const getAllStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate(
        "material",
        "materialCode materialName unit"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// GET SINGLE MOVEMENT
// =============================================
const getSingleStockMovement = async (
  req,
  res
) => {
  try {
    const movement =
      await StockMovement.findById(req.params.id)
        .populate(
          "material",
          "materialCode materialName unit"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!movement) {
      return res.status(404).json({
        success: false,
        message:
          "Stock movement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: movement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// GET MOVEMENTS BY MATERIAL
// =============================================
const getMovementsByMaterial =
  async (req, res) => {
    try {
      const movements =
        await StockMovement.find({
          material: req.params.materialId,
        })
          .populate(
            "material",
            "materialCode materialName unit"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
        count: movements.length,
        data: movements,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  getAllStockMovements,
  getSingleStockMovement,
  getMovementsByMaterial,
};