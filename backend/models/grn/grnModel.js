const mongoose = require("mongoose");

const grnSchema = new mongoose.Schema(
  {
    // =============================================
    // GRN NUMBER
    // =============================================
    grnNumber: {
      type: String,
      unique: true,
    },

    // =============================================
    // PURCHASE ORDER
    // =============================================
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },

    // =============================================
    // VENDOR
    // =============================================
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // =============================================
    // RECEIVED ITEMS
    // =============================================
    items: [
      {
        // =============================================
        // MATERIAL
        // =============================================
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
          required: true,
        },

        // =============================================
        // PO QUANTITY
        // =============================================
        orderedQuantity: {
          type: Number,
          required: true,
        },

        // =============================================
        // RECEIVED QUANTITY
        // =============================================
        quantityReceived: {
          type: Number,
          required: true,
        },

        // =============================================
        // QC ACCEPTED
        // =============================================
        acceptedQuantity: {
          type: Number,
          required: true,
        },

        // =============================================
        // QC REJECTED
        // =============================================
        rejectedQuantity: {
          type: Number,
          default: 0,
        },

        // =============================================
        // PENDING QTY
        // =============================================
        pendingQuantity: {
          type: Number,
          default: 0,
        },

        // =============================================
        // PRICE
        // =============================================
        unitPrice: {
          type: Number,
          required: true,
        },

        // =============================================
        // TOTAL
        // =============================================
        totalAmount: {
          type: Number,
          default: 0,
        },

        // =============================================
        // INSPECTION STATUS
        // =============================================
        inspectionStatus: {
          type: String,
          enum: [
            "Pending",
            "Accepted",
            "Rejected",
            "Partial",
          ],
          default: "Pending",
        },

        // =============================================
        // ITEM REMARKS
        // =============================================
        remarks: {
          type: String,
        },
      },
    ],

    // =============================================
    // TOTAL SUMMARY
    // =============================================
    totalOrderedQuantity: {
      type: Number,
      default: 0,
    },

    totalReceivedQuantity: {
      type: Number,
      default: 0,
    },

    totalAcceptedQuantity: {
      type: Number,
      default: 0,
    },

    totalRejectedQuantity: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    // =============================================
    // DELIVERY DATE
    // =============================================
    deliveryDate: {
      type: Date,
      default: Date.now,
    },

    // =============================================
    // OVERALL STATUS
    // =============================================
    status: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Completed",
        "Rejected",
      ],
      default: "Pending",
    },

    // =============================================
    // OVERALL REMARKS
    // =============================================
    remarks: {
      type: String,
    },

    // =============================================
    // CREATED BY
    // =============================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// =============================================
// AUTO CALCULATIONS
// =============================================
grnSchema.pre("save", function (next) {
  let totalOrderedQuantity = 0;

  let totalReceivedQuantity = 0;

  let totalAcceptedQuantity = 0;

  let totalRejectedQuantity = 0;

  let grandTotal = 0;

  this.items.forEach((item) => {
    // =============================================
    // TOTAL AMOUNT
    // =============================================
    item.totalAmount =
      item.acceptedQuantity *
      item.unitPrice;

    // =============================================
    // PENDING QUANTITY
    // =============================================
    item.pendingQuantity =
      item.orderedQuantity -
      item.receivedQuantity;

    // =============================================
    // INSPECTION STATUS
    // =============================================
    if (
      item.rejectedQuantity === 0
    ) {
      item.inspectionStatus =
        "Accepted";
    }
    else if (
      item.acceptedQuantity === 0
    ) {
      item.inspectionStatus =
        "Rejected";
    }
    else {
      item.inspectionStatus =
        "Partial";
    }

    // =============================================
    // SUMMARY TOTALS
    // =============================================
    totalOrderedQuantity +=
      item.orderedQuantity;

    totalReceivedQuantity +=
      item.receivedQuantity;

    totalAcceptedQuantity +=
      item.acceptedQuantity;

    totalRejectedQuantity +=
      item.rejectedQuantity;

    grandTotal += item.totalAmount;
  });

  // =============================================
  // FINAL TOTALS
  // =============================================
  this.totalOrderedQuantity =
    totalOrderedQuantity;

  this.totalReceivedQuantity =
    totalReceivedQuantity;

  this.totalAcceptedQuantity =
    totalAcceptedQuantity;

  this.totalRejectedQuantity =
    totalRejectedQuantity;

  this.grandTotal = grandTotal;

  // =============================================
  // OVERALL STATUS
  // =============================================
  if (
    totalRejectedQuantity === 0
  ) {
    this.status = "Completed";
  }
  else if (
    totalAcceptedQuantity === 0
  ) {
    this.status = "Rejected";
  }
  else {
    this.status = "Partial";
  }

  next();
});

module.exports = mongoose.model(
  "GRN",
  grnSchema
);