const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 40, unique: true },
  productName: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  productType: { type: String, enum: ["Raw Material", "Finished Product", "Service"], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", default: null },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  hsnCode: { type: mongoose.Schema.Types.ObjectId, ref: "HsnCode", default: null },
  costPrice: { type: Number, min: 0, default: 0 },
  sellingPrice: { type: Number, min: 0, default: 0 },
  mrp: { type: Number, min: 0, default: 0 },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

productSchema.index({ productName: 1 });
module.exports = mongoose.model("Product", productSchema);
