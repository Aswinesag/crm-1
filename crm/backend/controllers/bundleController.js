const ProductBundle = require("../models/ProductBundle");
const Product = require("../models/Product");

/*
|--------------------------------------------------------------------------
| Create Bundle
|--------------------------------------------------------------------------
*/

exports.createBundle = async (req, res) => {
    try {

        const {
            bundleName,
            products,
            bundlePrice,
            description,
            status
        } = req.body;

        if (!bundleName) {
            return res.status(400).json({
                success: false,
                message: "Bundle name is required"
            });
        }

        if (!bundlePrice) {
            return res.status(400).json({
                success: false,
                message: "Bundle price is required"
            });
        }

        if (!products || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product is required"
            });
        }

        /*
        ----------------------------------------------------
        Duplicate Bundle Check
        ----------------------------------------------------
        */

        const existingBundle =
            await ProductBundle.findOne({
                bundleName: bundleName.trim()
            });

        if (existingBundle) {
            return res.status(400).json({
                success: false,
                message: "Bundle already exists"
            });
        }

        /*
        ----------------------------------------------------
        Validate Products
        ----------------------------------------------------
        */

        for (const item of products) {

            const productExists =
                await Product.findById(item.product);

            if (!productExists) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found : ${item.product}`
                });
            }
        }

        const bundle =
            await ProductBundle.create({
                bundleName,
                products,
                bundlePrice,
                description,
                status
            });

        const populatedBundle =
            await ProductBundle.findById(bundle._id)
                .populate("products.product");

        return res.status(201).json({
            success: true,
            message: "Bundle created successfully",
            data: populatedBundle
        });

    } catch (error) {

        console.error("Create Bundle Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error creating bundle",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get All Bundles
|--------------------------------------------------------------------------
*/

exports.getBundles = async (req, res) => {
    try {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const skip =
            (page - 1) * limit;

        const filter = {};

        if (req.query.status) {
            filter.status =
                req.query.status;
        }

        const bundles =
            await ProductBundle.find(filter)
                .populate("products.product")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

        const total =
            await ProductBundle.countDocuments(filter);

        return res.status(200).json({
            success: true,
            totalRecords: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: bundles
        });

    } catch (error) {

        console.error("Get Bundles Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching bundles",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Get Bundle By ID
|--------------------------------------------------------------------------
*/

exports.getBundleById = async (req, res) => {
    try {

        const bundle =
            await ProductBundle.findById(
                req.params.id
            ).populate("products.product");

        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: "Bundle not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: bundle
        });

    } catch (error) {

        console.error("Get Bundle Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching bundle",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Bundle
|--------------------------------------------------------------------------
*/

exports.updateBundle = async (req, res) => {
    try {

        const bundleId =
            req.params.id;

        const bundle =
            await ProductBundle.findById(bundleId);

        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: "Bundle not found"
            });
        }

        const {
            bundleName,
            products
        } = req.body;

        /*
        ----------------------------------------------------
        Duplicate Name Validation
        ----------------------------------------------------
        */

        if (bundleName) {

            const duplicate =
                await ProductBundle.findOne({
                    _id: { $ne: bundleId },
                    bundleName: bundleName.trim()
                });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Bundle name already exists"
                });
            }
        }

        /*
        ----------------------------------------------------
        Validate Products
        ----------------------------------------------------
        */

        if (products && products.length > 0) {

            for (const item of products) {

                const productExists =
                    await Product.findById(
                        item.product
                    );

                if (!productExists) {
                    return res.status(404).json({
                        success: false,
                        message:
                            `Product not found : ${item.product}`
                    });
                }
            }
        }

        const updatedBundle =
            await ProductBundle.findByIdAndUpdate(
                bundleId,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            ).populate("products.product");

        return res.status(200).json({
            success: true,
            message: "Bundle updated successfully",
            data: updatedBundle
        });

    } catch (error) {

        console.error("Update Bundle Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating bundle",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Bundle
|--------------------------------------------------------------------------
*/

exports.deleteBundle = async (req, res) => {
    try {

        const bundle =
            await ProductBundle.findById(
                req.params.id
            );

        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: "Bundle not found"
            });
        }

        await ProductBundle.findByIdAndDelete(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Bundle deleted successfully"
        });

    } catch (error) {

        console.error("Delete Bundle Error:", error);

        return res.status(500).json({
            success: false,
            message: "Error deleting bundle",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Search Bundles
|--------------------------------------------------------------------------
*/

exports.searchBundles = async (req, res) => {
    try {

        const keyword =
            req.query.keyword || "";

        const bundles =
            await ProductBundle.find({
                $or: [
                    {
                        bundleName: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        bundleCode: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }
                ]
            })
            .populate("products.product")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bundles.length,
            data: bundles
        });

    } catch (error) {

        console.error("Search Bundle Error:", error);

        return res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};

/*
|--------------------------------------------------------------------------
| Change Bundle Status
|--------------------------------------------------------------------------
*/

exports.changeStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (
            !["Active", "Inactive"]
                .includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const bundle =
            await ProductBundle.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );

        if (!bundle) {
            return res.status(404).json({
                success: false,
                message: "Bundle not found"
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Bundle status updated successfully",
            data: bundle
        });

    } catch (error) {

        console.error(
            "Bundle Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Error updating bundle status",
            error: error.message
        });
    }
};