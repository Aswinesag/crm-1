const PurchaseReturn = require("../models/PurchaseReturn");

/*
=========================================
CREATE PURCHASE RETURN
POST /api/purchase-returns
=========================================
*/

exports.createPurchaseReturn = async (req, res) => {

    try {

        const
        {
            returnNumber,
            returnDate,
            supplier,
            material,
            quantity,
            returnReason,
            status
        } = req.body;

        if (
            !returnNumber ||
            !returnDate ||
            !supplier ||
            !material ||
            !quantity ||
            !returnReason
        ) {

            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });

        }

        const existingReturn =
            await PurchaseReturn.findOne({
                returnNumber
            });

        if (existingReturn) {

            return res.status(400).json({
                success: false,
                message: "Return Number already exists"
            });

        }

        const purchaseReturn =
            await PurchaseReturn.create({

                returnNumber,
                returnDate,
                supplier,
                material,
                quantity,
                returnReason,
                status: status || "Pending"

            });

        return res.status(201).json({

            success: true,
            message: "Purchase Return created successfully",
            data: purchaseReturn

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

/*
=========================================
GET ALL PURCHASE RETURNS
GET /api/purchase-returns
=========================================
*/

exports.getPurchaseReturns = async (req, res) => {

    try {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const search =
            req.query.search || "";

        const skip =
            (page - 1) * limit;

        const filter = {};

        if (search) {

            filter.returnNumber = {

                $regex: search,
                $options: "i"

            };

        }

        const totalRecords =
            await PurchaseReturn.countDocuments(filter);

        const purchaseReturns =
            await PurchaseReturn.find(filter)

            .populate("supplier", "vendorName vendorCode")

            .populate("material", "materialName materialCode")

            .sort({ createdAt: -1 })

            .skip(skip)

            .limit(limit);

        return res.status(200).json({

            success: true,
            page,
            limit,
            totalRecords,
            totalPages:
                Math.ceil(totalRecords / limit),
            data: purchaseReturns

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};
/*
=========================================
GET PURCHASE RETURN BY ID
GET /api/purchase-returns/:id
=========================================
*/

exports.getPurchaseReturnById = async (req, res) => {

    try {

        const purchaseReturn =
            await PurchaseReturn.findById(req.params.id)

            .populate("supplier")

            .populate("material");

        if (!purchaseReturn) {

            return res.status(404).json({

                success: false,
                message: "Purchase Return not found"

            });

        }

        return res.status(200).json({

            success: true,
            data: purchaseReturn

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};
/*
=========================================
UPDATE PURCHASE RETURN
PUT /api/purchase-returns/:id
=========================================
*/

exports.updatePurchaseReturn = async (req, res) => {

    try {

        const purchaseReturn =
            await PurchaseReturn.findById(req.params.id);

        if (!purchaseReturn) {

            return res.status(404).json({

                success: false,
                message: "Purchase Return not found"

            });

        }

        Object.assign(
            purchaseReturn,
            req.body
        );

        await purchaseReturn.save();

        return res.status(200).json({

            success: true,
            message: "Purchase Return updated successfully",
            data: purchaseReturn

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};
/*
=========================================
DELETE PURCHASE RETURN
DELETE /api/purchase-returns/:id
=========================================
*/

exports.deletePurchaseReturn = async (req, res) => {

    try {

        const purchaseReturn =
            await PurchaseReturn.findById(req.params.id);

        if (!purchaseReturn) {

            return res.status(404).json({

                success: false,
                message: "Purchase Return not found"

            });

        }

        await purchaseReturn.deleteOne();

        return res.status(200).json({

            success: true,
            message: "Purchase Return deleted successfully"

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

};