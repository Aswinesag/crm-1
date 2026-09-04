const PurchaseBill = require("../models/PurchaseBill");

/*
=================================================
CREATE PURCHASE BILL
POST /api/purchase-bills
=================================================
*/

exports.createPurchaseBill = async (req, res) => {

    try {

        const {

            billNumber,
            supplierInvoiceNo,
            billDate,
            supplier,
            purchaseOrder,
            grn,
            dueDate,
            paymentTerms,
            taxableAmount,
            gst,
            totalAmount,
            paidAmount,
            remarks

        } = req.body;

        if (
            !billNumber ||
            !supplierInvoiceNo ||
            !billDate ||
            !supplier ||
            !purchaseOrder ||
            !grn
        ) {

            return res.status(400).json({
                success: false,
                message: "Required fields are missing."
            });

        }

        const existingBill =
            await PurchaseBill.findOne({
                billNumber
            });

        if (existingBill) {

            return res.status(400).json({
                success: false,
                message: "Purchase Bill already exists."
            });

        }

        const balanceAmount =
            Number(totalAmount || 0) -
            Number(paidAmount || 0);

        let status = "Pending";

        if (paidAmount > 0 && balanceAmount > 0) {

            status = "Partially Paid";

        }

        if (balanceAmount <= 0) {

            status = "Paid";

        }

        const bill =
            await PurchaseBill.create({

                billNumber,

                supplierInvoiceNo,

                billDate,

                supplier,

                purchaseOrder,

                grn,

                dueDate,

                paymentTerms,

                taxableAmount,

                gst,

                totalAmount,

                paidAmount,

                balanceAmount,

                remarks,

                status

            });

        return res.status(201).json({

            success: true,

            message: "Purchase Bill created successfully.",

            data: bill

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
=================================================
GET PURCHASE BILLS
=================================================
*/

exports.getPurchaseBills = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const filter = {};

        if (search) {

            filter.billNumber = {

                $regex: search,

                $options: "i"

            };

        }

        const totalRecords =
            await PurchaseBill.countDocuments(filter);

        const bills =
            await PurchaseBill.find(filter)

                .populate("supplier", "vendorName")

                .populate("purchaseOrder", "poNumber")

                .populate("grn", "grnNumber")

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

            data: bills

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
=================================================
GET PURCHASE BILL BY ID
=================================================
*/

exports.getPurchaseBillById = async (req, res) => {

    try {

        const bill =
            await PurchaseBill.findById(req.params.id)

                .populate("supplier")

                .populate("purchaseOrder")

                .populate("grn");

        if (!bill) {

            return res.status(404).json({

                success: false,

                message: "Purchase Bill not found."

            });

        }

        return res.status(200).json({

            success: true,

            data: bill

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
=================================================
UPDATE PURCHASE BILL
=================================================
*/

exports.updatePurchaseBill = async (req, res) => {

    try {

        const bill =
            await PurchaseBill.findById(req.params.id);

        if (!bill) {

            return res.status(404).json({

                success: false,

                message: "Purchase Bill not found."

            });

        }

        Object.assign(bill, req.body);

        bill.balanceAmount =
            Number(bill.totalAmount) -
            Number(bill.paidAmount);

        if (bill.balanceAmount <= 0) {

            bill.status = "Paid";

        }

        else if (bill.paidAmount > 0) {

            bill.status = "Partially Paid";

        }

        else {

            bill.status = "Pending";

        }

        await bill.save();

        return res.status(200).json({

            success: true,

            message: "Purchase Bill updated successfully.",

            data: bill

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
=================================================
DELETE PURCHASE BILL
=================================================
*/

exports.deletePurchaseBill = async (req, res) => {

    try {

        const bill =
            await PurchaseBill.findById(req.params.id);

        if (!bill) {

            return res.status(404).json({

                success: false,

                message: "Purchase Bill not found."

            });

        }

        await bill.deleteOne();

        return res.status(200).json({

            success: true,

            message: "Purchase Bill deleted successfully."

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};