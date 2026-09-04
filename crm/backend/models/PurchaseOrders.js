const mongoose = require("mongoose");

const purchaseOrderItemSchema = new mongoose.Schema(
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
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gst: {
      type: Number,
      default: 18,
    },

    amount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },

    poDate: {
      type: Date,
      default: Date.now,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    supplierGST: {
      type: String,
      default: "",
    },

    deliveryDate: {
      type: Date,
      required: true,
    },

    paymentTerms: {
      type: String,
      default: "",
    },

    deliveryAddress: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Approved",
        "Sent",
        "Partially Received",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    items: [purchaseOrderItemSchema],

    subTotal: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    transportCharges: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      default: "",
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

module.exports =
  mongoose.models.PurchaseOrders ||
  mongoose.model("PurchaseOrders", purchaseOrderSchema);