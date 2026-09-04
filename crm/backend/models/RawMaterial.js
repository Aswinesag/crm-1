const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema(
{
    materialCode: {
        type: String,
        required: true,
        trim: true
    },

    materialName: {
        type: String,
        required: [true, "Material Name is required"],
        trim: true,
        maxlength: [150, "Material Name cannot exceed 150 characters"]
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
    },

    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
        required: [true, "Unit is required"]
    },

    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        default: null
    },

    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: [true, "Warehouse is required"]
    },

    costPrice: {
        type: Number,
        required: [true, "Cost Price is required"],
        min: [0, "Cost Price cannot be negative"],
        default: 0
    },

    minimumStock: {
        type: Number,
        default: 0,
        min: [0, "Minimum Stock cannot be negative"]
    },

    reorderLevel: {
        type: Number,
        default: 0,
        min: [0, "Reorder Level cannot be negative"]
    },

    currentStock: {
        type: Number,
        default: 0,
        min: [0, "Current Stock cannot be negative"]
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }

},
{
    timestamps: true
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

/*
Allow same material code in different warehouses,
but prevent duplicates in the same warehouse.
*/
rawMaterialSchema.index(
{
    materialCode: 1,
    warehouse: 1
},
{
    unique: true
});

/*
Search Indexes
*/
rawMaterialSchema.index({
    materialName: 1
});

rawMaterialSchema.index({
    materialName: "text",
    materialCode: "text"
});

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model(
    "RawMaterial",
    rawMaterialSchema
);