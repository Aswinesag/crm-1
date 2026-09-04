const mongoose = require("mongoose");

const productBundleSchema = new mongoose.Schema(
{
    bundleCode: {
        type: String,
        unique: true
    },

    bundleName: {
        type: String,
        required: true,
        trim: true
    },

    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                default: 1
            }
        }
    ],

    bundlePrice: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        default: ""
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

productBundleSchema.pre(
    "save",
    async function(next) {

        if (!this.bundleCode) {

            const count =
                await mongoose
                    .model("ProductBundle")
                    .countDocuments();

            this.bundleCode =
                `BUNDLE-${String(
                    count + 1
                ).padStart(5, "0")}`;
        }

        next();
    }
);

module.exports = mongoose.model(
    "ProductBundle",
    productBundleSchema
);