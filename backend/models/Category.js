const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120, unique: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
