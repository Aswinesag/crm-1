const StockAudit = require("../models/StockAudit");
const RawMaterial = require("../models/RawMaterial");
const Warehouse = require("../models/Warehouse");

/*
=========================================
Generate Audit Number
AUD001
AUD002
=========================================
*/

const generateAuditNumber = async () => {

    const lastAudit = await StockAudit
        .findOne()
        .sort({ createdAt: -1 });

    if (!lastAudit) return "AUD001";

    const lastNumber = parseInt(
        lastAudit.auditNumber.replace("AUD", "")
    );

    return `AUD${String(lastNumber + 1).padStart(3, "0")}`;
};





/*
=========================================
Create Stock Audit
=========================================
*/

const createStockAudit = async (req, res) => {

    try {

        const {
            auditDate,
            warehouse,
            material,
            physicalStock,
            auditor,
            status,
            remarks
        } = req.body;

        if (
            !auditDate ||
            !warehouse ||
            !material ||
            physicalStock === undefined ||
            !auditor
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const warehouseExists = await Warehouse.findById(warehouse);

        if (!warehouseExists) {
            return res.status(404).json({
                success: false,
                message: "Warehouse not found."
            });
        }

        const materialExists = await RawMaterial.findById(material);

        if (!materialExists) {
            return res.status(404).json({
                success: false,
                message: "Material not found."
            });
        }

        const auditNumber = await generateAuditNumber();

        const systemStock = materialExists.currentStock;

        const difference = physicalStock - systemStock;

        const audit = await StockAudit.create({

            auditNumber,

            auditDate,

            warehouse,

            material,

            systemStock,

            physicalStock,

            difference,

            auditor,

            status,

            remarks

        });

        res.status(201).json({

            success: true,

            message: "Stock Audit created successfully.",

            data: audit

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};





/*
=========================================
Get All Stock Audits
=========================================
*/

const getStockAudits = async (req, res) => {

    try {

        const audits = await StockAudit.find()

            .populate("warehouse", "warehouseName warehouseCode")

            .populate("material", "materialName currentStock")

            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            count: audits.length,

            data: audits

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};





/*
=========================================
Get Single Stock Audit
=========================================
*/

const getStockAuditById = async (req, res) => {

    try {

        const audit = await StockAudit.findById(req.params.id)

            .populate("warehouse")

            .populate("material");

        if (!audit) {

            return res.status(404).json({

                success: false,

                message: "Stock Audit not found."

            });

        }

        res.status(200).json({

            success: true,

            data: audit

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};





/*
=========================================
Update Stock Audit
=========================================
*/

const updateStockAudit = async (req, res) => {

    try {

        const audit = await StockAudit.findById(req.params.id);

        if (!audit) {

            return res.status(404).json({

                success: false,

                message: "Stock Audit not found."

            });

        }

        Object.assign(audit, req.body);

        audit.difference =
            audit.physicalStock - audit.systemStock;

        await audit.save();

        res.status(200).json({

            success: true,

            message: "Stock Audit updated successfully.",

            data: audit

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};





/*
=========================================
Delete Stock Audit
=========================================
*/

const deleteStockAudit = async (req, res) => {

    try {

        const audit = await StockAudit.findById(req.params.id);

        if (!audit) {

            return res.status(404).json({

                success: false,

                message: "Stock Audit not found."

            });

        }

        await audit.deleteOne();

        res.status(200).json({

            success: true,

            message: "Stock Audit deleted successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    createStockAudit,

    getStockAudits,

    getStockAuditById,

    updateStockAudit,

    deleteStockAudit

};