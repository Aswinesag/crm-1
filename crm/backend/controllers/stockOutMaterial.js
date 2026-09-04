const Material = require("../models/Material");
const StockTransaction = require("../models/StockTransaction");

const stockOutMaterial = async (req, res) => {
  try {
    const {
      materialId,
      quantity,
      referenceNumber,
      remarks,
      createdBy,
    } = req.body;

    // VALIDATION

    if (!materialId || !quantity || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "materialId, quantity and createdBy are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // FIND MATERIAL

    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // CHECK STOCK AVAILABILITY

    if (material.currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${material.currentStock}`,
      });
    }

    // REDUCE STOCK

    const beforeStock = material.currentStock;

    const afterStock = beforeStock - quantity;

    material.currentStock = afterStock;

    await material.save();

    // CREATE STOCK TRANSACTION

   const stockTransaction = await StockTransaction.create({
    materialId,
    transactionType: "OUT",
    quantity,
    beforeStock,
    afterStock,
    referenceNumber,
    remarks,
    createdBy,
    });

    return res.status(200).json({
      success: true,
      message: "Stock out successful",
      data: {
        material,
        stockTransaction,
      },
    });
  } catch (error) {
    console.error("Stock Out Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = stockOutMaterial;