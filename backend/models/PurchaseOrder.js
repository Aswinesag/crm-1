const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema({
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: "itemType", required: true },
  quantity: { type: Number, required: true, min: 0.000001 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
  unitPrice: { type: Number, default: 0, min: 0 },
  unitSnapshot: { type: String, trim: true, default: "" },
  itemCodeSnapshot: { type: String, trim: true, default: "" },
  itemNameSnapshot: { type: String, trim: true, default: "" },
}, { _id: true });

lineSchema.virtual("pendingQuantity").get(function () {
  return Math.max(0, Number(this.quantity) - Number(this.receivedQuantity || 0));
});

const schema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  poDate: { type: Date, default: Date.now },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", default: null },
  items: { type: [lineSchema], validate: [(value) => value.length > 0, "At least one item is required"] },
  deliveryDate: { type: Date, default: null },
  paymentTerms: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["DRAFT", "APPROVED", "SENT", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"], default: "DRAFT" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.pre("validate", function (next) {
  if (this.items.some((line) => Number(line.receivedQuantity || 0) > Number(line.quantity))) return next(new Error("Received quantity cannot exceed ordered quantity"));
  next();
});

module.exports = mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", schema);
