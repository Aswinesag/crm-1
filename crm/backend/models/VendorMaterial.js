const mongoose = require("mongoose");

const vendorMaterialSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      required: true,
    },

    vendorMaterialCode: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    leadTimeDays: {
      type: Number,
      default: 0,
    },

    minimumOrderQty: {
      type: Number,
      default: 1,
    },

    isPreferred: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "VendorMaterial",
  vendorMaterialSchema
);