const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    movementNumber: {
      type: String,
      unique: true,
    },

    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    movementType: {
      type: String,
      enum: [
        "GRN_RECEIPT",
        "PURCHASE_RETURN",
        "PRODUCTION_CONSUMPTION",
        "SALES_DISPATCH",
        "STOCK_ADJUSTMENT",
        "TRANSFER_IN",
        "TRANSFER_OUT",
      ],
      required: true,
    },

    direction: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    beforeStock: {
      type: Number,
      required: true,
    },

    afterStock: {
      type: Number,
      required: true,
    },

    referenceModel: {
      type: String,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    remarks: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StockMovement",
  stockMovementSchema
);