const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  action: { type: String, enum: ["OPENED", "PARTIAL_PAYMENT", "PAID", "PAYMENT_REVERSED"], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, payment: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierPayment", default: null },
  amountMinor: { type: Number, min: 0, default: 0 }, reason: { type: String, trim: true, default: "" }, at: { type: Date, default: Date.now },
}, { _id: true });

const schema = new mongoose.Schema({
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
  purchaseBill: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseBill", required: true, unique: true, immutable: true },
  originalAmountMinor: { type: Number, required: true, min: 0, immutable: true }, paidAmountMinor: { type: Number, min: 0, default: 0 }, outstandingAmountMinor: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["INR"], default: "INR", immutable: true }, dueDate: { type: Date, default: null },
  status: { type: String, enum: ["OPEN", "PARTIALLY_PAID", "PAID", "CANCELLED"], default: "OPEN", index: true }, paymentVersion: { type: Number, default: 0, select: false },
  openedAt: { type: Date, default: Date.now }, closedAt: { type: Date, default: null }, auditTrail: [auditSchema],
}, { timestamps: true, optimisticConcurrency: true });

schema.index({ supplier: 1, dueDate: 1 });
schema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.models.AccountsPayable || mongoose.model("AccountsPayable", schema);
