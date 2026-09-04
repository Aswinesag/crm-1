const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120, unique: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

module.exports = mongoose.model("Brand", brandSchema);
