const mongoose = require("mongoose");

const stockTransferSchema = new mongoose.Schema(
{
    transferNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    date: {
        type: Date,
        required: true
    },

    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RawMaterial",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    fromWarehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },

    toWarehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },

    sourceMaterial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RawMaterial",
        required: true
    },

    destinationMaterial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RawMaterial",
        required: true
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
    "StockTransfer",
    stockTransferSchema
);