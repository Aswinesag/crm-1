const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Brand = require("../models/Brand");
const Unit = require("../models/Unit");
const HsnCode = require("../models/HsnCode");

/*
|--------------------------------------------------------------------------
| Generate Product Code
|--------------------------------------------------------------------------
*/

const generateProductCode = async () => {

    const latestProduct = await Product.findOne({
        productCode: { $regex: /^PRD\d+$/ }
    })
    .sort({ createdAt: -1 });

    if (!latestProduct) {
        return "PRD00001";
    }

    const lastNumber = Number(
        latestProduct.productCode.substring(3)
    );

    const nextNumber = lastNumber + 1;

    return `PRD${String(nextNumber).padStart(5, "0")}`;
};

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

exports.createProduct = async (req, res) => {
    try {

        const {
            productName,
            productType,
            category,
            subCategory,
            brand,
            unit,
            variants,
            costPrice,
            sellingPrice,
            mrp,
            discount,
            gst,
            hsnCode,
            openingStock,
            reorderLevel,
            maximumStock,
            warehouse,
            status
        } = req.body;

        const safeSubCategory =
            subCategory && subCategory.trim() !== ""
                ? subCategory
                : null;

        const safeHsnCode =
            hsnCode && hsnCode.trim() !== ""
                ? hsnCode
                : null;

        /*
        |--------------------------------------------------------------------------
        | Required Validation
        |--------------------------------------------------------------------------
        */

        if (!productName) {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        if (!productType) {
            return res.status(400).json({
                success: false,
                message: "Product type is required"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Duplicate Product Check
        |--------------------------------------------------------------------------
        */

        const existingProduct = await Product.findOne({
            productName: productName.trim()
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product already exists"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Product Code
        |--------------------------------------------------------------------------
        */

        const productCode = await generateProductCode();

        /*
        |--------------------------------------------------------------------------
        | Create Product
        |--------------------------------------------------------------------------
        */console.log("Generated Product Code:", productCode);
          console.log("Request Body:", req.body);

        const product = await Product.create({
            productCode,
            productName,
            productType,
            category,
            subCategory: safeSubCategory,
            brand,
            unit,
            variants,
            costPrice,
            sellingPrice,
            mrp,
            discount,
            gst,
            hsnCode: safeHsnCode,
            openingStock,
            reorderLevel,
            maximumStock,
            warehouse,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error creating product",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All Products
|--------------------------------------------------------------------------
*/

exports.getProducts = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.productType) {
            filter.productType = req.query.productType;
        }

        if (req.query.category) {
            filter.category = req.query.category;
        }

        const products = await Product.find(filter)
            .populate("category")
            .populate("subCategory")
            .populate("brand")
            .populate("unit")
            .populate("hsnCode")
            .populate("warehouse")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages:
                totalProducts === 0
                    ? 1
                    : Math.ceil(totalProducts / limit),
            data: products
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Product By ID
|--------------------------------------------------------------------------
*/

exports.getProductById = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)
            .populate("category")
            .populate("subCategory")
            .populate("brand")
            .populate("unit")
            .populate("hsnCode")
            .populate("warehouse");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

exports.updateProduct = async (req, res) => {
    try {

        const productId = req.params.id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("category")
            .populate("subCategory")
            .populate("brand")
            .populate("unit")
            .populate("hsnCode")
            .populate("warehouse");

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Product
|--------------------------------------------------------------------------
*/

exports.deleteProduct = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Search Products
|--------------------------------------------------------------------------
*/

exports.searchProducts = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        const products = await Product.find({
            $or: [
                {
                    productName: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    productCode: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ]
        })
            .populate("category")
            .populate("subCategory")
            .populate("brand")
            .populate("unit")
            .populate("hsnCode")
            .populate("warehouse");

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
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
| Change Product Status
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

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: product
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