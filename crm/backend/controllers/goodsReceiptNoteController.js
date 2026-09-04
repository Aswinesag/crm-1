const GoodsReceiptNote = require("../models/GoodsReceiptNote");

/*
=========================================
CREATE GRN
POST /api/grns
=========================================
*/
exports.createGRN = async (req, res) => {
    try {

        const grn = await GoodsReceiptNote.create(req.body);

        res.status(201).json({
            success: true,
            message: "Goods Receipt Note created successfully",
            data: grn
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
GET ALL GRNS
GET /api/grns
=========================================
*/
exports.getGRNs = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        let filter = {};

        if (search) {
            filter.grnNumber = {
                $regex: search,
                $options: "i"
            };
        }

        const totalRecords =
            await GoodsReceiptNote.countDocuments(filter);

        const grns =
            await GoodsReceiptNote.find(filter)
                .populate("purchaseOrder", "poNumber")
                .populate("supplier", "vendorName")
                .populate("warehouse", "warehouseName")
                .populate("receivedBy", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

        res.status(200).json({
            success: true,
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            data: grns
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


/*
=========================================
GET SINGLE GRN
GET /api/grns/:id
=========================================
*/
exports.getGRNById = async (req, res) => {

    try {

        const grn =
            await GoodsReceiptNote.findById(req.params.id)
                .populate("purchaseOrder")
                .populate("supplier")
                .populate("warehouse")
                .populate("receivedBy")
                .populate("items.material");

        if (!grn) {
            return res.status(404).json({
                success: false,
                message: "GRN not found"
            });
        }

        res.status(200).json({
            success: true,
            data: grn
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


/*
=========================================
UPDATE GRN
PUT /api/grns/:id
=========================================
*/
exports.updateGRN = async (req, res) => {

    try {

        const grn =
            await GoodsReceiptNote.findById(req.params.id);

        if (!grn) {

            return res.status(404).json({
                success: false,
                message: "GRN not found"
            });

        }

        Object.assign(grn, req.body);

        await grn.save();

        res.status(200).json({
            success: true,
            message: "GRN updated successfully",
            data: grn
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


/*
=========================================
DELETE GRN
DELETE /api/grns/:id
=========================================
*/
exports.deleteGRN = async (req, res) => {

    try {

        const grn =
            await GoodsReceiptNote.findById(req.params.id);

        if (!grn) {

            return res.status(404).json({
                success: false,
                message: "GRN not found"
            });

        }

        await grn.deleteOne();

        res.status(200).json({
            success: true,
            message: "GRN deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};