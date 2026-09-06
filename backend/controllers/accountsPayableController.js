const service = require("../services/accountsPayableService");
const sendError = (res, error) => { console.error("Accounts Payable error:", error); return res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : "Accounts Payable operation failed" }); };
const list = async (req, res) => { try { return res.json({ success: true, ...(await service.list(req.query)) }); } catch (error) { return sendError(res, error); } };
const detail = async (req, res) => { try { return res.json({ success: true, data: await service.detail(req.params.id) }); } catch (error) { return sendError(res, error); } };
const summary = async (_req, res) => { try { return res.json({ success: true, data: await service.summary() }); } catch (error) { return sendError(res, error); } };
const aging = async (req, res) => { try { return res.json({ success: true, data: await service.aging(req.query) }); } catch (error) { return sendError(res, error); } };
module.exports = { list, detail, summary, aging };
