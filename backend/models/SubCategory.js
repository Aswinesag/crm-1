const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

subCategorySchema.index({ category: 1, name: 1 }, { unique: true });
module.exports = mongoose.model("SubCategory", subCategorySchema);
