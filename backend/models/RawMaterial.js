const mongoose = require("mongoose");

const rawMaterialSchema = new mongoose.Schema({
  materialCode: { type: String, required: true, trim: true, uppercase: true, maxlength: 40, unique: true },
  materialName: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  hsnCode: { type: mongoose.Schema.Types.ObjectId, ref: "HsnCode", default: null },
  costPrice: { type: Number, min: 0, default: 0 },
  reorderLevel: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

rawMaterialSchema.index({ materialName: 1 });
module.exports = mongoose.model("RawMaterial", rawMaterialSchema);
