const mongoose = require("mongoose");

const supplierPaymentSchema = new mongoose.Schema(
{
    paymentNumber:
    {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    paymentDate:
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

    billNumber:
    {
        type: String,
        required: true,
        trim: true
    },

    amount:
    {
        type: Number,
        required: true,
        min: 0
    },

    paymentMethod:
    {
        type: String,
        enum:
        [
            "Cash",
            "Bank Transfer",
            "Cheque",
            "UPI"
        ],
        required: true
    },

    transactionNumber:
    {
        type: String,
        default: "",
        trim: true
    },

    remarks:
    {
        type: String,
        default: ""
    },

    status:
    {
        type: String,
        enum:
        [
            "Active",
            "Inactive"
        ],
        default: "Active"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "SupplierPayment",
    supplierPaymentSchema
);