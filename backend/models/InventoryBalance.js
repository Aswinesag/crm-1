const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true, index: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType", index: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true, optimisticConcurrency: true });

schema.index({ itemType: 1, item: 1, warehouse: 1 }, { unique: true });
module.exports = mongoose.model("InventoryBalance", schema);
