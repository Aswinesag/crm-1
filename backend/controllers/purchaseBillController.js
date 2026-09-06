const mongoose = require("mongoose");
const PurchaseBill = require("../models/PurchaseBill");
const service = require("../services/purchaseBillService");

const populate = (query) => query.populate("supplier", "vendorCode vendorName email").populate("purchaseOrder", "poNumber status items").populate("grnsConsidered", "grnNumber receiptDate status").populate("createdBy submittedBy approvedBy rejectedBy exceptionOverride.approvedBy auditTrail.user", "name email").populate("lines.item");
const sendError = (res, error) => {
  if (error?.code === 11000) { const duplicateInvoice = Boolean(error.keyPattern?.normalizedSupplierInvoiceNumber); return res.status(409).json({ success: false, code: duplicateInvoice ? "DUPLICATE_INVOICE" : "DUPLICATE_BILL_NUMBER", message: duplicateInvoice ? "This supplier invoice number has already been recorded for the selected supplier" : "A Purchase Bill number collision occurred; please retry" }); }
  if ([20, 251].includes(error?.code)) return res.status(503).json({ success: false, message: "Purchase Bill submission requires MongoDB replica-set transaction support" });
  console.error("Purchase Bill error:", error);
  return res.status(error.statusCode || (error.name === "ValidationError" ? 400 : 500)).json({ success: false, code: error.businessCode, message: error.statusCode || error.name === "ValidationError" ? error.message : "Purchase Bill operation failed" });
};
const valid = (id) => mongoose.isValidObjectId(id);
const create = async (req, res) => { try { const data = await service.createDraft(req.body, req.user._id); return res.status(201).json({ success: true, message: "Draft Purchase Bill created", data }); } catch (error) { return sendError(res, error); } };
const list = async (req, res) => { try {
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10)); const filter = {};
  if (req.query.supplier && valid(req.query.supplier)) filter.supplier = req.query.supplier; if (req.query.purchaseOrder && valid(req.query.purchaseOrder)) filter.purchaseOrder = req.query.purchaseOrder;
  if (req.query.status) filter.status = req.query.status; if (req.query.matchStatus) filter.matchStatus = req.query.matchStatus;
  if (req.query.from || req.query.to) { filter.invoiceDate = {}; if (req.query.from) filter.invoiceDate.$gte = new Date(req.query.from); if (req.query.to) { const to = new Date(req.query.to); to.setHours(23, 59, 59, 999); filter.invoiceDate.$lte = to; } }
  if (req.query.search) { const pattern = String(req.query.search).trim(); filter.$or = [{ billNumber: { $regex: pattern, $options: "i" } }, { supplierInvoiceNumber: { $regex: pattern, $options: "i" } }]; }
  const [data, total] = await Promise.all([populate(PurchaseBill.find(filter)).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), PurchaseBill.countDocuments(filter)]);
  return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
} catch (error) { return sendError(res, error); } };
const getOne = async (req, res) => { try { if (!valid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid Purchase Bill ID" }); const data = await populate(PurchaseBill.findById(req.params.id)); if (!data) return res.status(404).json({ success: false, message: "Purchase Bill not found" }); return res.json({ success: true, data }); } catch (error) { return sendError(res, error); } };
const update = async (req, res) => { try { const data = await service.updateDraft(req.params.id, req.body, req.user._id); return res.json({ success: true, message: "Draft Purchase Bill updated", data }); } catch (error) { return sendError(res, error); } };
const remove = async (req, res) => { try { const result = await PurchaseBill.deleteOne({ _id: req.params.id, status: "DRAFT" }); if (!result.deletedCount) { const exists = await PurchaseBill.exists({ _id: req.params.id }); return res.status(exists ? 409 : 404).json({ success: false, message: exists ? "Only Draft Purchase Bills can be deleted" : "Purchase Bill not found" }); } return res.json({ success: true, message: "Draft Purchase Bill deleted" }); } catch (error) { return sendError(res, error); } };
const action = (fn, message) => async (req, res) => { try { const data = await fn(req.params.id, req.user._id, req.body.reason); return res.json({ success: true, message, data }); } catch (error) { return sendError(res, error); } };
const matchPreview = async (req, res) => { try { return res.json({ success: true, data: await service.preview(req.body) }); } catch (error) { return sendError(res, error); } };

module.exports = { create, list, getOne, update, remove, matchPreview, submit: action(service.submit, "Purchase Bill submitted and matched"), rematch: action(service.rematch, "Purchase Bill rematched"), approve: action(service.approve, "Purchase Bill approved"), approveException: action(service.approveException, "Purchase Bill exception approved with override"), reject: action(service.reject, "Purchase Bill rejected") };
