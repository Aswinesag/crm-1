const TaxSetting = require("../models/TaxSetting");

/*
|--------------------------------------------------------------------------
| Create Tax
|--------------------------------------------------------------------------
*/

exports.createTax = async (req, res) => {
    try {

        const {
            taxName,
            percentage,
            status
        } = req.body;

        if (!taxName) {
            return res.status(400).json({
                success: false,
                message: "Tax name is required"
            });
        }

        const existingTax = await TaxSetting.findOne({
            taxName: taxName.trim()
        });

        if (existingTax) {
            return res.status(400).json({
                success: false,
                message: "Tax already exists"
            });
        }

        const tax = await TaxSetting.create({
            taxName: taxName.trim(),
            percentage,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Tax created successfully",
            data: tax
        });

    } catch (error) {

        console.error("Create Tax Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error creating tax",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All Taxes
|--------------------------------------------------------------------------
*/

exports.getTaxes = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const taxes = await TaxSetting.find(filter)
            .sort({ taxName: 1 })
            .skip(skip)
            .limit(limit);

        const total = await TaxSetting.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: taxes
        });

    } catch (error) {

        console.error("Get Taxes Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching taxes",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Tax By ID
|--------------------------------------------------------------------------
*/

exports.getTaxById = async (req, res) => {
    try {

        const tax = await TaxSetting.findById(req.params.id);

        if (!tax) {
            return res.status(404).json({
                success: false,
                message: "Tax not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: tax
        });

    } catch (error) {

        console.error("Get Tax Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching tax",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Tax
|--------------------------------------------------------------------------
*/

exports.updateTax = async (req, res) => {
    try {

        const taxId = req.params.id;

        const {
            taxName
        } = req.body;

        const tax = await TaxSetting.findById(taxId);

        if (!tax) {
            return res.status(404).json({
                success: false,
                message: "Tax not found"
            });
        }

        if (taxName) {

            const duplicate = await TaxSetting.findOne({
                _id: { $ne: taxId },
                taxName: taxName.trim()
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Tax name already exists"
                });
            }
        }

        const updatedTax = await TaxSetting.findByIdAndUpdate(
            taxId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Tax updated successfully",
            data: updatedTax
        });

    } catch (error) {

        console.error("Update Tax Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating tax",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Tax
|--------------------------------------------------------------------------
*/

exports.deleteTax = async (req, res) => {
    try {

        const tax = await TaxSetting.findById(req.params.id);

        if (!tax) {
            return res.status(404).json({
                success: false,
                message: "Tax not found"
            });
        }

        await TaxSetting.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Tax deleted successfully"
        });

    } catch (error) {

        console.error("Delete Tax Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error deleting tax",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Search Taxes
|--------------------------------------------------------------------------
*/

exports.searchTaxes = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const taxes = await TaxSetting.find({
            taxName: {
                $regex: keyword,
                $options: "i"
            }
        }).sort({ taxName: 1 });

        return res.status(200).json({
            success: true,
            count: taxes.length,
            data: taxes
        });

    } catch (error) {

        console.error("Search Tax Error:", error);

        return res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Change Tax Status
|--------------------------------------------------------------------------
*/

exports.changeStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (!["Active", "Inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const tax = await TaxSetting.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true
            }
        );

        if (!tax) {
            return res.status(404).json({
                success: false,
                message: "Tax not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tax status updated successfully",
            data: tax
        });

    } catch (error) {

        console.error("Change Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating tax status",
            error: error.message
        });
    }
};