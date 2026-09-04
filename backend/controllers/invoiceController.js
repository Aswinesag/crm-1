const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const { calculateInvoiceTotals } = require("../utils/invoiceCalculations");

const MAX_PAGE_SIZE = 100;
const cleanText = (value, maxLength) =>
  String(value || "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, maxLength);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDate = (value, field) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    const error = new Error(`${field} is invalid`);
    error.statusCode = 400;
    throw error;
  }
  return date;
};

const derivePaymentStatus = (invoice) => {
  if (invoice.paymentStatus === "Paid") return "Paid";
  if (invoice.amountPaid > 0) return "Partially Paid";
  return new Date(invoice.dueDate).getTime() < Date.now() ? "Overdue" : "Unpaid";
};

const publicInvoice = (invoice) => {
  const value = invoice.toObject ? invoice.toObject() : invoice;
  return { ...value, id: String(value._id), paymentStatus: derivePaymentStatus(value) };
};

const invoiceInput = (body) => {
  const invoiceNumber = cleanText(body.invoiceNumber, 80);
  const salesOrderNo = cleanText(body.salesOrderNo, 80);
  const customerName = cleanText(body.customerName, 160);
  const gstin = cleanText(body.gstin, 30).toUpperCase();
  const billingAddress = cleanText(body.billingAddress, 1000);
  const shippingAddress = cleanText(body.shippingAddress, 1000);
  const paymentTerms = cleanText(body.paymentTerms, 120);
  if (!invoiceNumber || !salesOrderNo || !customerName || !gstin || !billingAddress || !shippingAddress || !paymentTerms) {
    const error = new Error("All required invoice fields must be provided");
    error.statusCode = 400;
    throw error;
  }
  const invoiceDate = parseDate(body.invoiceDate, "Invoice date");
  const dueDate = parseDate(body.dueDate, "Due date");
  if (dueDate < invoiceDate) {
    const error = new Error("Due date cannot be before invoice date");
    error.statusCode = 400;
    throw error;
  }
  const totals = calculateInvoiceTotals(body.items, body.freightCharges ?? 0);
  return {
    invoiceNumber,
    invoiceDate,
    salesOrderNo,
    customerName,
    customerEmail: cleanText(body.customerEmail, 160).toLowerCase(),
    customerContact: cleanText(body.customerContact, 30),
    gstin,
    billingAddress,
    shippingAddress,
    paymentTerms,
    dueDate,
    ...totals,
  };
};

const createInvoice = async (req, res) => {
  try {
    const input = invoiceInput(req.body);
    const invoice = await Invoice.create({
      ...input,
      amountPaid: 0,
      balanceDue: input.grandTotal,
      paymentStatus: "Unpaid",
      currency: "INR",
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: publicInvoice(invoice) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Invoice number already exists" });
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Invoice creation failed", { message: error.message });
    return res.status(500).json({ success: false, message: "Unable to create invoice" });
  }
};

const getInvoices = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {};
    if (["Unpaid", "Partially Paid", "Paid", "Overdue"].includes(req.query.paymentStatus)) {
      if (req.query.paymentStatus === "Overdue") {
        filter.paymentStatus = { $ne: "Paid" };
        filter.dueDate = { $lt: new Date() };
      } else filter.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.invoiceNumber) filter.invoiceNumber = cleanText(req.query.invoiceNumber, 80);
    if (req.query.customerName) filter.customerName = { $regex: escapeRegex(cleanText(req.query.customerName, 160)), $options: "i" };

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Invoice.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data: invoices.map(publicInvoice),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Invoice listing failed", { message: error.message });
    return res.status(500).json({ success: false, message: "Unable to load invoices" });
  }
};

const getInvoice = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID" });
  try {
    const invoice = await Invoice.findById(req.params.id).lean();
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    return res.json({ success: true, data: publicInvoice(invoice) });
  } catch (error) {
    console.error("Invoice retrieval failed", { invoiceId: req.params.id, message: error.message });
    return res.status(500).json({ success: false, message: "Unable to load invoice" });
  }
};

const updateInvoice = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID" });
  try {
    const current = await Invoice.findById(req.params.id);
    if (!current) return res.status(404).json({ success: false, message: "Invoice not found" });
    if (current.paymentStatus === "Paid" || current.amountPaid > 0) {
      return res.status(409).json({ success: false, message: "Paid invoices cannot be edited" });
    }
    const input = invoiceInput(req.body);
    Object.assign(current, input, {
      amountPaid: 0,
      balanceDue: input.grandTotal,
      paymentStatus: "Unpaid",
      updatedBy: req.user._id,
    });
    await current.save();
    return res.json({ success: true, data: publicInvoice(current) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Invoice number already exists" });
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    console.error("Invoice update failed", { invoiceId: req.params.id, message: error.message });
    return res.status(500).json({ success: false, message: "Unable to update invoice" });
  }
};

const deleteInvoice = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice ID" });
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    if (invoice.paymentStatus === "Paid" || invoice.amountPaid > 0) {
      return res.status(409).json({ success: false, message: "Paid invoices cannot be deleted" });
    }
    if (await Payment.exists({ invoice: invoice._id })) {
      return res.status(409).json({ success: false, message: "Invoice has a payment attempt and cannot be deleted" });
    }
    await Invoice.deleteOne({ _id: invoice._id, paymentStatus: "Unpaid", amountPaid: 0 });
    return res.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    console.error("Invoice deletion failed", { invoiceId: req.params.id, message: error.message });
    return res.status(500).json({ success: false, message: "Unable to delete invoice" });
  }
};

module.exports = { createInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice, publicInvoice };
