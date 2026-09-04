const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({

    // MATERIAL CODE
    materialCode: {
        type: String,
        required: [true, "Material code is required"],
        unique: true,
        trim: true,
        uppercase: true
    },

    // MATERIAL NAME
    materialName: {
        type: String,
        required: [true, "Material name is required"],
        trim: true
    },

    // CATEGORY
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true
    },

    // UNIT
    unit: {
        type: String,
        required: [true, "Unit is required"],
        enum: {
            values: [
                "Kg",
                "Gram",
                "Litre",
                "Ml",
                "Piece",
                "Box",
                "Meter",
                "Feet"
            ],
            message: "{VALUE} is not a valid unit"
        }
    },

    // CURRENT STOCK
    currentStock: {
        type: Number,
        default: 0,
        min: [0, "Current stock cannot be negative"]
    },

    unitPrice: {
    type: Number,
    default: 0
    },

    // MINIMUM STOCK
    minimumStock: {
        type: Number,
        default: 0,
        min: [0, "Minimum stock cannot be negative"]
    },

    // REORDER LEVEL
    reorderLevel: {
        type: Number,
        default: 0,
        min: [0, "Reorder level cannot be negative"]
    },

    // VENDORS
    vendorIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor"
        }
    ],

    // WAREHOUSE
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse"
    },

    // STATUS
    status: {
        type: String,
        enum: {
            values: ["Active", "Inactive"],
            message: "{VALUE} is not a valid status"
        },
        default: "Active"
    }

}, {
    timestamps: true
});

materialSchema.index({ materialCode: 1 });

materialSchema.index({ materialName: 1 });

materialSchema.index({ category: 1 });

materialSchema.index({ status: 1 });


// EXPORT MODEL
const Material = mongoose.model("Material", materialSchema);

module.exports = Material;