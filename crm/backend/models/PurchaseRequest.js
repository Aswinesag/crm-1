const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema({

    prNumber: {
        type: String,
        unique: true
    },

    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material"
    },

    quantity: {
        type: Number,
        required: true
    },

    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"]
    },

    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    }

}, { timestamps: true });

module.exports = mongoose.model("PurchaseRequest", purchaseRequestSchema);