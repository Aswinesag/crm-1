const mongoose = require("mongoose");
const Product = require("../models/Product");
const RawMaterial = require("../models/RawMaterial");
const Component = require("../models/Component");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");
const Unit = require("../models/Unit");
const HsnCode = require("../models/HsnCode");

const text = (value, max) => String(value ?? "").trim().slice(0, max);
const optionalId = (value) => text(value, 50) || null;
const numeric = (value) => value === "" || value == null ? 0 : Number(value);
const normalizeStatus = (value) => value === "Inactive" ? "Inactive" : "Active";
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const validId = (value) => mongoose.isValidObjectId(value);

const configs = {
  product: {
    Model: Product, codeField: "productCode", nameField: "productName", populate: ["category", "subCategory", "brand", "unit", "hsnCode"],
    sanitize: (body) => ({ productCode: text(body.productCode, 40).toUpperCase(), productName: text(body.productName, 160), description: text(body.description, 1000), productType: text(body.productType, 30), category: optionalId(body.category), subCategory: optionalId(body.subCategory), brand: optionalId(body.brand), unit: optionalId(body.unit), hsnCode: optionalId(body.hsnCode), costPrice: numeric(body.costPrice), sellingPrice: numeric(body.sellingPrice), mrp: numeric(body.mrp), discount: numeric(body.discount), reorderLevel: numeric(body.reorderLevel), status: normalizeStatus(body.status) }),
  },
  rawMaterial: {
    Model: RawMaterial, codeField: "materialCode", nameField: "materialName", populate: ["category", "unit", "hsnCode"],
    sanitize: (body) => ({ materialCode: text(body.materialCode, 40).toUpperCase(), materialName: text(body.materialName, 160), description: text(body.description, 1000), category: optionalId(body.category), unit: optionalId(body.unit), hsnCode: optionalId(body.hsnCode), costPrice: numeric(body.costPrice), reorderLevel: numeric(body.reorderLevel), status: normalizeStatus(body.status) }),
  },
  component: {
    Model: Component, codeField: "componentCode", nameField: "componentName", populate: ["category", "unit", "hsnCode"],
    sanitize: (body) => ({ componentCode: text(body.componentCode, 40).toUpperCase(), componentName: text(body.componentName, 160), description: text(body.description, 1000), category: optionalId(body.category), unit: optionalId(body.unit), hsnCode: optionalId(body.hsnCode), costPrice: numeric(body.costPrice), reorderLevel: numeric(body.reorderLevel), status: normalizeStatus(body.status) }),
  },
};

const validate = async (key, data) => {
  const config = configs[key];
  if (!data[config.codeField] || !data[config.nameField]) return "Code and name are required";
  if (!validId(data.category) || !validId(data.unit)) return "Valid category and unit are required";
  for (const field of ["costPrice", "sellingPrice", "mrp", "reorderLevel"]) if (field in data && (!Number.isFinite(data[field]) || data[field] < 0)) return `${field} must be a non-negative number`;
  if ("discount" in data && (!Number.isFinite(data.discount) || data.discount < 0 || data.discount > 100)) return "Discount must be between 0 and 100";
  if (key === "product" && !["Raw Material", "Finished Product", "Service"].includes(data.productType)) return "Invalid product type";
  for (const field of ["subCategory", "brand", "hsnCode"]) if (data[field] && !validId(data[field])) return `Invalid ${field} ID`;
  const [category, unit, subCategory, brand, hsn] = await Promise.all([Category.findById(data.category).lean(), Unit.findById(data.unit).lean(), data.subCategory ? SubCategory.findById(data.subCategory).lean() : null, data.brand ? Brand.findById(data.brand).lean() : null, data.hsnCode ? HsnCode.findById(data.hsnCode).lean() : null]);
  if (!category) return "Category not found";
  if (!unit) return "Unit not found";
  if (data.subCategory && !subCategory) return "Subcategory not found";
  if (subCategory && String(subCategory.category) !== String(data.category)) return "Subcategory does not belong to the selected category";
  if (data.brand && !brand) return "Brand not found";
  if (data.hsnCode && !hsn) return "HSN code not found";
  return null;
};

const errorResponse = (res, error) => {
  if (error?.code === 11000) return res.status(409).json({ success: false, message: "Code already exists" });
  if (["ValidationError", "CastError"].includes(error?.name)) return res.status(400).json({ success: false, message: error.message });
  console.error("Product Master error:", error);
  return res.status(500).json({ success: false, message: "Unable to process Product Master record" });
};

const handlers = (key) => {
  const config = configs[key]; const { Model } = config;
  const populate = (query) => config.populate.reduce((current, path) => current.populate(path), query);
  return {
    create: async (req, res) => { try { const data = config.sanitize(req.body); const issue = await validate(key, data); if (issue) return res.status(400).json({ success: false, message: issue }); if (await Model.exists({ [config.codeField]: data[config.codeField] })) return res.status(409).json({ success: false, message: "Code already exists" }); const created = await Model.create(data); return res.status(201).json({ success: true, data: await populate(Model.findById(created._id)).lean() }); } catch (error) { return errorResponse(res, error); } },
    list: async (req, res) => { try { const page = Math.max(1, parseInt(req.query.page, 10) || 1), limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 10)), search = text(req.query.search || req.query.keyword, 120), query = {}; if (search) query.$or = [config.codeField, config.nameField, "description"].map((field) => ({ [field]: { $regex: escapeRegex(search), $options: "i" } })); if (["Active", "Inactive"].includes(req.query.status)) query.status = req.query.status; if (key === "product" && ["Raw Material", "Finished Product", "Service"].includes(req.query.productType)) query.productType = req.query.productType; const [data, totalRecords] = await Promise.all([populate(Model.find(query)).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Model.countDocuments(query)]); return res.json({ success: true, data, totalRecords, currentPage: page, totalPages: Math.max(1, Math.ceil(totalRecords / limit)) }); } catch (error) { return errorResponse(res, error); } },
    get: async (req, res) => { try { if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid record ID" }); const record = await populate(Model.findById(req.params.id)).lean(); return record ? res.json({ success: true, data: record }) : res.status(404).json({ success: false, message: "Record not found" }); } catch (error) { return errorResponse(res, error); } },
    update: async (req, res) => { try { if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid record ID" }); const data = config.sanitize(req.body), issue = await validate(key, data); if (issue) return res.status(400).json({ success: false, message: issue }); if (await Model.exists({ _id: { $ne: req.params.id }, [config.codeField]: data[config.codeField] })) return res.status(409).json({ success: false, message: "Code already exists" }); const record = await populate(Model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })); return record ? res.json({ success: true, data: record }) : res.status(404).json({ success: false, message: "Record not found" }); } catch (error) { return errorResponse(res, error); } },
    remove: async (req, res) => { try { if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid record ID" }); const record = await Model.findByIdAndUpdate(req.params.id, { status: "Inactive" }, { new: true }); return record ? res.json({ success: true, message: "Record deactivated", data: record }) : res.status(404).json({ success: false, message: "Record not found" }); } catch (error) { return errorResponse(res, error); } },
    changeStatus: async (req, res) => { try { if (!validId(req.params.id) || !["Active", "Inactive"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid ID or status" }); const record = await Model.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); return record ? res.json({ success: true, data: record }) : res.status(404).json({ success: false, message: "Record not found" }); } catch (error) { return errorResponse(res, error); } },
  };
};

module.exports = { product: handlers("product"), rawMaterial: handlers("rawMaterial"), component: handlers("component") };
