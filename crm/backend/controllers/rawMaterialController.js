const RawMaterial = require("../models/RawMaterial");

/*
====================================================
HELPER FUNCTION
AUTO GENERATE MATERIAL CODE
RM001
RM002
RM003
====================================================
*/
const generateMaterialCode = async () => {
    const lastMaterial = await RawMaterial.findOne()
        .sort({ createdAt: -1 })
        .select("materialCode");

    if (!lastMaterial) {
        return "RM001";
    }

    const lastNumber = parseInt(
        lastMaterial.materialCode.replace("RM", ""),
        10
    );

    const nextNumber = lastNumber + 1;

    return `RM${String(nextNumber).padStart(3, "0")}`;
};

/*
====================================================
CREATE RAW MATERIAL

POST /api/raw-materials
====================================================
*/
exports.createRawMaterial = async (req, res) => {

    try {

        const {
            materialName,
            category,
            unit,
            supplier,
            warehouse,
            costPrice,
            minimumStock,
            reorderLevel,
            status
        } = req.body;

        /*
        ============================================
        VALIDATION
        ============================================
        */

        if (!materialName || !materialName.trim()) {

            return res.status(400).json({
                success: false,
                message: "Material Name is required"
            });

        }

        if (!category) {

            return res.status(400).json({
                success: false,
                message: "Category is required"
            });

        }

        if (!unit) {

            return res.status(400).json({
                success: false,
                message: "Unit is required"
            });

        }

        if (!warehouse) {

            return res.status(400).json({
                success: false,
                message: "Warehouse is required"
            });

        }

        if (
            costPrice === undefined ||
            costPrice === null ||
            costPrice === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Cost Price is required"
            });

        }

        /*
        ============================================
        CHECK DUPLICATE MATERIAL NAME
        ============================================
        */

        const existingMaterial =
            await RawMaterial.findOne({

                materialName: {
                    $regex: new RegExp(
                        `^${materialName.trim()}$`,
                        "i"
                    )
                },
                warehouse

            });
     

        if (existingMaterial) {

            return res.status(400).json({
                success: false,
                message: "Raw Material already exists"
            });

        }

        /*
====================================================
CHECK IF MATERIAL EXISTS IN ANOTHER WAREHOUSE
====================================================
*/

const existingMaterialCode = await RawMaterial.findOne({

    materialName: {
        $regex: new RegExp(
            `^${materialName.trim()}$`,
            "i"
        )
    }

}).select("materialCode");

        /*
        ============================================
        AUTO GENERATE MATERIAL CODE
        ============================================
        */

      let materialCode;

if (existingMaterialCode) {

    materialCode =
        existingMaterialCode.materialCode;

} else {

    materialCode =
        await generateMaterialCode();

}

        /*
        ============================================
        CREATE MATERIAL
        ============================================
        */

        const rawMaterial =
            await RawMaterial.create({

                materialCode,

                materialName: materialName.trim(),

                category,

                unit,

                supplier: supplier || null,

                warehouse,

                costPrice: Number(costPrice),

                minimumStock:
                    minimumStock || 0,

                reorderLevel:
                    reorderLevel || 0,

                currentStock: 0,

                status:
                    status || "Active"

            });

        /*
        ============================================
        RETURN CREATED DATA
        ============================================
        */

        const createdMaterial =
            await RawMaterial.findById(
                rawMaterial._id
            )

                .populate("category", "name")
                .populate("unit", "name")
                .populate("supplier", "name")
                .populate("warehouse", "name");

        return res.status(201).json({

            success: true,

            message:
                "Raw Material created successfully",

            data: createdMaterial

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
====================================================
GET ALL RAW MATERIALS

GET /api/raw-materials
?page=1
&limit=10
&search=copper
====================================================
*/
exports.getRawMaterials = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const filter = {};

        if (search) {

            filter.$or = [

                {
                    materialName: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    materialCode: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }

        const totalRecords =
            await RawMaterial.countDocuments(filter);

        const rawMaterials =
            await RawMaterial.find(filter)

                .populate("category", "name")

                .populate("unit", "name")

                .populate("supplier", "name")

                .populate("warehouse", "name")

                .sort({
                    createdAt: -1
                })

                .skip(skip)

                .limit(limit);
        
        console.log(
            JSON.stringify(rawMaterials, null, 2)
        );

        return res.status(200).json({

            success: true,

            page,

            limit,

            totalRecords,

            totalPages:
                Math.ceil(totalRecords / limit),

            data: rawMaterials

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
====================================================
GET RAW MATERIAL BY ID

GET /api/raw-materials/:id
====================================================
*/
exports.getRawMaterialById = async (req, res) => {

    try {

        const rawMaterial =
            await RawMaterial.findById(req.params.id)

                .populate("category", "name")

                .populate("unit", "name")

                .populate("supplier", "name")

                .populate("warehouse", "name");

        if (!rawMaterial) {

            return res.status(404).json({

                success: false,

                message: "Raw Material not found"

            });

        }

        return res.status(200).json({

            success: true,

            data: rawMaterial

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
====================================================
UPDATE RAW MATERIAL

PUT /api/raw-materials/:id
====================================================
*/
exports.updateRawMaterial = async (req, res) => {

    try {

        const {

            materialName,

            category,

            unit,

            supplier,

            warehouse,

            costPrice,

            minimumStock,

            reorderLevel,

            status

        } = req.body;

        const rawMaterial =
            await RawMaterial.findById(req.params.id);

        if (!rawMaterial) {

            return res.status(404).json({

                success: false,

                message: "Raw Material not found"

            });

        }

        /*
        ============================================
        CHECK DUPLICATE MATERIAL NAME
        ============================================
        */

        if (materialName) {

            const existingMaterial =
                await RawMaterial.findOne({

                    materialName: {

                        $regex: new RegExp(
                            `^${materialName.trim()}$`,
                            "i"
                        )

                    },

                    warehouse: warehouse || rawMaterial.warehouse,

                    _id: {
                        $ne: req.params.id
                    }

                });

            if (existingMaterial) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Raw Material already exists"

                });

            }

            rawMaterial.materialName =
                materialName.trim();

        }

        /*
        ============================================
        UPDATE FIELDS
        ============================================
        */

        if (category) {

            rawMaterial.category = category;

        }

        if (unit) {

            rawMaterial.unit = unit;

        }

        /*
        supplier is optional
        */

        if (supplier !== undefined) {

            rawMaterial.supplier =
                supplier || null;

        }

        if (warehouse) {

            rawMaterial.warehouse =
                warehouse;

        }

        if (costPrice !== undefined) {

            rawMaterial.costPrice =
                Number(costPrice);

        }

        if (minimumStock !== undefined) {

            rawMaterial.minimumStock =
                Number(minimumStock);

        }

        if (reorderLevel !== undefined) {

            rawMaterial.reorderLevel =
                Number(reorderLevel);

        }

        if (status) {

            rawMaterial.status = status;

        }

        /*
        ============================================
        IMPORTANT

        currentStock is NOT updated here.

        It will only be updated by:

        Stock In

        Stock Out

        Stock Transfer

        Stock Adjustment

        ============================================
        */

        await rawMaterial.save();

        const updatedMaterial =
            await RawMaterial.findById(rawMaterial._id)

                .populate("category", "name")

                .populate("unit", "name")

                .populate("supplier", "name")

                .populate("warehouse", "name");

        return res.status(200).json({

            success: true,

            message:
                "Raw Material updated successfully",

            data: updatedMaterial

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
====================================================
DEACTIVATE RAW MATERIAL

PATCH /api/raw-materials/:id/deactivate
====================================================
*/
exports.deactivateRawMaterial = async (req, res) => {

    try {

        const rawMaterial =
            await RawMaterial.findById(req.params.id);

        if (!rawMaterial) {

            return res.status(404).json({
                success: false,
                message: "Raw Material not found"
            });

        }

        rawMaterial.status = "Inactive";

        await rawMaterial.save();

        return res.status(200).json({

            success: true,

            message:
                "Raw Material deactivated successfully"

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
====================================================
ACTIVATE RAW MATERIAL

PATCH /api/raw-materials/:id/activate
====================================================
*/
exports.activateRawMaterial = async (req, res) => {

    try {

        const rawMaterial =
            await RawMaterial.findById(req.params.id);

        if (!rawMaterial) {

            return res.status(404).json({
                success: false,
                message: "Raw Material not found"
            });

        }

        rawMaterial.status = "Active";

        await rawMaterial.save();

        return res.status(200).json({

            success: true,

            message:
                "Raw Material activated successfully"

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
====================================================
DELETE RAW MATERIAL

DELETE /api/raw-materials/:id

Use Carefully
====================================================
*/
exports.deleteRawMaterial = async (req, res) => {

    try {

        const rawMaterial =
            await RawMaterial.findById(req.params.id);

        if (!rawMaterial) {

            return res.status(404).json({

                success: false,
                message: "Raw Material not found"
            });
        }

        await rawMaterial.deleteOne();

        return res.status(200).json({
            success: true,
            message:
                "Raw Material deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};