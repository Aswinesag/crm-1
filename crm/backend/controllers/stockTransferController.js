const mongoose = require("mongoose");

const StockTransfer = require("../models/StockTransfer");
const RawMaterial = require("../models/RawMaterial");
const Warehouse = require("../models/Warehouse");

/*
=====================================================
GENERATE TRANSFER NUMBER
Example:
TRN001
TRN002
TRN003
=====================================================
*/
const generateTransferNumber = async () => {

    const lastTransfer = await StockTransfer
        .findOne()
        .sort({ createdAt: -1 });

    if (!lastTransfer) {
        return "TRN001";
    }

    const lastNumber = parseInt(
        lastTransfer.transferNumber.replace("TRN", "")
    );

    const nextNumber = lastNumber + 1;

    return `TRN${String(nextNumber).padStart(3, "0")}`;

};


/*
=====================================================
CREATE STOCK TRANSFER
POST /api/stock-transfers
=====================================================
*/
const createStockTransfer = async (req, res) => {

    console.log("✅ createStockTransfer WITHOUT TRANSACTION");

    try {

        const {

            date,
            item,
            quantity,
            fromWarehouse,
            toWarehouse,
            remarks

        } = req.body;

        /*
        =====================================================
        VALIDATE REQUIRED FIELDS
        =====================================================
        */

        if (
            !date ||
            !item ||
            !quantity ||
            !fromWarehouse ||
            !toWarehouse
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }

        /*
        =====================================================
        QUANTITY MUST BE GREATER THAN ZERO
        =====================================================
        */

        if (quantity <= 0) {

            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero."
            });

        }

        /*
        =====================================================
        FROM AND TO WAREHOUSE CANNOT BE SAME
        =====================================================
        */

        if (fromWarehouse === toWarehouse) {

            return res.status(400).json({
                success: false,
                message: "From Warehouse and To Warehouse cannot be the same."
            });

        }

        /*
        =====================================================
        CHECK MATERIAL EXISTS
        =====================================================
        */

        const materialExists = await RawMaterial.findById(item);

        if (!materialExists) {

            return res.status(404).json({
                success: false,
                message: "Raw Material not found."
            });

        }

        /*
        =====================================================
        CHECK FROM WAREHOUSE EXISTS
        =====================================================
        */

        const fromWarehouseExists = await Warehouse.findById(
            fromWarehouse
        );

        if (!fromWarehouseExists) {

            return res.status(404).json({
                success: false,
                message: "From Warehouse not found."
            });

        }

        /*
        =====================================================
        CHECK TO WAREHOUSE EXISTS
        =====================================================
        */

        const toWarehouseExists = await Warehouse.findById(
            toWarehouse
        );

        if (!toWarehouseExists) {

            return res.status(404).json({
                success: false,
                message: "To Warehouse not found."
            });

        }

        /*
        =====================================================
        FIND SOURCE MATERIAL
        =====================================================
        */

        const sourceMaterial = await RawMaterial.findOne({

            materialCode: materialExists.materialCode,

            warehouse: fromWarehouse

        });

        if (!sourceMaterial) {

            return res.status(404).json({
                success: false,
                message: "Material not found in From Warehouse."
            });

        }

        /*
        =====================================================
        CHECK AVAILABLE STOCK
        =====================================================
        */

        if (sourceMaterial.currentStock < quantity) {

            return res.status(400).json({
                success: false,
                message: `Only ${sourceMaterial.currentStock} items available in stock.`
            });

        }

        /*
        =====================================================
        FIND DESTINATION MATERIAL
        =====================================================
        */

        let destinationMaterial = await RawMaterial.findOne({

            materialCode: materialExists.materialCode,

            warehouse: toWarehouse

        });

        /*
        =====================================================
        GENERATE TRANSFER NUMBER
        =====================================================
        */

        const transferNumber = await generateTransferNumber();

        /*
        =====================================================
        DEDUCT STOCK FROM SOURCE WAREHOUSE
        =====================================================
        */

        sourceMaterial.currentStock -= Number(quantity);

        await sourceMaterial.save();

        /*
        =====================================================
        ADD STOCK TO DESTINATION WAREHOUSE
        =====================================================
        */

        if (destinationMaterial) {

            destinationMaterial.currentStock += Number(quantity);

            await destinationMaterial.save();

        } else {

            destinationMaterial = new RawMaterial({

                materialCode: sourceMaterial.materialCode,

                materialName: sourceMaterial.materialName,

                category: sourceMaterial.category,

                unit: sourceMaterial.unit,

                supplier: sourceMaterial.supplier,

                warehouse: toWarehouse,

                costPrice: sourceMaterial.costPrice,

                minimumStock: sourceMaterial.minimumStock,

                reorderLevel: sourceMaterial.reorderLevel,

                currentStock: Number(quantity),

                status: sourceMaterial.status

            });

            await destinationMaterial.save();

        }

        /*
        =====================================================
        CREATE STOCK TRANSFER
        =====================================================
        */

        const stockTransfer = await StockTransfer.create({

            transferNumber,

            date,

            item: sourceMaterial._id,

            quantity,

            fromWarehouse,

            toWarehouse,

            sourceMaterial: sourceMaterial._id,

            destinationMaterial: destinationMaterial._id,

            remarks: remarks || ""

        });

        /*
        =====================================================
        RETURN CREATED TRANSFER
        =====================================================
        */

        const createdTransfer = await StockTransfer.findById(
            stockTransfer._id
        )

            .populate(
                "item",
                "materialCode materialName"
            )

            .populate(
                "fromWarehouse",
                "warehouseCode warehouseName"
            )

            .populate(
                "toWarehouse",
                "warehouseCode warehouseName"
            )

            .populate(
                "sourceMaterial",
                "materialCode materialName"
            )

            .populate(
                "destinationMaterial",
                "materialCode materialName"
            );

        return res.status(201).json({

            success: true,

            message: "Stock transferred successfully.",

            data: createdTransfer

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=====================================================
GET ALL STOCK TRANSFERS

GET /api/stock-transfers

?page=1
&limit=10
&search=TRN001

=====================================================
*/

const getStockTransfers = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const filter = {};

        /*
        =============================================
        SEARCH BY TRANSFER NUMBER
        =============================================
        */

        if (search) {

            filter.transferNumber = {
                $regex: search,
                $options: "i"
            };

        }

        /*
        =============================================
        TOTAL RECORDS
        =============================================
        */

        const totalRecords =
            await StockTransfer.countDocuments(filter);

        /*
        =============================================
        GET STOCK TRANSFERS
        =============================================
        */

        const stockTransfers =
            await StockTransfer.find(filter)

                .populate(
                    "item",
                    "materialCode materialName"
                )

                .populate(
                    "fromWarehouse",
                    "warehouseCode warehouseName"
                )

                .populate(
                    "toWarehouse",
                    "warehouseCode warehouseName"
                )

                .populate(
                    "sourceMaterial",
                    "materialCode materialName currentStock"
                )

                .populate(
                    "destinationMaterial",
                    "materialCode materialName currentStock"
                )

                .sort({
                    createdAt: -1
                })

                .skip(skip)

                .limit(limit);

        /*
        =============================================
        RETURN RESPONSE
        =============================================
        */

        return res.status(200).json({

            success: true,

            page,

            limit,

            totalRecords,

            totalPages:
                Math.ceil(totalRecords / limit),

            count:
                stockTransfers.length,

            data:
                stockTransfers

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
=====================================================
GET STOCK TRANSFER BY ID

GET /api/stock-transfers/:id

=====================================================
*/

const getStockTransferById = async (req, res) => {

    try {

        const { id } = req.params;

        /*
        =============================================
        FIND STOCK TRANSFER
        =============================================
        */

        const stockTransfer =
            await StockTransfer.findById(id)

                .populate(
                    "item",
                    "materialCode materialName"
                )

                .populate(
                    "fromWarehouse",
                    "warehouseCode warehouseName"
                )

                .populate(
                    "toWarehouse",
                    "warehouseCode warehouseName"
                )

                .populate(
                    "sourceMaterial",
                    "materialCode materialName currentStock"
                )

                .populate(
                    "destinationMaterial",
                    "materialCode materialName currentStock"
                );

        /*
        =============================================
        CHECK EXISTS
        =============================================
        */

        if (!stockTransfer) {

            return res.status(404).json({

                success: false,

                message: "Stock Transfer not found."

            });

        }

        /*
        =============================================
        RETURN RESPONSE
        =============================================
        */

        return res.status(200).json({

            success: true,

            data: stockTransfer

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
=====================================================
DELETE STOCK TRANSFER

RESTORE STOCK

DELETE /api/stock-transfers/:id
=====================================================
*/

const deleteStockTransfer = async (req, res) => {

    try {

        /*
        =============================================
        FIND STOCK TRANSFER
        =============================================
        */

        const transfer = await StockTransfer.findById(
            req.params.id
        );

        if (!transfer) {

            return res.status(404).json({

                success: false,

                message: "Stock Transfer not found."

            });

        }

        /*
        =============================================
        FIND SOURCE MATERIAL
        =============================================
        */

        const sourceMaterial =
            await RawMaterial.findById(
                transfer.sourceMaterial
            );

        /*
        =============================================
        FIND DESTINATION MATERIAL
        =============================================
        */

        const destinationMaterial =
            await RawMaterial.findById(
                transfer.destinationMaterial
            );

        if (!sourceMaterial || !destinationMaterial) {

            return res.status(404).json({

                success: false,

                message: "Material record not found."

            });

        }

        /*
        =============================================
        RESTORE SOURCE STOCK
        =============================================
        */

        sourceMaterial.currentStock +=
            Number(transfer.quantity);

        await sourceMaterial.save();

        /*
        =============================================
        REMOVE STOCK FROM DESTINATION
        =============================================
        */

        if (destinationMaterial.currentStock < transfer.quantity) {

            return res.status(400).json({

                success: false,

                message:
                    "Destination warehouse stock is less than transferred quantity."

            });

        }

        destinationMaterial.currentStock -=
            Number(transfer.quantity);

        await destinationMaterial.save();

        /*
        =============================================
        DELETE STOCK TRANSFER
        =============================================
        */

        await StockTransfer.findByIdAndDelete(
            transfer._id
        );

        /*
        =============================================
        RETURN RESPONSE
        =============================================
        */

        return res.status(200).json({

            success: true,

            message:
                "Stock Transfer deleted successfully."

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
=====================================================
EXPORT CONTROLLER
=====================================================
*/

module.exports = {

    createStockTransfer,

    getStockTransfers,

    getStockTransferById,

    deleteStockTransfer

};
