const mongoose = require("mongoose");

// ================================
// Purchase Requisition Item Schema
// ================================
const purchaseRequisitionItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterial",
      required: [true, "Material is required"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be greater than 0"],
    },

    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      uppercase: true,
    },

    currentStock: {
      type: Number,
      default: 0,
      min: [0, "Current stock cannot be negative"],
    },

    requiredQty: {
      type: Number,
      required: [true, "Required quantity is required"],
      min: [0, "Required quantity cannot be negative"],
    },
  },
  {
    _id: false,
  }
);

// ================================
// Purchase Requisition Schema
// ================================
const purchaseRequisitionSchema = new mongoose.Schema(
  {
    requisitionNo: {
      type: String,
      required: [true, "Requisition Number is required"],
      unique: true,
      trim: true,
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    requestedBy: {
      type: String,
      required: [true, "Requested By is required"],
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    requiredDate: {
      type: Date,
      required: [true, "Required Date is required"],
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Approved",
        "Rejected",
        "Completed",
      ],
      default: "Pending",
    },

    items: {
      type: [purchaseRequisitionItemSchema],
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one material item is required.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// ================================
// Export Model
// ================================
module.exports = mongoose.model(
  "PurchaseRequisitions",
  purchaseRequisitionSchema
);