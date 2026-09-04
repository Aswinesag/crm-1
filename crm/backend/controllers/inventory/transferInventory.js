const Inventory = require("../../models/Inventory");
const StockTransaction = require("../../models/StockTransaction");

const transferInventory = async (req, res) => {
  try {
    const {
      materialId,
      sourceWarehouseId,
      destinationWarehouseId,
      quantity,
      remarks,
      createdBy,
    } = req.body;

    // ================= VALIDATION =================

    if (
      !materialId ||
      !sourceWarehouseId ||
      !destinationWarehouseId ||
      !quantity
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // SOURCE & DESTINATION CANNOT BE SAME

    if (sourceWarehouseId === destinationWarehouseId) {
      return res.status(400).json({
        success: false,
        message: "Source and destination warehouse cannot be same",
      });
    }

    // ================= SOURCE INVENTORY =================

    const sourceInventory = await Inventory.findOne({
      materialId,
      warehouseId: sourceWarehouseId,
    });

    if (!sourceInventory) {
      return res.status(404).json({
        success: false,
        message: "Source warehouse inventory not found",
      });
    }

    // ================= STOCK CHECK =================

    if (sourceInventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock in source warehouse",
      });
    }

    // ================= DESTINATION INVENTORY =================

    let destinationInventory = await Inventory.findOne({
      materialId,
      warehouseId: destinationWarehouseId,
    });

    // CREATE DESTINATION INVENTORY IF NOT EXISTS

    if (!destinationInventory) {
      destinationInventory = await Inventory.create({
        materialId,
        warehouseId: destinationWarehouseId,
        quantity: 0,
      });
    }

    // =========================================================
    // SOURCE WAREHOUSE STOCK CALCULATIONS
    // =========================================================

    const sourceBeforeStock = sourceInventory.quantity;

    const sourceAfterStock =
      sourceInventory.quantity - quantity;

    // =========================================================
    // DESTINATION WAREHOUSE STOCK CALCULATIONS
    // =========================================================

    const destinationBeforeStock =
      destinationInventory.quantity;

    const destinationAfterStock =
      destinationInventory.quantity + quantity;

    // =========================================================
    // UPDATE SOURCE INVENTORY
    // =========================================================

    sourceInventory.quantity = sourceAfterStock;

    await sourceInventory.save();

    // =========================================================
    // UPDATE DESTINATION INVENTORY
    // =========================================================

    destinationInventory.quantity =
      destinationAfterStock;

    await destinationInventory.save();

    // =========================================================
    // CREATE TRANSFER OUT TRANSACTION
    // =========================================================

    const transferOutTransaction =
      await StockTransaction.create({
        materialId,

        warehouseId: sourceWarehouseId,

        transactionType: "TRANSFER_OUT",

        quantity,

        beforeStock: sourceBeforeStock,

        afterStock: sourceAfterStock,

        remarks,

        createdBy,
      });

    // =========================================================
    // CREATE TRANSFER IN TRANSACTION
    // =========================================================

    const transferInTransaction =
      await StockTransaction.create({
        materialId,

        warehouseId: destinationWarehouseId,

        transactionType: "TRANSFER_IN",

        quantity,

        beforeStock: destinationBeforeStock,

        afterStock: destinationAfterStock,

        remarks,

        createdBy,
      });

    // ================= SUCCESS RESPONSE =================

    return res.status(200).json({
      success: true,
      message: "Inventory transferred successfully",

      transferOutTransaction,

      transferInTransaction,
    });
  } catch (error) {
    console.error("Transfer Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = transferInventory;