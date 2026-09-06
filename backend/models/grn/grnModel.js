const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema({
  poLineId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: "itemType", required: true },
  orderedQuantitySnapshot: { type: Number, required: true, min: 0 },
  previouslyReceivedSnapshot: { type: Number, required: true, min: 0, default: 0 },
  quantityReceived: { type: Number, required: true, min: 0.000001 },
  acceptedQuantity: { type: Number, required: true, min: 0 },
  rejectedQuantity: { type: Number, default: 0, min: 0 },
  unitPriceSnapshot: { type: Number, default: 0, min: 0 },
  itemCodeSnapshot: { type: String, trim: true, default: "" },
  itemNameSnapshot: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
}, { _id: true });

const schema = new mongoose.Schema({
  grnNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true, index: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
  receiptDate: { type: Date, default: Date.now },
  items: { type: [lineSchema], validate: [(value) => value.length > 0, "At least one received item is required"] },
  status: { type: String, enum: ["Draft", "Posted", "Reversed"], default: "Draft", index: true },
  postingState: { type: String, enum: ["Unposted", "Posted", "Reversed"], default: "Unposted" },
  postedAt: { type: Date, default: null },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reversedAt: { type: Date, default: null },
  reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reversalReason: { type: String, trim: true, maxlength: 500, default: "" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, optimisticConcurrency: true });

schema.pre("validate", function (next) {
  const invalid = this.items.some((line) => Number(line.acceptedQuantity) + Number(line.rejectedQuantity || 0) !== Number(line.quantityReceived));
  if (invalid) return next(new Error("Accepted and rejected quantities must equal received quantity"));
  next();
});

module.exports = mongoose.models.GRN || mongoose.model("GRN", schema);
