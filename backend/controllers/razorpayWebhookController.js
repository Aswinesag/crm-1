const RazorpayWebhookEvent = require("../models/RazorpayWebhookEvent");
const { webhookSignatureMatches } = require("../utils/razorpaySignatures");
const { ReconciliationError, finalizeSuccessfulPayment } = require("../services/paymentReconciliationService");

const SUPPORTED_EVENTS = new Set(["payment.captured", "order.paid"]);
const LEASE_MS = 60_000;
const cleanId = (value, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";

const extractSuccessfulPayment = (payload) => {
  const payment = payload?.payload?.payment?.entity;
  const order = payload?.payload?.order?.entity;
  const paymentId = cleanId(payment?.id);
  const orderId = cleanId(payment?.order_id || order?.id);
  const amountPaise = payment?.amount;
  const currency = cleanId(payment?.currency, 10).toUpperCase();
  if (!paymentId || !orderId || payment?.status !== "captured" || payment?.captured !== true) {
    throw new ReconciliationError("Webhook does not contain a captured payment", 422);
  }
  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0 || currency !== "INR") {
    throw new ReconciliationError("Webhook contains invalid payment financial data", 422);
  }
  if (order?.id && order.id !== orderId) {
    throw new ReconciliationError("Webhook order and payment associations conflict", 422);
  }
  if (payload.event === "order.paid" && order?.status !== "paid") {
    throw new ReconciliationError("Webhook order is not paid", 422);
  }
  const timestampSeconds = payment.created_at;
  const paidAt = Number.isSafeInteger(timestampSeconds) && timestampSeconds > 0
    ? new Date(timestampSeconds * 1000)
    : new Date();
  return { paymentId, orderId, amountPaise, currency, paidAt };
};

const persistEvent = async ({ eventId, eventType, paymentId, orderId }) => {
  try {
    return await RazorpayWebhookEvent.create({
      eventId, eventType, razorpayPaymentId: paymentId, razorpayOrderId: orderId,
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return RazorpayWebhookEvent.findOne({ eventId });
  }
};

const claimEvent = (event) => {
  const now = new Date();
  return RazorpayWebhookEvent.findOneAndUpdate(
    {
      _id: event._id,
      $or: [
        { status: "Received" },
        { status: "Processing", leaseUntil: { $lte: now } },
      ],
    },
    {
      $set: { status: "Processing", processingStartedAt: now, leaseUntil: new Date(now.getTime() + LEASE_MS), processingError: "" },
      $inc: { attempts: 1 },
    },
    { new: true }
  );
};

const updateTerminalStatus = (eventId, status, processingError = "") =>
  RazorpayWebhookEvent.updateOne(
    { _id: eventId, status: "Processing" },
    { $set: { status, processedAt: new Date(), processingError, leaseUntil: null } }
  );

const razorpayWebhook = async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return res.status(503).json({ success: false, message: "Webhook is not configured" });
  }
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json({ success: false, message: "Webhook body must be application/json" });
  }
  const signature = req.get("x-razorpay-signature");
  if (!signature || !webhookSignatureMatches(req.body, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
    return res.status(401).json({ success: false, message: "Invalid webhook signature" });
  }
  const eventId = cleanId(req.get("x-razorpay-event-id"));
  if (!eventId) return res.status(400).json({ success: false, message: "Webhook event ID is required" });

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ success: false, message: "Webhook payload is invalid JSON" });
  }
  const eventType = cleanId(payload?.event, 80);
  let details = {};
  let extractionError;
  if (SUPPORTED_EVENTS.has(eventType)) {
    try { details = extractSuccessfulPayment(payload); } catch (error) { extractionError = error; }
  }

  try {
    const event = await persistEvent({ eventId, eventType: eventType || "unknown", ...details });
    if (["Processed", "Ignored", "Failed"].includes(event.status)) {
      return res.status(200).json({ success: true, duplicate: true, status: event.status });
    }
    const claimed = await claimEvent(event);
    if (!claimed) return res.status(200).json({ success: true, duplicate: true, status: "Processing" });

    if (!SUPPORTED_EVENTS.has(eventType)) {
      await updateTerminalStatus(claimed._id, "Ignored", "Unsupported event type");
      return res.status(200).json({ success: true, status: "Ignored" });
    }
    if (extractionError) {
      await updateTerminalStatus(claimed._id, "Failed", extractionError.message);
      return res.status(200).json({ success: true, status: "Failed" });
    }

    try {
      const result = await finalizeSuccessfulPayment({ ...details, webhookEventId: claimed._id });
      return res.status(200).json({ success: true, status: "Processed", idempotent: result.idempotent });
    } catch (error) {
      if (error instanceof ReconciliationError && error.permanent) {
        await updateTerminalStatus(claimed._id, "Failed", error.message);
        return res.status(200).json({ success: true, status: "Failed" });
      }
      await RazorpayWebhookEvent.updateOne(
        { _id: claimed._id, status: "Processing" },
        { $set: { status: "Received", processingError: "Temporary processing failure", leaseUntil: null } }
      );
      console.error("Razorpay webhook processing failed", { eventId, eventType, message: error.message });
      return res.status(503).json({ success: false, message: "Webhook processing is temporarily unavailable" });
    }
  } catch (error) {
    console.error("Razorpay webhook persistence failed", { eventId, eventType, message: error.message });
    return res.status(503).json({ success: false, message: "Webhook processing is temporarily unavailable" });
  }
};

module.exports = { razorpayWebhook, extractSuccessfulPayment };
