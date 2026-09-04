const mongoose = require("mongoose");

const stockOutSchema = new mongoose.Schema(
{
    /*
    =====================================
    STOCK OUT NUMBER
    Example:
    STO0001
    STO0002
    =====================================
    */

    stockOutNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    /*
    =====================================
    DATE
    =====================================
    */

    date: {
        type: Date,
        default: Date.now
    },

    /*
    =====================================
    MATERIAL
    =====================================
    */

    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RawMaterial",
        required: true
    },

    /*
    =====================================
    QUANTITY
    =====================================
    */

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    /*
    =====================================
    DEPARTMENT
    =====================================
    */

    department: {
        type: String,
        required: true,
        trim: true
    },

    /*
    =====================================
    PURPOSE
    =====================================
    */

    purpose: {
        type: String,
        required: true,
        trim: true
    },

    /*
    =====================================
    WAREHOUSE
    =====================================
    */

    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true
    },

    /*
    =====================================
    REMARKS
    =====================================
    */

    remarks: {
        type: String,
        default: ""
    },

    /*
    =====================================
    CREATED BY
    =====================================
    */

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("StockOut", stockOutSchema);