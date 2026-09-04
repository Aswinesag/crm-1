const mongoose = require("mongoose");

const purchaseReturnSchema = new mongoose.Schema(
{
    returnNumber:
    {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    returnDate:
    {
        type: Date,
        required: true
    },

    supplier:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

    material:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true
    },

    quantity:
    {
        type: Number,
        required: true,
        min: 1
    },

    returnReason:
    {
        type: String,
        enum:
        [
            "Damaged",
            "Wrong Material",
            "Excess Quantity",
            "Quality Failure"
        ],
        required: true
    },

    status:
    {
        type: String,
        enum:
        [
            "Pending",
            "Approved",
            "Rejected",
            "Completed"
        ],
        default: "Pending"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "PurchaseReturn",
    purchaseReturnSchema
);