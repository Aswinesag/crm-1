const mongoose = require("mongoose");
const PurchaseOrder = require("../../models/PurchaseOrder");
const Vendor = require("../../models/Vendor");
const Warehouse = require("../../models/Warehouse");
const { models } = require("../../services/canonicalInventoryService");
const PurchaseBill = require("../../models/PurchaseBill");

const populated = (query) => query.populate("vendorId", "vendorCode vendorName email phone").populate("warehouseId", "warehouseCode warehouseName").populate("sourceRequisition", "requisitionNo status").populate("sourceRFQ", "rfqNumber status").populate("items.item");
const error = (res, cause) => res.status(cause.statusCode || (cause.name === "ValidationError" ? 400 : 500)).json({ success: false, message: cause.statusCode || cause.name === "ValidationError" ? cause.message : "Purchase Order operation failed" });
const validate = async (body) => {
  if (!mongoose.isValidObjectId(body.vendorId) || !(await Vendor.exists({ _id: body.vendorId }))) throw Object.assign(new Error("Valid vendor is required"), { statusCode: 400 });
  if (body.warehouseId && (!mongoose.isValidObjectId(body.warehouseId) || !(await Warehouse.exists({ _id: body.warehouseId })))) throw Object.assign(new Error("Warehouse not found"), { statusCode: 400 });
  if (!Array.isArray(body.items) || !body.items.length) throw Object.assign(new Error("At least one PO item is required"), { statusCode: 400 });
  for (const line of body.items) if (!models[line.itemType] || !mongoose.isValidObjectId(line.item) || !(await models[line.itemType].exists({ _id: line.item }))) throw Object.assign(new Error("Invalid canonical PO item identity"), { statusCode: 400 });
};
const createPurchaseOrder = async (req, res) => { try { await validate(req.body); const data = await PurchaseOrder.create({ ...req.body, createdBy: req.user._id }); return res.status(201).json({ success: true, data }); } catch (cause) { return error(res, cause); } };
const getAllPurchaseOrders = async (req, res) => { try { return res.json({ success: true, data: await populated(PurchaseOrder.find()).sort({ createdAt: -1 }) }); } catch (cause) { return error(res, cause); } };
const getSinglePurchaseOrder = async (req, res) => { try { const data = await populated(PurchaseOrder.findById(req.params.id)); if (!data) return res.status(404).json({ success: false, message: "Purchase Order not found" }); return res.json({ success: true, data }); } catch (cause) { return error(res, cause); } };
const updatePOStatus = async (req, res) => { try { const allowed = ["DRAFT", "APPROVED", "SENT", "CANCELLED"]; if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid manual Purchase Order status" }); if (req.body.status === "CANCELLED" && await PurchaseBill.exists({ purchaseOrder: req.params.id, status: { $in: ["SUBMITTED", "APPROVED"] } })) return res.status(409).json({ success: false, message: "Cannot cancel Purchase Order because supplier billing depends on it" }); const data = await PurchaseOrder.findOneAndUpdate({ _id: req.params.id, status: { $nin: ["PARTIALLY_RECEIVED", "RECEIVED"] } }, { status: req.body.status }, { new: true, runValidators: true }); if (!data) return res.status(409).json({ success: false, message: "Received Purchase Order status is controlled by GRNs" }); return res.json({ success: true, data }); } catch (cause) { return error(res, cause); } };
module.exports = { createPurchaseOrder, getAllPurchaseOrders, getSinglePurchaseOrder, updatePOStatus };
