const mongoose = require("mongoose");
const GRN = require("../../models/grn/grnModel");
const { prepareDraft, post, reverse } = require("../../services/grnService");

const populated = (query) => query.populate("purchaseOrder", "poNumber status items").populate("vendor", "vendorCode vendorName").populate("warehouse", "warehouseCode warehouseName").populate("receivedBy postedBy reversedBy", "name email").populate("items.item");
const sendError = (res, error) => {
  if (error?.code === 11000) return res.status(409).json({ success: false, message: "Duplicate GRN posting or number" });
  if ([20, 251].includes(error?.code)) return res.status(503).json({ success: false, message: "GRN posting requires MongoDB replica-set transaction support" });
  console.error("GRN error:", error);
  return res.status(error.statusCode || (error.name === "ValidationError" ? 400 : 500)).json({ success: false, message: error.statusCode || error.name === "ValidationError" ? error.message : "GRN operation failed" });
};

const createGRN = async (req, res) => { try { const grn = await prepareDraft(req.body, req.user._id); return res.status(201).json({ success: true, message: "Draft GRN created", data: grn }); } catch (error) { return sendError(res, error); } };
const getAllGRNs = async (req, res) => { try { const data = await populated(GRN.find()).sort({ createdAt: -1 }); return res.json({ success: true, data, count: data.length }); } catch (error) { return sendError(res, error); } };
const getSingleGRN = async (req, res) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid GRN ID" }); const data = await populated(GRN.findById(req.params.id)); if (!data) return res.status(404).json({ success: false, message: "GRN not found" }); return res.json({ success: true, data }); } catch (error) { return sendError(res, error); } };
const updateGRN = async (req, res) => { try { const existing = await GRN.findById(req.params.id); if (!existing) return res.status(404).json({ success: false, message: "GRN not found" }); if (existing.status !== "Draft") return res.status(409).json({ success: false, message: "Only Draft GRNs can be edited" }); const data = await prepareDraft({ ...req.body, purchaseOrder: req.body.purchaseOrder || existing.purchaseOrder, warehouse: req.body.warehouse || existing.warehouse, items: req.body.items || existing.items }, req.user._id, existing); return res.json({ success: true, message: "Draft GRN updated", data }); } catch (error) { return sendError(res, error); } };
const deleteGRN = async (req, res) => { try { const result = await GRN.deleteOne({ _id: req.params.id, status: "Draft" }); if (!result.deletedCount) { const exists = await GRN.exists({ _id: req.params.id }); return res.status(exists ? 409 : 404).json({ success: false, message: exists ? "Only Draft GRNs can be deleted" : "GRN not found" }); } return res.json({ success: true, message: "Draft GRN deleted" }); } catch (error) { return sendError(res, error); } };
const postGRN = async (req, res) => { try { const data = await post(req.params.id, req.user._id); return res.json({ success: true, message: data.alreadyPosted ? "GRN was already posted" : "GRN posted and inventory updated", data }); } catch (error) { return sendError(res, error); } };
const reverseGRN = async (req, res) => { try { const data = await reverse(req.params.id, req.user._id, req.body.reason); return res.json({ success: true, message: "GRN reversed", data }); } catch (error) { return sendError(res, error); } };

module.exports = { createGRN, getAllGRNs, getSingleGRN, updateGRN, deleteGRN, postGRN, reverseGRN };
