const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
      unique: true,
    },

    currentStock: {
      type: Number,
      default: 0,
    },

    reservedStock: {
      type: Number,
      default: 0,
    },

    availableStock: {
      type: Number,
      default: 0,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Inventory =
  mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;