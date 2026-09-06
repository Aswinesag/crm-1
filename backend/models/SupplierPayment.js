const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  accountsPayable: { type: mongoose.Schema.Types.ObjectId, ref: "AccountsPayable", required: true }, purchaseBill: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseBill", required: true },
  amountMinor: { type: Number, required: true, min: 1 }, billNumberSnapshot: { type: String, required: true }, supplierInvoiceNumberSnapshot: { type: String, required: true }, dueDateSnapshot: { type: Date, default: null },
  outstandingBeforeMinor: { type: Number, required: true, min: 0 }, outstandingAfterMinor: { type: Number, required: true, min: 0 },
}, { _id: true });
const auditSchema = new mongoose.Schema({ action: { type: String, enum: ["CREATED", "ALLOCATED", "REVERSED"], required: true }, actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, at: { type: Date, default: Date.now }, reason: { type: String, trim: true, default: "" } }, { _id: true });

const schema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true, immutable: true, trim: true, uppercase: true }, supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, immutable: true, index: true },
  paymentDate: { type: Date, required: true, immutable: true, index: true }, currency: { type: String, enum: ["INR"], default: "INR", immutable: true },
  paymentMethod: { type: String, enum: ["BANK_TRANSFER", "CHEQUE", "CASH", "UPI", "OTHER"], required: true, immutable: true }, referenceNumber: { type: String, trim: true, default: "", immutable: true }, normalizedReferenceNumber: { type: String, trim: true, default: "", immutable: true },
  totalAmountMinor: { type: Number, required: true, min: 1, immutable: true }, allocatedAmountMinor: { type: Number, required: true, min: 1, immutable: true }, unallocatedAmountMinor: { type: Number, default: 0, min: 0, immutable: true },
  allocations: { type: [allocationSchema], validate: [(value) => value.length > 0, "At least one allocation is required"] }, status: { type: String, enum: ["RECORDED", "REVERSED"], default: "RECORDED", index: true },
  notes: { type: String, trim: true, maxlength: 2000, default: "", immutable: true }, idempotencyKey: { type: String, required: true, trim: true, immutable: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, immutable: true }, reversedAt: Date, reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reversalReason: { type: String, trim: true, default: "" }, accountingPostingReference: { type: String, trim: true, default: "" }, auditTrail: [auditSchema],
}, { timestamps: true, optimisticConcurrency: true });

schema.index({ idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } });
schema.index({ supplier: 1, paymentMethod: 1, normalizedReferenceNumber: 1 }, { unique: true, partialFilterExpression: { normalizedReferenceNumber: { $type: "string", $gt: "" } } });
schema.index({ supplier: 1, paymentDate: -1 });

module.exports = mongoose.models.SupplierPayment || mongoose.model("SupplierPayment", schema);
