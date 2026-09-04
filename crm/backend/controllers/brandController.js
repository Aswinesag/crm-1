const Brand = require("../models/Brand");

/*
=========================================
CREATE BRAND
POST /api/brands
=========================================
*/
exports.createBrand = async (req, res) => {
    try {

        const {
            name,
            description,
            status
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Brand name is required"
            });
        }

        const existingBrand = await Brand.findOne({
            name: {
                $regex: new RegExp(`^${name.trim()}$`, "i")
            }
        });

        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: "Brand already exists"
            });
        }

        const brand = await Brand.create({
            name: name.trim(),
            description: description || "",
            status: status || "Active"
        });

        return res.status(201).json({
            success: true,
            message: "Brand created successfully",
            data: brand
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
GET ALL BRANDS
GET /api/brands
?page=1
&limit=10
&search=ksb
=========================================
*/
exports.getBrands = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const filter = {};

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        const totalRecords =
            await Brand.countDocuments(filter);

        const brands =
            await Brand.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            data: brands
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
GET BRAND BY ID
GET /api/brands/:id
=========================================
*/
exports.getBrandById = async (req, res) => {
    try {

        const brand =
            await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: brand
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
UPDATE BRAND
PUT /api/brands/:id
=========================================
*/
exports.updateBrand = async (req, res) => {
    try {

        const {
            name,
            description,
            status
        } = req.body;

        const brand =
            await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        if (name) {

            const existingBrand =
                await Brand.findOne({
                    name: {
                        $regex: new RegExp(
                            `^${name.trim()}$`,
                            "i"
                        )
                    },
                    _id: {
                        $ne: req.params.id
                    }
                });

            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: "Brand already exists"
                });
            }

            brand.name = name.trim();
        }

        if (description !== undefined) {
            brand.description = description;
        }

        if (status) {
            brand.status = status;
        }

        await brand.save();

        return res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            data: brand
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
SOFT DELETE BRAND
PATCH /api/brands/:id/deactivate
=========================================
*/
exports.deactivateBrand = async (req, res) => {
    try {

        const brand =
            await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        brand.status = "Inactive";

        await brand.save();

        return res.status(200).json({
            success: true,
            message: "Brand deactivated successfully"
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
ACTIVATE BRAND
PATCH /api/brands/:id/activate
=========================================
*/
exports.activateBrand = async (req, res) => {
    try {

        const brand =
            await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        brand.status = "Active";

        await brand.save();

        return res.status(200).json({
            success: true,
            message: "Brand activated successfully"
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
HARD DELETE BRAND
DELETE /api/brands/:id
Use Carefully
=========================================
*/
exports.deleteBrand = async (req, res) => {
    try {

        const brand =
            await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        await brand.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Brand deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};