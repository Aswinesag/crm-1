const service = require("../services/supplierPaymentService");
const sendError = (res, error) => {
  if (error?.code === 11000) { const reference = Boolean(error.keyPattern?.normalizedReferenceNumber); return res.status(409).json({ success: false, code: reference ? "DUPLICATE_REFERENCE" : "DUPLICATE_PAYMENT", message: reference ? "This supplier payment reference has already been recorded for the selected supplier and method" : "Duplicate supplier payment request" }); }
  if ([20, 251].includes(error?.code)) return res.status(503).json({ success: false, message: "Supplier Payment recording requires MongoDB replica-set transaction support" });
  console.error("Supplier Payment error:", error); return res.status(error.statusCode || 500).json({ success: false, code: error.businessCode, message: error.statusCode ? error.message : "Supplier Payment operation failed" });
};
const list = async (req, res) => { try { return res.json({ success: true, ...(await service.list(req.query)) }); } catch (error) { return sendError(res, error); } };
const detail = async (req, res) => { try { return res.json({ success: true, data: await service.detail(req.params.id) }); } catch (error) { return sendError(res, error); } };
const preview = async (req, res) => { try { return res.json({ success: true, data: await service.preview(req.body) }); } catch (error) { return sendError(res, error); } };
const create = async (req, res) => { try { const result = await service.create(req.body, req.user._id); return res.status(result.idempotent ? 200 : 201).json({ success: true, idempotent: result.idempotent, message: result.idempotent ? "Supplier Payment was already recorded" : "Supplier Payment recorded", data: result.payment }); } catch (error) { return sendError(res, error); } };
const reverse = async (req, res) => { try { const result = await service.reverse(req.params.id, req.user._id, req.body.reason); return res.json({ success: true, idempotent: result.alreadyReversed, message: result.alreadyReversed ? "Supplier Payment was already reversed" : "Supplier Payment reversed", data: result.payment }); } catch (error) { return sendError(res, error); } };
module.exports = { list, detail, preview, create, reverse };
