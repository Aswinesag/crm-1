const mongoose = require("mongoose");

const rfqItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      required: true,
    },

    requiredQty: {
      type: Number,
      default: 0,
    },

    currentStock: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      required: true,
      unique: true,
    },

    rfqDate: {
      type: Date,
      default: Date.now,
    },

    purchaseRequisition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequisitions",
      required: true,
    },

    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],

    items: [rfqItemSchema],

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Sent",
        "Quotation Received",
        "Closed",
        "Cancelled",
      ],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RequestforQuotation", rfqSchema);