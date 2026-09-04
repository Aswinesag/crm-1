const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

/*
|--------------------------------------------------------------------------
| Create SubCategory
|--------------------------------------------------------------------------
*/

exports.createSubCategory = async (req, res) => {
    try {

        const {
            category,
            name,
            description,
            status
        } = req.body;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Sub Category name is required"
            });
        }

        // Check Category Exists

        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Duplicate Check Inside Same Category

        const exists = await SubCategory.findOne({
            category,
            name: name.trim()
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Sub Category already exists in this category"
            });
        }

        const subCategory = await SubCategory.create({
            category,
            name,
            description,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Sub Category created successfully",
            data: subCategory
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error creating sub category",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All SubCategories
|--------------------------------------------------------------------------
*/

exports.getSubCategories = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const subCategories = await SubCategory.find(filter)
            .populate("category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SubCategory.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: subCategories
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error fetching sub categories",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get SubCategory By Id
|--------------------------------------------------------------------------
*/

exports.getSubCategoryById = async (req, res) => {
    try {

        const subCategory = await SubCategory.findById(req.params.id)
            .populate("category");

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: subCategory
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error fetching sub category",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update SubCategory
|--------------------------------------------------------------------------
*/

exports.updateSubCategory = async (req, res) => {
    try {

        const { category, name } = req.body;

        const subCategory = await SubCategory.findById(req.params.id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub Category not found"
            });
        }

        // Validate Category

        if (category) {

            const categoryExists = await Category.findById(category);

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }
        }

        // Duplicate Check

        if (name) {

            const duplicate = await SubCategory.findOne({
                _id: { $ne: req.params.id },
                category: category || subCategory.category,
                name: name.trim()
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Sub Category already exists"
                });
            }
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("category");

        return res.status(200).json({
            success: true,
            message: "Sub Category updated successfully",
            data: updatedSubCategory
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error updating sub category",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete SubCategory
|--------------------------------------------------------------------------
*/

exports.deleteSubCategory = async (req, res) => {
    try {

        const subCategory = await SubCategory.findById(req.params.id);

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub Category not found"
            });
        }

        await SubCategory.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Sub Category deleted successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error deleting sub category",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Search SubCategory
|--------------------------------------------------------------------------
*/

exports.searchSubCategories = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const subCategories = await SubCategory.find({
            name: {
                $regex: keyword,
                $options: "i"
            }
        })
            .populate("category")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: subCategories.length,
            data: subCategories
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Change Status
|--------------------------------------------------------------------------
*/

exports.changeStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (!["Active", "Inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const subCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("category");

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: "Sub Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: subCategory
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error updating status",
            error: error.message
        });
    }
};