const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema(
  {
    // MATERIAL

    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    // WAREHOUSE

    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    // TRANSACTION TYPE

    transactionType: {
      type: String,
      enum: [
        "STOCK_IN",
        "STOCK_OUT",
        "TRANSFER_IN",
        "TRANSFER_OUT",
        "ADJUSTMENT",
        "RETURN",
      ],
      required: true,
    },

    // QUANTITY MOVED

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // STOCK BEFORE TRANSACTION

    beforeStock: {
      type: Number,
      required: true,
      min: 0,
    },

    // STOCK AFTER TRANSACTION

    afterStock: {
      type: Number,
      required: true,
      min: 0,
    },

    // OPTIONAL REFERENCE NUMBER

    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // OPTIONAL NOTES

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // TRANSACTION DATE

    transactionDate: {
      type: Date,
      default: Date.now,
    },

    // CREATED BY

    createdBy: {
      type: String,
      default: "System",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StockTransaction",
  stockTransactionSchema
);