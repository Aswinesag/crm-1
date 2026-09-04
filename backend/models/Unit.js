const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  shortName: { type: String, trim: true, maxlength: 20, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

module.exports = mongoose.model("Unit", unitSchema);
