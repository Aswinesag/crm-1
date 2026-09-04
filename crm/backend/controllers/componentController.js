const Component = require("../models/Component");

const generateComponentCode = async () => {

    const lastComponent = await Component.findOne()
        .sort({createdAt:-1})
        .select("componentCode");

    if(!lastComponent){

        return "CMP001";

    }

    const lastNumber=parseInt(
        lastComponent.componentCode.replace("CMP","")
    );

    const nextNumber=lastNumber+1;

    return `CMP${String(nextNumber).padStart(3,"0")}`;

}

/*
====================================================
CREATE COMPONENT

POST
/api/components
====================================================
*/

const createComponent = async (req, res) => {

    try {

        const {

            componentName,
            category,
            unit,
            supplier,
            warehouse,
            costPrice,
            stockQuantity,
            status

        } = req.body;

        /*
        ============================================
        REQUIRED FIELD VALIDATION
        ============================================
        */

        if (
            !componentName ||
            !category ||
            !unit ||
            !supplier ||
            !warehouse
        ) {

            return res.status(400).json({

                success: false,
                message:
                    "Please fill all required fields."

            });

        }

        /*
        ============================================
        CHECK DUPLICATE COMPONENT NAME
        ============================================
        */

        const existingComponent = await Component.findOne({

            componentName: componentName.trim()

        });

        if (existingComponent) {

            return res.status(400).json({

                success: false,
                message:
                    "Component already exists."

            });

        }

        /*
        ============================================
        GENERATE COMPONENT CODE
        ============================================
        */

        const componentCode =
            await generateComponentCode();

        /*
        ============================================
        CREATE COMPONENT
        ============================================
        */

        const component =
            await Component.create({

                componentCode,

                componentName:
                    componentName.trim(),

                category,

                unit,

                supplier,

                warehouse,

                costPrice:
                    costPrice || 0,

                stockQuantity:
                    stockQuantity || 0,

                status:
                    status || "Active"

            });

        /*
        ============================================
        SUCCESS RESPONSE
        ============================================
        */

        return res.status(201).json({

            success: true,

            message:
                "Component created successfully.",

            data: component

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                "Server Error",

            error: error.message

        });

    }

};

/*
====================================================
GET ALL COMPONENTS

GET
/api/components

Supports

?page=1

?limit=10

?search=rotor
====================================================
*/

const getComponents = async (req, res) => {

    try {

        /*
        ============================================
        PAGINATION
        ============================================
        */

        const page =
            parseInt(req.query.page) || 1;

        const limit =
            parseInt(req.query.limit) || 10;

        const skip =
            (page - 1) * limit;

        /*
        ============================================
        SEARCH
        ============================================
        */

        const search =
            req.query.search || "";

        const searchFilter = {

            componentName: {

                $regex: search,

                $options: "i"

            }

        };

        /*
        ============================================
        TOTAL COUNT
        ============================================
        */

        const total =
            await Component.countDocuments(
                searchFilter
            );

        /*
        ============================================
        GET COMPONENTS
        ============================================
        */

        const components =
            await Component.find(searchFilter)

                .populate("category", "name")
                .populate("unit", "name")
                .populate("supplier", "name")
                .populate("warehouse", "warehouseName")

                .sort({

                    createdAt: -1

                })

                .skip(skip)

                .limit(limit);

        /*
        ============================================
        RESPONSE
        ============================================
        */

        return res.status(200).json({

            success: true,

            total,

            page,

            totalPages:
                Math.ceil(total / limit),

            data: components

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                "Server Error",

            error: error.message

        });

    }

};

/*
====================================================
GET COMPONENT BY ID

GET
/api/components/:id
====================================================
*/

const getComponentById = async (req, res) => {

    try {

        const { id } = req.params;

        /*
        ============================================
        FIND COMPONENT
        ============================================
        */

        const component = await Component.findById(id)

            .populate(
                "category",
                "categoryName"
            )

            .populate(
                "unit",
                "unitName"
            )

            .populate(
                "supplier",
                "supplierName"
            )

            .populate(
                "warehouse",
                "warehouseName"
            );

        /*
        ============================================
        COMPONENT NOT FOUND
        ============================================
        */

        if (!component) {

            return res.status(404).json({

                success: false,

                message: "Component not found."

            });

        }

        /*
        ============================================
        SUCCESS RESPONSE
        ============================================
        */

        return res.status(200).json({

            success: true,

            data: component

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

/*
====================================================
UPDATE COMPONENT

PUT
/api/components/:id
====================================================
*/

const updateComponent = async (req, res) => {

    try {

        const { id } = req.params;

        const {

            componentName,
            category,
            unit,
            supplier,
            warehouse,
            costPrice,
            stockQuantity,
            status

        } = req.body;

        /*
        ============================================
        FIND COMPONENT
        ============================================
        */

        const component = await Component.findById(id);

        if (!component) {

            return res.status(404).json({

                success: false,

                message: "Component not found."

            });

        }

        /*
        ============================================
        REQUIRED FIELD VALIDATION
        ============================================
        */

        if (

            !componentName ||

            !category ||

            !unit ||

            !supplier ||

            !warehouse

        ) {

            return res.status(400).json({

                success: false,

                message: "Please fill all required fields."

            });

        }

        /*
        ============================================
        CHECK DUPLICATE COMPONENT NAME
        ============================================
        */

        const duplicateComponent = await Component.findOne({

            componentName: componentName.trim(),

            _id: { $ne: id }

        });

        if (duplicateComponent) {

            return res.status(400).json({

                success: false,

                message: "Component name already exists."

            });

        }

        /*
        ============================================
        UPDATE COMPONENT
        ============================================
        */

        component.componentName = componentName.trim();

        component.category = category;

        component.unit = unit;

        component.supplier = supplier;

        component.warehouse = warehouse;

        component.costPrice = costPrice;

        component.stockQuantity = stockQuantity;

        component.status = status;

        /*
        ============================================
        SAVE CHANGES
        ============================================
        */

        await component.save();

        /*
        ============================================
        FETCH UPDATED COMPONENT
        ============================================
        */

        const updatedComponent = await Component.findById(id)

            .populate(
                "category",
                "categoryName"
            )

            .populate(
                "unit",
                "unitName"
            )

            .populate(
                "supplier",
                "supplierName"
            )

            .populate(
                "warehouse",
                "warehouseName"
            );

        /*
        ============================================
        SUCCESS RESPONSE
        ============================================
        */

        return res.status(200).json({

            success: true,

            message: "Component updated successfully.",

            data: updatedComponent

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

/*
====================================================
ACTIVATE COMPONENT

PATCH
/api/components/activate/:id
====================================================
*/

const activateComponent = async (req, res) => {

    try {

        const { id } = req.params;

        /*
        ============================================
        FIND COMPONENT
        ============================================
        */

        const component = await Component.findById(id);

        if (!component) {

            return res.status(404).json({

                success: false,

                message: "Component not found."

            });

        }

        /*
        ============================================
        ALREADY ACTIVE
        ============================================
        */

        if (component.status === "Active") {

            return res.status(400).json({

                success: false,

                message: "Component is already active."

            });

        }

        /*
        ============================================
        ACTIVATE COMPONENT
        ============================================
        */

        component.status = "Active";

        await component.save();

        /*
        ============================================
        SUCCESS RESPONSE
        ============================================
        */

        return res.status(200).json({

            success: true,

            message: "Component activated successfully.",

            data: component

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

/*
====================================================
DEACTIVATE COMPONENT

PATCH
/api/components/deactivate/:id
====================================================
*/

const deactivateComponent = async (req, res) => {

    try {

        const { id } = req.params;

        /*
        ============================================
        FIND COMPONENT
        ============================================
        */

        const component = await Component.findById(id);

        if (!component) {

            return res.status(404).json({

                success: false,

                message: "Component not found."

            });

        }

        /*
        ============================================
        ALREADY INACTIVE
        ============================================
        */

        if (component.status === "Inactive") {

            return res.status(400).json({

                success: false,

                message: "Component is already inactive."

            });

        }

        /*
        ============================================
        DEACTIVATE COMPONENT
        ============================================
        */

        component.status = "Inactive";

        await component.save();

        /*
        ============================================
        SUCCESS RESPONSE
        ============================================
        */

        return res.status(200).json({

            success: true,

            message: "Component deactivated successfully.",

            data: component

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

/*
====================================================
DELETE COMPONENT

DELETE
/api/components/:id
====================================================
*/

const deleteComponent = async (req, res) => {

    try {

        const { id } = req.params;

        /*
        ============================================
        FIND COMPONENT
        ============================================
        */

        const component = await Component.findById(id);

        if (!component) {

            return res.status(404).json({

                success: false,

                message: "Component not found."

            });

        }

        /*
        ============================================
        DELETE COMPONENT
        ============================================
        */

        await Component.findByIdAndDelete(id);

        /*
        ============================================
        SUCCESS RESPONSE
        ============================================
        */

        return res.status(200).json({

            success: true,

            message: "Component deleted successfully."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

module.exports = { createComponent, getComponents, getComponentById, updateComponent,
                activateComponent, deactivateComponent, deleteComponent

};