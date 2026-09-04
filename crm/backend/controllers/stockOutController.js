const mongoose = require("mongoose");

const StockOut = require("../models/StockOut");
const RawMaterial = require("../models/RawMaterial");
const Warehouse = require("../models/Warehouse");

/*
=====================================================
GENERATE STOCK OUT NUMBER
Example:
STO0001
STO0002
STO0003
=====================================================
*/

const generateStockOutNumber = async () => {

    const lastStockOut = await StockOut
        .findOne()
        .sort({ createdAt: -1 });

    if (!lastStockOut) {
        return "STO0001";
    }

    const lastNumber = parseInt(
        lastStockOut.stockOutNumber.replace("STO", "")
    );

    const nextNumber = lastNumber + 1;

    return `STO${String(nextNumber).padStart(4, "0")}`;
};

/*
=====================================================
CREATE STOCK OUT
=====================================================
*/

const createStockOut = async (req, res) => {

    try {

        /*
        =============================================
        GET DATA FROM REQUEST BODY
        =============================================
        */

        const {
            date,
            material,
            quantity,
            department,
            purpose,
            warehouse,
            remarks
        } = req.body;

        /*
        =============================================
        VALIDATE REQUIRED FIELDS
        =============================================
        */

        if (
            !material ||
            !quantity ||
            !department ||
            !purpose ||
            !warehouse
        ) {

            return res.status(400).json({

                success: false,

                message: "Please fill all required fields."

            });

        }

        /*
        =============================================
        CHECK MATERIAL EXISTS
        =============================================
        */

        const materialExists = await RawMaterial.findById(material);

        if (!materialExists) {

            return res.status(404).json({

                success: false,

                message: "Material not found."

            });

        }

        /*
        =============================================
        CHECK WAREHOUSE EXISTS
        =============================================
        */

        const warehouseExists = await Warehouse.findById(warehouse);

        if (!warehouseExists) {

            return res.status(404).json({

                success: false,

                message: "Warehouse not found."

            });

        }

        if (materialExists.warehouse.toString() !== warehouse) {

            return res.status(400).json({

                success: false,

                message: "This material does not belong to the selected warehouse."

            });

        }

        /*
        =============================================
        CHECK AVAILABLE STOCK
        =============================================
        */

        if (materialExists.currentStock < Number(quantity)) {

            return res.status(400).json({

                success: false,

                message: "Insufficient stock available."

            });

        }

        /*
        =============================================
        GENERATE STOCK OUT NUMBER
        =============================================
        */

        const stockOutNumber = await generateStockOutNumber();

        /*
        =============================================
        CREATE STOCK OUT ENTRY
        =============================================
        */

        const stockOut = await StockOut.create({

            stockOutNumber,

            date,

            material,

            quantity,

            department,

            purpose,

            warehouse,

            remarks,

            createdBy: req.user?._id

        });

        /*
        =============================================
        REDUCE MATERIAL STOCK
        =============================================
        */

        materialExists.currentStock -= Number(quantity);

        await materialExists.save();

        /*
        =============================================
        SUCCESS RESPONSE
        =============================================
        */

        return res.status(201).json({

            success: true,

            message: "Stock Out created successfully.",

            data: stockOut

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=====================================================
GET ALL STOCK OUTS
=====================================================
*/

const getStockOuts = async (req, res) => {

    try {

        /*
        =============================================
        PAGINATION
        =============================================
        */

        const page =
            parseInt(req.query.page) || 1;

        const limit =
            parseInt(req.query.limit) || 10;

        const skip =
            (page - 1) * limit;

        /*
        =============================================
        SEARCH
        =============================================
        */

        const search =
            req.query.search || "";

        /*
        =============================================
        BUILD SEARCH FILTER
        =============================================
        */

        let filter = {};

        if (search) {

            filter = {

                $or: [

                    {
                        stockOutNumber: {
                            $regex: search,
                            $options: "i"
                        }
                    },

                    {
                        department: {
                            $regex: search,
                            $options: "i"
                        }
                    },

                    {
                        purpose: {
                            $regex: search,
                            $options: "i"
                        }
                    }

                ]

            };

        }

        /*
        =============================================
        GET STOCK OUT DATA
        =============================================
        */

        const stockOuts = await StockOut

            .find(filter)

            .populate(

                "material",

                "materialCode materialName unit currentStock"

            )

            .populate(

                "warehouse",

                "warehouseCode warehouseName"

            )

            .populate(

                "createdBy",

                "name email"

            )

            .sort({

                createdAt: -1

            })

            .skip(skip)

            .limit(limit);

        /*
        =============================================
        TOTAL RECORDS
        =============================================
        */

        const totalRecords =

            await StockOut.countDocuments(filter);

        /*
        =============================================
        RETURN RESPONSE
        =============================================
        */

        return res.status(200).json({

            success: true,

            count: stockOuts.length,

            totalRecords,

            currentPage: page,

            totalPages: Math.ceil(totalRecords / limit),

            data: stockOuts

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=====================================================
GET STOCK OUT BY ID
=====================================================
*/

const getStockOutById = async (req, res) => {

    try {

        const stockOut = await StockOut.findById(req.params.id)

            .populate(
                "material",
                "materialCode materialName unit currentStock"
            )

            .populate(
                "warehouse",
                "warehouseCode warehouseName"
            )

            .populate(
                "createdBy",
                "name email"
            );

        if (!stockOut) {

            return res.status(404).json({

                success: false,

                message: "Stock Out not found."

            });

        }

        return res.status(200).json({

            success: true,

            data: stockOut

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=====================================================
UPDATE STOCK OUT
=====================================================
*/

const updateStockOut = async (req, res) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const stockOut = await StockOut.findById(req.params.id)
            .session(session);

        if (!stockOut) {

            await session.abortTransaction();

            session.endSession();

            return res.status(404).json({

                success: false,

                message: "Stock Out not found."

            });

        }

        /*
        ===========================================
        RESTORE PREVIOUS STOCK
        ===========================================
        */

        const oldMaterial = await RawMaterial.findById(stockOut.material)
            .session(session);

        oldMaterial.currentStock += stockOut.quantity;

        await oldMaterial.save({ session });

        /*
        ===========================================
        NEW MATERIAL
        ===========================================
        */

        const material = await RawMaterial.findById(req.body.material)
            .session(session);

        if (!material) {

            await session.abortTransaction();

            session.endSession();

            return res.status(404).json({

                success: false,

                message: "Material not found."

            });

        }

        /*
        ===========================================
        CHECK STOCK
        ===========================================
        */

        if (material.currentStock < req.body.quantity) {

            await session.abortTransaction();

            session.endSession();

            return res.status(400).json({

                success: false,

                message: "Insufficient stock."

            });

        }

        /*
        ===========================================
        DEDUCT NEW STOCK
        ===========================================
        */

        material.currentStock -= Number(req.body.quantity);

        await material.save({ session });

        /*
        ===========================================
        UPDATE STOCK OUT
        ===========================================
        */

        stockOut.date = req.body.date;

        stockOut.material = req.body.material;

        stockOut.quantity = req.body.quantity;

        stockOut.department = req.body.department;

        stockOut.purpose = req.body.purpose;

        stockOut.warehouse = req.body.warehouse;

        stockOut.remarks = req.body.remarks;

        await stockOut.save({ session });

        await session.commitTransaction();

        session.endSession();

        return res.status(200).json({

            success: true,

            message: "Stock Out updated successfully.",

            data: stockOut

        });

    }

    catch (error) {

        await session.abortTransaction();

        session.endSession();

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=====================================================
DELETE STOCK OUT
=====================================================
*/

const deleteStockOut = async (req, res) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    try {

        const stockOut = await StockOut.findById(req.params.id)
            .session(session);

        if (!stockOut) {

            await session.abortTransaction();

            session.endSession();

            return res.status(404).json({

                success: false,

                message: "Stock Out not found."

            });

        }

        /*
        ===========================================
        RESTORE STOCK
        ===========================================
        */

        const material = await RawMaterial.findById(stockOut.material)
            .session(session);

        if (material) {

            material.currentStock += stockOut.quantity;

            await material.save({ session });

        }

        /*
        ===========================================
        DELETE ENTRY
        ===========================================
        */

        await StockOut.findByIdAndDelete(
            req.params.id,
            { session }
        );

        await session.commitTransaction();

        session.endSession();

        return res.status(200).json({

            success: true,

            message: "Stock Out deleted successfully."

        });

    }

    catch (error) {

        await session.abortTransaction();

        session.endSession();

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
module.exports = {

    createStockOut,

    getStockOuts,

    getStockOutById,

    updateStockOut,

    deleteStockOut

};