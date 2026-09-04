const HsnCode = require("../models/HsnCode");

/*
|--------------------------------------------------------------------------
| Create HSN Code
|--------------------------------------------------------------------------
*/

exports.createHSN = async (req, res) => {
    try {

        const {
            hsnCode,
            description,
            gstPercentage
        } = req.body;

        if (!hsnCode) {
            return res.status(400).json({
                success: false,
                message: "HSN Code is required"
            });
        }

        const existingHSN = await HsnCode.findOne({
            hsnCode: hsnCode.trim()
        });

        if (existingHSN) {
            return res.status(400).json({
                success: false,
                message: "HSN Code already exists"
            });
        }

        const hsn = await HsnCode.create({
            hsnCode: hsnCode.trim(),
            description,
            gstPercentage
        });

        return res.status(201).json({
            success: true,
            message: "HSN Code created successfully",
            data: hsn
        });

    } catch (error) {

        console.error("Create HSN Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error creating HSN Code",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All HSN Codes
|--------------------------------------------------------------------------
*/

exports.getHSNCodes = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.gstPercentage) {
            filter.gstPercentage = Number(req.query.gstPercentage);
        }

        const hsnCodes = await HsnCode.find(filter)
            .sort({ hsnCode: 1 })
            .skip(skip)
            .limit(limit);

        const total = await HsnCode.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: hsnCodes
        });

    } catch (error) {

        console.error("Get HSN Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching HSN Codes",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get HSN By ID
|--------------------------------------------------------------------------
*/

exports.getHSNById = async (req, res) => {
    try {

        const hsn = await HsnCode.findById(req.params.id);

        if (!hsn) {
            return res.status(404).json({
                success: false,
                message: "HSN Code not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: hsn
        });

    } catch (error) {

        console.error("Get HSN By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching HSN Code",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update HSN Code
|--------------------------------------------------------------------------
*/

exports.updateHSN = async (req, res) => {
    try {

        const hsnId = req.params.id;

        const {
            hsnCode
        } = req.body;

        const hsn = await HsnCode.findById(hsnId);

        if (!hsn) {
            return res.status(404).json({
                success: false,
                message: "HSN Code not found"
            });
        }

        if (hsnCode) {

            const duplicate = await HsnCode.findOne({
                _id: { $ne: hsnId },
                hsnCode: hsnCode.trim()
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "HSN Code already exists"
                });
            }
        }

        const updatedHSN = await HsnCode.findByIdAndUpdate(
            hsnId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "HSN Code updated successfully",
            data: updatedHSN
        });

    } catch (error) {

        console.error("Update HSN Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating HSN Code",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete HSN Code
|--------------------------------------------------------------------------
*/

exports.deleteHSN = async (req, res) => {
    try {

        const hsn = await HsnCode.findById(req.params.id);

        if (!hsn) {
            return res.status(404).json({
                success: false,
                message: "HSN Code not found"
            });
        }

        await HsnCode.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "HSN Code deleted successfully"
        });

    } catch (error) {

        console.error("Delete HSN Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error deleting HSN Code",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Search HSN Codes
|--------------------------------------------------------------------------
*/

exports.searchHSN = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const hsnCodes = await HsnCode.find({
            $or: [
                {
                    hsnCode: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ]
        }).sort({ hsnCode: 1 });

        return res.status(200).json({
            success: true,
            count: hsnCodes.length,
            data: hsnCodes
        });

    } catch (error) {

        console.error("Search HSN Error:", error);

        return res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};