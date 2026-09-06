const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true, index: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType", index: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
  quantity: { type: Number, required: true, min: 0 },
  movementType: { type: String, enum: ["StockIn", "StockOut", "TransferOut", "TransferIn", "AdjustmentIncrease", "AdjustmentDecrease"], required: true, index: true },
  beforeQuantity: { type: Number, required: true, min: 0 },
  afterQuantity: { type: Number, required: true, min: 0 },
  batchId: { type: String, trim: true, maxlength: 80, default: "", index: true },
  referenceType: { type: String, trim: true, maxlength: 60, default: "Manual" },
  referenceId: { type: String, trim: true, maxlength: 120, default: "" },
  reason: { type: String, trim: true, maxlength: 250, default: "" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

schema.index({ createdAt: -1 });
schema.index(
  { referenceType: 1, referenceId: 1, batchId: 1, movementType: 1 },
  { unique: true, partialFilterExpression: { referenceType: "GRN" } }
);
module.exports = mongoose.model("InventoryTransaction", schema);
