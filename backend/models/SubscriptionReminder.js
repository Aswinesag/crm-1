const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, trim: true, lowercase: true },
  reminderType: { type: String, enum: ["Renewal", "PaymentPending", "Expired"], required: true },
  reminderStage: { type: String, required: true, trim: true },
  cycleKey: { type: String, required: true, trim: true },
  scheduledFor: { type: Date, required: true, index: true },
  status: { type: String, enum: ["Pending", "Processing", "Sent", "Failed"], default: "Pending", index: true },
  sentAt: { type: Date, default: null }, attempts: { type: Number, default: 0, min: 0 },
  lastAttemptAt: { type: Date, default: null }, leaseUntil: { type: Date, default: null },
  failureReason: { type: String, trim: true, maxlength: 300, default: "" },
  relatedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: null },
}, { timestamps: true });
schema.index({ subscription: 1, reminderType: 1, reminderStage: 1, cycleKey: 1 }, { unique: true });
schema.index({ status: 1, scheduledFor: 1, leaseUntil: 1 });
module.exports = mongoose.model("SubscriptionReminder", schema);
