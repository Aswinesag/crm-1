const Material = require("../models/Material");
const StockTransaction = require("../models/StockTransaction");

const stockInMaterial = async (req, res) => {
  try {
    const {
      materialId,
      quantity,
      referenceNumber,
      remarks,
      createdBy,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (!materialId) {
      return res.status(400).json({
        message: "Material ID is required",
      });
    }

    if (!quantity) {
      return res.status(400).json({
        message: "Quantity is required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    // =========================
    // FIND MATERIAL
    // =========================

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }

    // =========================
    // STOCK CALCULATION
    // =========================

    const beforeStock = material.currentStock;

    const afterStock = beforeStock + Number(quantity);

    // =========================
    // UPDATE MATERIAL STOCK
    // =========================

    material.currentStock = afterStock;

    await material.save();

    // =========================
    // CREATE TRANSACTION
    // =========================

    const transaction = await StockTransaction.create({
      materialId: material._id,

      transactionType: "IN",

      quantity,

      beforeStock,

      afterStock,

      referenceNumber,

      remarks,

      createdBy,
    });

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({
      success: true,

      message: "Stock added successfully",

      material: {
        materialId: material._id,

        materialCode: material.materialCode,

        materialName: material.materialName,

        previousStock: beforeStock,

        addedQuantity: quantity,

        currentStock: afterStock,
      },

      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

module.exports = {
  stockInMaterial,
};