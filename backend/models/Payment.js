const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    invoiceNumber: { type: String, required: true, trim: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true, default: "" },
    customerContact: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0.01, immutable: true },
    amountPaise: { type: Number, required: true, min: 1, immutable: true },
    currency: { type: String, enum: ["INR"], default: "INR", immutable: true },
    receipt: { type: String, required: true, unique: true, trim: true },
    razorpayOrderId: { type: String, required: true, unique: true, trim: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true, trim: true },
    status: {
      type: String,
      enum: ["Created", "Retryable", "Paid"],
      default: "Created",
      index: true,
    },
    signatureVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    lastVerificationError: { type: String, default: "", select: false },
    verificationAttempts: { type: Number, default: 0, min: 0 },
    lastReconciledAt: { type: Date, default: null },
    reconciliationAttempts: { type: Number, default: 0, min: 0 },
    reconciliationStatus: {
      type: String,
      enum: ["Never", "Checking", "Active", "Captured", "Retryable", "ManualReview", "Error"],
      default: "Never",
      index: true,
    },
    retryAllowed: { type: Boolean, default: false, index: true },
    retryReason: { type: String, trim: true, maxlength: 300, default: "" },
    attemptExpiresAt: { type: Date, default: null, index: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ invoice: 1 }, { name: "invoice_1" });
paymentSchema.index(
  { invoice: 1 },
  { unique: true, name: "invoice_created_unique", partialFilterExpression: { status: "Created", invoice: { $type: "objectId" } } }
);
paymentSchema.index(
  { invoice: 1 },
  { unique: true, name: "invoice_paid_unique", partialFilterExpression: { status: "Paid", invoice: { $type: "objectId" } } }
);
paymentSchema.index({ status: 1, attemptExpiresAt: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
