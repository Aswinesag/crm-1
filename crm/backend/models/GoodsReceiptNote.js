const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RawMaterial",
        required: true
    },

    orderedQty: {
        type: Number,
        required: true,
        min: 0
    },

    receivedQty: {
        type: Number,
        required: true,
        min: 0
    },

    acceptedQty: {
        type: Number,
        required: true,
        min: 0
    },

    rejectedQty: {
        type: Number,
        default: 0,
        min: 0
    },

    remarks: {
        type: String,
        default: ""
    }

}, {
    _id: false
});

const goodsReceiptNoteSchema = new mongoose.Schema({

    grnNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    grnDate: {
        type: Date,
        required: true
    },

    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrders",
        required: true
    },

    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

    invoiceNumber: {
        type: String,
        trim: true
    },

    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },

    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Partially Received",
            "Received",
            "Rejected"
        ],
        default: "Pending"
    },

    items: {
        type: [grnItemSchema],
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "GoodsReceiptNote",
    goodsReceiptNoteSchema
);