const Unit = require("../models/Unit");

/*
|--------------------------------------------------------------------------
| Create Unit
|--------------------------------------------------------------------------
*/

exports.createUnit = async (req, res) => {
    try {

        const {
            name,
            shortName,
            status
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Unit name is required"
            });
        }

        const existingUnit = await Unit.findOne({
            name: name.trim()
        });

        if (existingUnit) {
            return res.status(400).json({
                success: false,
                message: "Unit already exists"
            });
        }

        const unit = await Unit.create({
            name: name.trim(),
            shortName,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Unit created successfully",
            data: unit
        });

    } catch (error) {

        console.error("Create Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error creating unit",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All Units
|--------------------------------------------------------------------------
*/

exports.getUnits = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const units = await Unit.find(filter)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Unit.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: units
        });

    } catch (error) {

        console.error("Get Units Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching units",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Unit By ID
|--------------------------------------------------------------------------
*/

exports.getUnitById = async (req, res) => {
    try {

        const unit = await Unit.findById(req.params.id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: unit
        });

    } catch (error) {

        console.error("Get Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching unit",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Unit
|--------------------------------------------------------------------------
*/

exports.updateUnit = async (req, res) => {
    try {

        const unitId = req.params.id;

        const {
            name
        } = req.body;

        const unit = await Unit.findById(unitId);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        if (name) {

            const duplicate = await Unit.findOne({
                _id: { $ne: unitId },
                name: name.trim()
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Unit already exists"
                });
            }
        }

        const updatedUnit = await Unit.findByIdAndUpdate(
            unitId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Unit updated successfully",
            data: updatedUnit
        });

    } catch (error) {

        console.error("Update Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating unit",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Unit
|--------------------------------------------------------------------------
*/

exports.deleteUnit = async (req, res) => {
    try {

        const unit = await Unit.findById(req.params.id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        await Unit.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Unit deleted successfully"
        });

    } catch (error) {

        console.error("Delete Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error deleting unit",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Search Units
|--------------------------------------------------------------------------
*/

exports.searchUnits = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const units = await Unit.find({
            $or: [
                {
                    name: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    shortName: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ]
        }).sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: units.length,
            data: units
        });

    } catch (error) {

        console.error("Search Unit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Change Unit Status
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

        const unit = await Unit.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true
            }
        );

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: unit
        });

    } catch (error) {

        console.error("Status Update Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating status",
            error: error.message
        });
    }
};