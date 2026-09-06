const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema({
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: "itemType", required: true },
  requestedQuantity: { type: Number, required: true, min: 0.000001 },
  orderedQuantity: { type: Number, default: 0, min: 0 },
  requiredBy: { type: Date, default: null },
  estimatedUnitPrice: { type: Number, default: 0, min: 0 },
  unitSnapshot: { type: String, trim: true, default: "" },
  itemCodeSnapshot: { type: String, trim: true, default: "" },
  itemNameSnapshot: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
}, { _id: true });
lineSchema.virtual("remainingQuantity").get(function () { return Math.max(0, Number(this.requestedQuantity) - Number(this.orderedQuantity || 0)); });

const schema = new mongoose.Schema({
  requisitionNo: { type: String, required: true, unique: true, trim: true, uppercase: true },
  department: { type: String, required: true, trim: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
  requiredDate: { type: Date, default: null },
  justification: { type: String, trim: true, maxlength: 1000, default: "" },
  remarks: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["DRAFT", "PENDING", "APPROVED", "RFQ_CREATED", "PARTIALLY_ORDERED", "ORDERED", "REJECTED", "CANCELLED", "CLOSED"], default: "PENDING", index: true },
  items: { type: [lineSchema], validate: [(value) => value.length > 0, "At least one requisition item is required"] },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  approvedAt: { type: Date, default: null },
  legacyIdentity: { type: Boolean, default: false },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
schema.pre("validate", function (next) { if (this.items.some((line) => Number(line.orderedQuantity || 0) > Number(line.requestedQuantity))) return next(new Error("Ordered quantity cannot exceed requested quantity")); next(); });
module.exports = mongoose.models.PurchaseRequisition || mongoose.model("PurchaseRequisition", schema);
