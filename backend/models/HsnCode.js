const mongoose = require("mongoose");

const hsnCodeSchema = new mongoose.Schema({
  hsnCode: { type: String, required: true, trim: true, maxlength: 20, unique: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  gstPercentage: { type: Number, required: true, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model("HsnCode", hsnCodeSchema);
