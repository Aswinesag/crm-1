const mongoose = require("mongoose");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");
const Unit = require("../models/Unit");
const HsnCode = require("../models/HsnCode");
const Warehouse = require("../models/Warehouse");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const text = (value, max) => String(value ?? "").trim().slice(0, max);
const status = (value) => value === "Inactive" ? "Inactive" : "Active";
const validId = (value) => mongoose.isValidObjectId(value);

const configs = {
  category: {
    Model: Category,
    searchFields: ["name", "description"],
    sanitize: (body) => ({ name: text(body.name, 120), description: text(body.description, 500), status: status(body.status) }),
    required: (data) => Boolean(data.name),
    duplicate: (data, id) => ({ _id: { $ne: id }, name: { $regex: `^${escapeRegex(data.name)}$`, $options: "i" } }),
    beforeDelete: async (id) => (await SubCategory.exists({ category: id })) ? "Delete its subcategories before deleting this category" : null,
  },
  subcategory: {
    Model: SubCategory,
    searchFields: ["name", "description"],
    populate: "category",
    sanitize: (body) => ({ category: body.category, name: text(body.name, 120), description: text(body.description, 500), status: status(body.status) }),
    required: (data) => validId(data.category) && Boolean(data.name),
    validate: async (data) => (await Category.exists({ _id: data.category })) ? null : "Category not found",
    duplicate: (data, id) => ({ _id: { $ne: id }, category: data.category, name: { $regex: `^${escapeRegex(data.name)}$`, $options: "i" } }),
  },
  brand: {
    Model: Brand,
    searchFields: ["name", "description"],
    sanitize: (body) => ({ name: text(body.name, 120), description: text(body.description, 500), status: status(body.status) }),
    required: (data) => Boolean(data.name),
    duplicate: (data, id) => ({ _id: { $ne: id }, name: { $regex: `^${escapeRegex(data.name)}$`, $options: "i" } }),
  },
  unit: {
    Model: Unit,
    searchFields: ["name", "shortName"],
    sanitize: (body) => ({ name: text(body.name, 80), shortName: text(body.shortName, 20), status: status(body.status) }),
    required: (data) => Boolean(data.name),
    duplicate: (data, id) => ({ _id: { $ne: id }, name: { $regex: `^${escapeRegex(data.name)}$`, $options: "i" } }),
  },
  hsn: {
    Model: HsnCode,
    searchFields: ["hsnCode", "description"],
    sanitize: (body) => ({ hsnCode: text(body.hsnCode, 20), description: text(body.description, 500), gstPercentage: Number(body.gstPercentage) }),
    required: (data) => Boolean(data.hsnCode) && Number.isFinite(data.gstPercentage) && data.gstPercentage >= 0 && data.gstPercentage <= 100,
    duplicate: (data, id) => ({ _id: { $ne: id }, hsnCode: { $regex: `^${escapeRegex(data.hsnCode)}$`, $options: "i" } }),
  },
  warehouse: {
    Model: Warehouse,
    searchFields: ["warehouseCode", "warehouseName", "location", "managerName", "contactNumber"],
    sanitize: (body) => ({ warehouseCode: text(body.warehouseCode, 40).toUpperCase(), warehouseName: text(body.warehouseName, 120), location: text(body.location, 250), managerName: text(body.managerName, 120), contactNumber: text(body.contactNumber, 30), status: status(body.status) }),
    required: (data) => Boolean(data.warehouseCode && data.warehouseName && data.location),
    duplicate: (data, id) => ({ _id: { $ne: id }, warehouseCode: { $regex: `^${escapeRegex(data.warehouseCode)}$`, $options: "i" } }),
  },
};

const errorResponse = (res, error) => {
  if (error?.code === 11000) return res.status(409).json({ success: false, message: "A matching record already exists" });
  if (error?.name === "ValidationError" || error?.name === "CastError") return res.status(400).json({ success: false, message: error.message });
  console.error("Product settings error:", error);
  return res.status(500).json({ success: false, message: "Unable to process product setting" });
};

const handlers = (key) => {
  const config = configs[key];
  const { Model } = config;
  return {
    create: async (req, res) => {
      try {
        const data = config.sanitize(req.body);
        if (!config.required(data)) return res.status(400).json({ success: false, message: "Required fields are invalid" });
        const validationError = config.validate ? await config.validate(data) : null;
        if (validationError) return res.status(400).json({ success: false, message: validationError });
        if (config.duplicate && await Model.exists(config.duplicate(data, null))) return res.status(409).json({ success: false, message: "A matching record already exists" });
        return res.status(201).json({ success: true, data: await Model.create(data) });
      } catch (error) { return errorResponse(res, error); }
    },
    list: async (req, res) => {
      try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const search = text(req.query.search || req.query.keyword, 120);
        const query = search ? { $or: config.searchFields.map((field) => ({ [field]: { $regex: escapeRegex(search), $options: "i" } })) } : {};
        let recordsQuery = Model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        if (config.populate) recordsQuery = recordsQuery.populate(config.populate);
        const [data, totalRecords] = await Promise.all([
          recordsQuery.lean(),
          Model.countDocuments(query),
        ]);
        return res.json({ success: true, data, totalRecords, currentPage: page, totalPages: Math.max(1, Math.ceil(totalRecords / limit)) });
      } catch (error) { return errorResponse(res, error); }
    },
    get: async (req, res) => {
      try {
        if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid record ID" });
        let recordQuery = Model.findById(req.params.id);
        if (config.populate) recordQuery = recordQuery.populate(config.populate);
        const data = await recordQuery.lean();
        return data ? res.json({ success: true, data }) : res.status(404).json({ success: false, message: "Record not found" });
      } catch (error) { return errorResponse(res, error); }
    },
    update: async (req, res) => {
      try {
        if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid record ID" });
        const data = config.sanitize(req.body);
        if (!config.required(data)) return res.status(400).json({ success: false, message: "Required fields are invalid" });
        const validationError = config.validate ? await config.validate(data) : null;
        if (validationError) return res.status(400).json({ success: false, message: validationError });
        if (config.duplicate && await Model.exists(config.duplicate(data, req.params.id))) return res.status(409).json({ success: false, message: "A matching record already exists" });
        let updateQuery = Model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (config.populate) updateQuery = updateQuery.populate(config.populate);
        const updated = await updateQuery;
        return updated ? res.json({ success: true, data: updated }) : res.status(404).json({ success: false, message: "Record not found" });
      } catch (error) { return errorResponse(res, error); }
    },
    remove: async (req, res) => {
      try {
        if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid record ID" });
        const conflict = config.beforeDelete ? await config.beforeDelete(req.params.id) : null;
        if (conflict) return res.status(409).json({ success: false, message: conflict });
        const removed = await Model.findByIdAndDelete(req.params.id);
        return removed ? res.json({ success: true, message: "Record deleted" }) : res.status(404).json({ success: false, message: "Record not found" });
      } catch (error) { return errorResponse(res, error); }
    },
  };
};

module.exports = Object.fromEntries(Object.keys(configs).map((key) => [key, handlers(key)]));
