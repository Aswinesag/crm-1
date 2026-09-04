const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
  componentCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 40, unique: true },
  componentName: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  hsnCode: { type: mongoose.Schema.Types.ObjectId, ref: "HsnCode", default: null },
  costPrice: { type: Number, min: 0, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

componentSchema.index({ componentName: 1 });
module.exports = mongoose.model("Component", componentSchema);
