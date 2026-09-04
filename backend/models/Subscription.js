const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 160, index: true },
  customerEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 160, index: true },
  customerContact: { type: String, trim: true, maxlength: 30, default: "" },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
  planName: { type: String, required: true, trim: true },
  durationMonths: { type: Number, required: true, enum: [6, 12] },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: null },
  latestPayment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  startDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null, index: true },
  status: { type: String, enum: ["PendingPayment", "Active", "Expired", "RenewalPending", "Cancelled"], default: "PendingPayment", index: true },
  lastRenewedAt: { type: Date, default: null },
  nextRenewalInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: null },
  appliedPayments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true, optimisticConcurrency: true });
schema.index({ status: 1, expiryDate: 1 });
schema.index({ appliedPayments: 1 });
module.exports = mongoose.model("Subscription", schema);
