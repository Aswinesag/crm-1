const Inventory = require("../models/Inventory");
const Warehouse = require("../models/Warehouse");

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("materialId");

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const upsertInventory = async (req, res) => {
  try {
    const { materialId, warehouseId, quantity } = req.body;

    let inventory = await Inventory.findOne({
      materialId,
      warehouseId,
    });

    if (inventory) {
      inventory.quantity = quantity;

      await inventory.save();

      return res.status(200).json({
        success: true,
        message: "Inventory updated successfully",
        data: inventory,
      });
    }

    inventory = await Inventory.create({
      materialId,
      warehouseId,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInventoryByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;

    // STEP 1 — verify warehouse exists
    const warehouse = await Warehouse.findById(warehouseId);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // STEP 2 — get inventory
    const inventory = await Inventory.find({
      warehouseId,
    })
      .populate("materialId", "materialCode materialName unit minimumStock")
      .populate("warehouseId", "warehouseName");

    // STEP 3 — format response
    const formattedInventory = inventory.map((item) => {
      let status = "In Stock";

      if (item.quantity <= 0) {
        status = "Out of Stock";
      } else if (
        item.quantity <= item.materialId.minimumStock
      ) {
        status = "Low Stock";
      }

      return {
        materialId: item.materialId._id,
        materialCode: item.materialId.materialCode,
        materialName: item.materialId.materialName,
        unit: item.materialId.unit,
        quantity: item.quantity,
        status,
      };
    });

    // STEP 4 — response
    res.status(200).json({
      success: true,
      warehouse: warehouse.warehouseName,
      totalItems: formattedInventory.length,
      inventory: formattedInventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getInventoryByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const inventory = await Inventory.find({
      materialId: materialId,
    })
      .populate("materialId", "materialName materialCode")
      .populate("warehouseId", "warehouseName location");

    if (inventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No inventory found for this material",
      });
    }

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate(
        "materialId",
        "materialCode materialName unit minimumStock"
      )
      .populate(
        "warehouseId",
        "warehouseName location"
      );

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getInventory,
  upsertInventory,
  getInventoryByWarehouse,
  getInventoryByMaterial,
  getAllInventory,
};