const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType" },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  systemQuantity: { type: Number, required: true, min: 0 },
  physicalQuantity: { type: Number, required: true, min: 0 },
  difference: { type: Number, required: true },
  reason: { type: String, trim: true, maxlength: 250, default: "" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  auditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("InventoryAudit", schema);
