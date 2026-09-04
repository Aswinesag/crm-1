const mongoose = require("mongoose");

const purchaseBillSchema = new mongoose.Schema(
{
    billNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    supplierInvoiceNo: {
        type: String,
        required: true,
        trim: true
    },

    billDate: {
        type: Date,
        required: true
    },

    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrders",
        required: true
    },

    grn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GoodsReceiptNote",
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    paymentTerms: {
        type: String,
        default: ""
    },

    taxableAmount: {
        type: Number,
        required: true,
        default: 0
    },

    gst: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },

    paidAmount: {
        type: Number,
        default: 0
    },

    balanceAmount: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Partially Paid",
            "Paid",
            "Cancelled"
        ],
        default: "Pending"
    },

    remarks: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "PurchaseBill",
    purchaseBillSchema
);