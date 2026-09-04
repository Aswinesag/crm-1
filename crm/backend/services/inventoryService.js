// services/inventoryService.js

const Inventory = require("../models/Inventory");
const StockMovement = require("../models/inventory/stockMovementModel");

/**
 * Generate Movement Number
 */
const generateMovementNumber = async () => {
  const count = await StockMovement.countDocuments();

  return `MOV-${String(count + 1001)}`;
};

/**
 * Process Stock Movement
 */
const processStockMovement = async ({
  materialId,
  warehouseId,
  quantity,
  movementType,
  direction,
  referenceModel = null,
  referenceId = null,
  remarks = "",
  userId = null,
}) => {
  try {
    // ==========================
    // VALIDATION
    // ==========================
    if (!materialId) {
      throw new Error("Material ID is required");
    }

    if (!quantity || quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    if (!movementType) {
      throw new Error("Movement type is required");
    }

    if (!direction) {
      throw new Error("Direction is required");
    }

    // ==========================
    // FIND INVENTORY
    // ==========================
    let inventory = await Inventory.findOne({
      materialId,
      warehouseId,
    });

    // ==========================
    // CREATE INVENTORY IF MISSING
    // ==========================
    if (!inventory) {
      inventory = await Inventory.create({
       materialId,
       warehouseId,
       quantity: 0,
      });
    }

    // ==========================
    // STOCK CALCULATIONS
    // ==========================
    const beforeStock = inventory.quantity;

    let afterStock = beforeStock;

    if (direction === "IN") {
      afterStock = beforeStock + quantity;
    } else if (direction === "OUT") {
      afterStock = beforeStock - quantity;

      if (afterStock < 0) {
        throw new Error(
          `Insufficient stock. Available: ${beforeStock}, Requested: ${quantity}`
        );
      }
    } else {
      throw new Error("Invalid direction. Use IN or OUT");
    }

    // ==========================
    // UPDATE INVENTORY
    // ==========================
    inventory.quantity = afterStock;

    inventory.availableStock =
      afterStock - inventory.reservedStock;

    inventory.updatedBy = userId;

    await inventory.save();

    // ==========================
    // CREATE STOCK MOVEMENT
    // ==========================
    const movementNumber = await generateMovementNumber();

    const movement = await StockMovement.create({
      movementNumber,

      material: materialId,

      movementType,

      direction,

      quantity,

      beforeStock,

      afterStock,

      referenceModel,

      referenceId,

      remarks,

      createdBy: userId,
    });

    return {
      success: true,
      movement,
      inventory,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  processStockMovement,
};