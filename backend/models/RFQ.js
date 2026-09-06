const mongoose = require("mongoose");

const lineSchema = new mongoose.Schema({
  sourcePRLine: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ["Product", "RawMaterial", "Component"], required: true },
  item: { type: mongoose.Schema.Types.ObjectId, refPath: "itemType", required: true },
  requestedQuantity: { type: Number, required: true, min: 0.000001 },
  orderedQuantity: { type: Number, default: 0, min: 0 },
  unitSnapshot: { type: String, trim: true, default: "" },
  itemCodeSnapshot: { type: String, trim: true, default: "" },
  itemNameSnapshot: { type: String, trim: true, default: "" },
  descriptionSnapshot: { type: String, trim: true, default: "" },
}, { _id: true });
lineSchema.virtual("remainingQuantity").get(function () { return Math.max(0, Number(this.requestedQuantity) - Number(this.orderedQuantity || 0)); });
const quoteLineSchema = new mongoose.Schema({ rfqLine: { type: mongoose.Schema.Types.ObjectId, required: true }, quotedQuantity: { type: Number, required: true, min: 0.000001 }, orderedQuantity: { type: Number, default: 0, min: 0 }, unitPrice: { type: Number, required: true, min: 0 }, discount: { type: Number, default: 0, min: 0 }, taxPercent: { type: Number, default: 0, min: 0 }, deliveryDays: { type: Number, default: 0, min: 0 } }, { _id: true });
const quotationSchema = new mongoose.Schema({ vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true }, lines: { type: [quoteLineSchema], validate: [(value) => value.length > 0, "Quotation lines are required"] }, paymentTerms: { type: String, trim: true, default: "" }, remarks: { type: String, trim: true, default: "" }, status: { type: String, enum: ["SUBMITTED", "SELECTED", "REJECTED"], default: "SUBMITTED" }, submittedAt: { type: Date, default: Date.now } }, { _id: true });

const schema = new mongoose.Schema({
  rfqNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  sourceRequisition: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseRequisition", required: true, index: true },
  sourcingRound: { type: Number, required: true, min: 1, default: 1 },
  items: { type: [lineSchema], validate: [(value) => value.length > 0, "RFQ lines are required"] },
  vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
  quotations: [quotationSchema],
  requiredDate: { type: Date, default: null },
  remarks: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["DRAFT", "SENT", "QUOTATION_RECEIVED", "PARTIALLY_ORDERED", "ORDERED", "CLOSED", "CANCELLED"], default: "DRAFT", index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  legacyIdentity: { type: Boolean, default: false },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
schema.index({ sourceRequisition: 1, sourcingRound: 1 }, { unique: true });
schema.pre("validate", function (next) { if (this.items.some((line) => Number(line.orderedQuantity || 0) > Number(line.requestedQuantity))) return next(new Error("RFQ ordered quantity cannot exceed requested quantity")); next(); });
module.exports = mongoose.models.RFQ || mongoose.model("RFQ", schema);
