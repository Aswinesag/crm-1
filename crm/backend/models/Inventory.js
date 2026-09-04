const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index(
  { materialId: 1, warehouseId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);