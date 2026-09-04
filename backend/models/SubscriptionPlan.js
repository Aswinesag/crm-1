const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 40 },
  durationMonths: { type: Number, required: true, enum: [6, 12] },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, enum: ["INR"], default: "INR", immutable: true },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
module.exports = mongoose.model("SubscriptionPlan", schema);
