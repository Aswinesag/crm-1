const crypto = require("crypto");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const { checkoutSignatureMatches } = require("../utils/razorpaySignatures");
const { finalizeSuccessfulPayment, reconcilePaymentAttempt, reconcileInvoiceAttempts, getAttemptStaleMinutes, publicPayment } = require("../services/paymentReconciliationService");
const { getRazorpayClient } = require("../services/razorpayClient");

const MAX_PAYMENT_AMOUNT_INR = 10000000;
const MAX_PAGE_SIZE = 100;
const cleanText = (value, maxLength) =>
  String(value || "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, maxLength);

const amountToPaise = (amount) => {
  const numericAmount = Number(amount);
  const amountPaise = Math.round(numericAmount * 100);
  if (
    !Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > MAX_PAYMENT_AMOUNT_INR ||
    !Number.isSafeInteger(amountPaise) || Math.abs(amountPaise / 100 - numericAmount) > 1e-9
  ) return null;
  return amountPaise;
};

const invoiceFinancialError = (invoice) => {
  if (invoice.currency !== "INR") return "Invoice currency is not supported";
  if (invoice.paymentStatus === "Paid" || invoice.balanceDue === 0) return "Invoice is already paid";
  if (invoice.amountPaid !== 0 || invoice.balanceDue !== invoice.grandTotal) return "Invoice financial state requires reconciliation";
  if (!amountToPaise(invoice.balanceDue)) return "Invoice balance is invalid";
  return null;
};

const createRazorpayOrder = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).some((key) => key !== "invoiceId")) {
      return res.status(400).json({ success: false, message: "Only invoiceId is accepted" });
    }
    if (!mongoose.isValidObjectId(req.body.invoiceId)) {
      return res.status(400).json({ success: false, message: "Invalid invoice ID" });
    }
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    const financialError = invoiceFinancialError(invoice);
    if (financialError === "Invoice is already paid") return res.status(409).json({ success: false, message: financialError });
    if (financialError) {
      console.error("Blocked payment for inconsistent invoice", { invoiceId: String(invoice._id), reason: financialError });
      return res.status(422).json({ success: false, message: financialError });
    }
    if (await Payment.exists({ $or: [{ invoice: invoice._id }, { invoiceNumber: invoice.invoiceNumber }], status: "Paid" })) {
      console.error("Blocked duplicate payment due to legacy paid record", { invoiceId: String(invoice._id) });
      return res.status(409).json({ success: false, message: "A successful payment already exists for this invoice" });
    }
    const reconciliation = await reconcileInvoiceAttempts(invoice._id);
    if (reconciliation.outcome === "Paid") {
      return res.status(409).json({ success: false, code: "INVOICE_ALREADY_PAID", message: "An existing payment was captured and the invoice is now paid" });
    }
    if (!reconciliation.retryAllowed) {
      const message = reconciliation.outcome === "ManualReview"
        ? "An existing payment requires manual review"
        : "An existing payment attempt is still active";
      return res.status(409).json({ success: false, code: "PAYMENT_ATTEMPT_ACTIVE", message, paymentId: reconciliation.attemptId });
    }

    const amountPaise = amountToPaise(invoice.balanceDue);
    const receipt = `rcpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const order = await getRazorpayClient().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { invoiceId: String(invoice._id), invoiceNumber: invoice.invoiceNumber },
    });

    let payment;
    try {
      payment = await Payment.create({
        invoice: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerContact: invoice.customerContact,
        amount: invoice.balanceDue,
        amountPaise,
        currency: invoice.currency,
        receipt,
        razorpayOrderId: order.id,
        status: "Created",
        reconciliationStatus: "Never",
        retryAllowed: false,
        attemptExpiresAt: new Date(Date.now() + getAttemptStaleMinutes() * 60000),
        createdBy: req.user._id,
      });
    } catch (error) {
      console.error("Payment persistence failed after Razorpay order creation", {
        invoiceId: String(invoice._id), razorpayOrderId: order.id, message: error.message,
      });
      const status = error.code === 11000 ? 409 : 500;
      return res.status(status).json({
        success: false,
        message: status === 409
          ? "A concurrent payment attempt already exists for this invoice"
          : "Payment order was created but could not be recorded locally. Do not retry; contact support.",
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: payment.razorpayOrderId,
        amount: payment.amountPaise,
        currency: payment.currency,
        invoiceId: String(invoice._id),
        invoiceNumber: payment.invoiceNumber,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        customerContact: payment.customerContact,
      },
    });
  } catch (error) {
    const status = error.statusCode || 502;
    console.error("Razorpay order creation failed", { message: error.message });
    return res.status(status).json({
      success: false,
      message: status === 503 ? "Payment service is temporarily unavailable" : status < 500 ? error.message : "Unable to create payment order",
    });
  }
};

const reconcilePayment = async (req, res) => {
  try {
    const result = await reconcilePaymentAttempt(req.params.id);
    return res.json({ success: true, data: { outcome: result.outcome, retryAllowed: result.retryAllowed, idempotent: !!result.idempotent, payment: publicPayment(result.payment) } });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) console.error("Manual payment reconciliation failed", { paymentId: req.params.id, message: error.message });
    return res.status(status).json({ success: false, message: status >= 500 ? "Payment reconciliation is temporarily unavailable" : error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  const orderId = cleanText(req.body.razorpay_order_id, 120);
  const paymentId = cleanText(req.body.razorpay_payment_id, 120);
  const signature = cleanText(req.body.razorpay_signature, 256);
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ success: false, message: "Complete Razorpay verification data is required" });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ success: false, message: "Payment gateway is not configured" });
  }

  try {
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) return res.status(404).json({ success: false, message: "Unknown payment order" });
    if (!checkoutSignatureMatches(orderId, paymentId, signature, process.env.RAZORPAY_KEY_SECRET)) {
      await Payment.updateOne(
        { _id: payment._id, status: "Created" },
        { $inc: { verificationAttempts: 1 }, $set: { lastVerificationError: "Invalid signature" } }
      );
      return res.status(401).json({ success: false, message: "Payment signature verification failed" });
    }
    if (payment.status === "Paid" && payment.razorpayPaymentId !== paymentId) {
      return res.status(409).json({ success: false, message: "Payment order is already linked to another payment" });
    }

    const result = await finalizeSuccessfulPayment({ orderId, paymentId, paidAt: new Date() });
    const updated = result.payment;
    return res.json({
      success: true,
      data: publicPayment(updated),
      idempotent: result.idempotent,
      invoiceId: updated.invoice ? String(updated.invoice) : null,
    });
  } catch (error) {
    if (error.code === 11000) {
      const current = await Payment.findOne({ razorpayOrderId: orderId });
      if (current?.status === "Paid" && current.razorpayPaymentId === paymentId) {
        return res.json({ success: true, data: publicPayment(current), idempotent: true, invoiceId: current.invoice ? String(current.invoice) : null });
      }
    }
    const status = error.statusCode || 500;
    console.error("Payment verification failed", { orderId, message: error.message });
    return res.status(status).json({ success: false, message: status === 500 ? "Unable to verify payment" : error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};
    if (["Created", "Retryable", "Paid"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.invoiceNumber) filter.invoiceNumber = cleanText(req.query.invoiceNumber, 80);
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Payment.countDocuments(filter),
    ]);
    return res.json({ success: true, data: payments.map(publicPayment), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Payment history retrieval failed", { message: error.message });
    return res.status(500).json({ success: false, message: "Unable to load payments" });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment, reconcilePayment, getPayments };
