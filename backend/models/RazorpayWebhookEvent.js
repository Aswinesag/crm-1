const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, trim: true, maxlength: 160 },
    eventType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    razorpayPaymentId: { type: String, trim: true, maxlength: 160, default: "", index: true },
    razorpayOrderId: { type: String, trim: true, maxlength: 160, default: "", index: true },
    receivedAt: { type: Date, required: true, default: Date.now },
    processingStartedAt: { type: Date, default: null },
    leaseUntil: { type: Date, default: null },
    processedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Received", "Processing", "Processed", "Ignored", "Failed"],
      default: "Received",
      index: true,
    },
    processingError: { type: String, trim: true, maxlength: 500, default: "" },
    attempts: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

webhookEventSchema.index({ status: 1, leaseUntil: 1 });

module.exports = mongoose.model("RazorpayWebhookEvent", webhookEventSchema);
