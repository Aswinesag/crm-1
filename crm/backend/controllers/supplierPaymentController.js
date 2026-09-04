const SupplierPayment = require("../models/SupplierPayment");

/*
=========================================
CREATE SUPPLIER PAYMENT
POST /api/supplier-payments
=========================================
*/
exports.createSupplierPayment = async (req, res) => {
    try {

        const {
            paymentNumber,
            paymentDate,
            supplier,
            billNumber,
            amount,
            paymentMethod,
            transactionNumber,
            remarks,
            status
        } = req.body;

        if (
            !paymentNumber ||
            !paymentDate ||
            !supplier ||
            !billNumber ||
            amount === undefined ||
            !paymentMethod
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        const existingPayment =
            await SupplierPayment.findOne({
                paymentNumber: {
                    $regex: new RegExp(
                        `^${paymentNumber.trim()}$`,
                        "i"
                    )
                }
            });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: "Payment Number already exists"
            });
        }

        const supplierPayment =
            await SupplierPayment.create({
                paymentNumber: paymentNumber.trim(),
                paymentDate,
                supplier,
                billNumber: billNumber.trim(),
                amount,
                paymentMethod,
                transactionNumber: transactionNumber || "",
                remarks: remarks || "",
                status: status || "Active"
            });

        return res.status(201).json({
            success: true,
            message: "Supplier Payment created successfully",
            data: supplierPayment
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
GET ALL SUPPLIER PAYMENTS
GET /api/supplier-payments
?page=1
&limit=10
&search=SP001
=========================================
*/
exports.getSupplierPayments = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const filter = {};

        if (search) {

            filter.paymentNumber = {
                $regex: search,
                $options: "i"
            };

        }

        const totalRecords =
            await SupplierPayment.countDocuments(filter);

        const supplierPayments =
            await SupplierPayment.find(filter)
                .populate(
                    "supplier",
                    "vendorCode vendorName"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit);

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalRecords,
            totalPages:
                Math.ceil(totalRecords / limit),
            data: supplierPayments
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
GET SUPPLIER PAYMENT BY ID
GET /api/supplier-payments/:id
=========================================
*/
exports.getSupplierPaymentById = async (req, res) => {
    try {

        const supplierPayment =
            await SupplierPayment.findById(req.params.id)
                .populate(
                    "supplier",
                    "vendorCode vendorName"
                );

        if (!supplierPayment) {
            return res.status(404).json({
                success: false,
                message: "Supplier Payment not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: supplierPayment
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
UPDATE SUPPLIER PAYMENT
PUT /api/supplier-payments/:id
=========================================
*/
exports.updateSupplierPayment = async (req, res) => {
    try {

        const {
            paymentNumber,
            paymentDate,
            supplier,
            billNumber,
            amount,
            paymentMethod,
            transactionNumber,
            remarks,
            status
        } = req.body;

        const supplierPayment =
            await SupplierPayment.findById(req.params.id);

        if (!supplierPayment) {
            return res.status(404).json({
                success: false,
                message: "Supplier Payment not found"
            });
        }

        if (paymentNumber) {

            const existingPayment =
                await SupplierPayment.findOne({
                    paymentNumber: {
                        $regex: new RegExp(
                            `^${paymentNumber.trim()}$`,
                            "i"
                        )
                    },
                    _id: {
                        $ne: req.params.id
                    }
                });

            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: "Payment Number already exists"
                });
            }

            supplierPayment.paymentNumber =
                paymentNumber.trim();

        }

        if (paymentDate !== undefined) {
            supplierPayment.paymentDate =
                paymentDate;
        }

        if (supplier !== undefined) {
            supplierPayment.supplier =
                supplier;
        }

        if (billNumber !== undefined) {
            supplierPayment.billNumber =
                billNumber.trim();
        }

        if (amount !== undefined) {
            supplierPayment.amount =
                amount;
        }

        if (paymentMethod !== undefined) {
            supplierPayment.paymentMethod =
                paymentMethod;
        }

        if (transactionNumber !== undefined) {
            supplierPayment.transactionNumber =
                transactionNumber;
        }

        if (remarks !== undefined) {
            supplierPayment.remarks =
                remarks;
        }

        if (status !== undefined) {
            supplierPayment.status =
                status;
        }

        await supplierPayment.save();

        return res.status(200).json({
            success: true,
            message: "Supplier Payment updated successfully",
            data: supplierPayment
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
DEACTIVATE SUPPLIER PAYMENT
PATCH /api/supplier-payments/:id/deactivate
=========================================
*/
exports.deactivateSupplierPayment = async (req, res) => {
    try {

        const supplierPayment =
            await SupplierPayment.findById(req.params.id);

        if (!supplierPayment) {
            return res.status(404).json({
                success: false,
                message: "Supplier Payment not found"
            });
        }

        supplierPayment.status =
            "Inactive";

        await supplierPayment.save();

        return res.status(200).json({
            success: true,
            message: "Supplier Payment deactivated successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
ACTIVATE SUPPLIER PAYMENT
PATCH /api/supplier-payments/:id/activate
=========================================
*/
exports.activateSupplierPayment = async (req, res) => {
    try {

        const supplierPayment =
            await SupplierPayment.findById(req.params.id);

        if (!supplierPayment) {
            return res.status(404).json({
                success: false,
                message: "Supplier Payment not found"
            });
        }

        supplierPayment.status =
            "Active";

        await supplierPayment.save();

        return res.status(200).json({
            success: true,
            message: "Supplier Payment activated successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


/*
=========================================
HARD DELETE SUPPLIER PAYMENT
DELETE /api/supplier-payments/:id
=========================================
*/
exports.deleteSupplierPayment = async (req, res) => {
    try {

        const supplierPayment =
            await SupplierPayment.findById(req.params.id);

        if (!supplierPayment) {
            return res.status(404).json({
                success: false,
                message: "Supplier Payment not found"
            });
        }

        await supplierPayment.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Supplier Payment deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};