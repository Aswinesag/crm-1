const mongoose = require("mongoose");

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
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
      trim: true,
    },

    requiredDate: {
      type: Date,
      required: true,
    },

    vendorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],

    status: {
      type: String,
      enum: [
        "Draft",
        "Open",
        "Sent",
        "Quotation Received",
        "Closed",
        "Cancelled",
      ],
      default: "Draft",
    },

    remarks: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    quotations: [
      {
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
        },

        quotedPrice: {
          type: Number,
        },

        deliveryDays: {
          type: Number,
        },

        paymentTerms: {
          type: String,
        },

        quotationDate: {
          type: Date,
          default: Date.now,
        },

        remarks: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RFQ", rfqSchema);