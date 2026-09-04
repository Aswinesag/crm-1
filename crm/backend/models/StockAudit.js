const mongoose = require("mongoose");

const stockAuditSchema = new mongoose.Schema(
  {
    auditNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    auditDate: {
      type: Date,
      required: true,
    },

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true,
    },

    systemStock: {
      type: Number,
      required: true,
      min: 0,
    },

    physicalStock: {
      type: Number,
      required: true,
      min: 0,
    },

    difference: {
      type: Number,
      default: 0,
    },

    auditor: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Completed",
        "Approved"
      ],
      default: "Pending",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StockAudit", stockAuditSchema);