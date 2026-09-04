const Supplier = require("../models/Supplier");

/*
====================================================
HELPER FUNCTION
AUTO GENERATE SUPPLIER CODE
SUP001
SUP002
SUP003
====================================================
*/
const generateSupplierCode = async () => {

    const lastSupplier =
        await Supplier.findOne()
            .sort({ createdAt: -1 })
            .select("supplierCode");

    if (!lastSupplier) {

        return "SUP001";

    }

    const lastNumber = parseInt(
        lastSupplier.supplierCode.replace("SUP", ""),
        10
    );

    const nextNumber = lastNumber + 1;

    return `SUP${String(nextNumber).padStart(3, "0")}`;

};



/*
====================================================
CREATE SUPPLIER

POST /api/suppliers
====================================================
*/
exports.createSupplier = async (req, res) => {

    try {

        const {

            name,

            contactPerson,

            email,

            phone,

            gstNumber,

            panNumber,

            address,

            city,

            state,

            pinCode,

            country,

            paymentTerms,

            creditLimit,

            status

        } = req.body;

        /*
        ============================================
        VALIDATION
        ============================================
        */

        if (!name || !name.trim()) {

            return res.status(400).json({

                success: false,

                message: "Supplier Name is required"

            });

        }

        /*
        ============================================
        CHECK DUPLICATE SUPPLIER NAME
        ============================================
        */

        const existingSupplier =
            await Supplier.findOne({

                name: {

                    $regex: new RegExp(
                        `^${name.trim()}$`,
                        "i"
                    )

                }

            });

        if (existingSupplier) {

            return res.status(400).json({

                success: false,

                message: "Supplier already exists"

            });

        }

        /*
        ============================================
        AUTO GENERATE SUPPLIER CODE
        ============================================
        */

        const supplierCode =
            await generateSupplierCode();

        /*
        ============================================
        CREATE SUPPLIER
        ============================================
        */

        const supplier =
            await Supplier.create({

                supplierCode,

                name: name.trim(),

                contactPerson:
                    contactPerson || "",

                email:
                    email || "",

                phone:
                    phone || "",

                gstNumber:
                    gstNumber || "",

                panNumber:
                    panNumber || "",

                address:
                    address || "",

                city:
                    city || "",

                state:
                    state || "",

                pinCode:
                    pinCode || "",

                country:
                    country || "India",

                paymentTerms:
                    paymentTerms || "Immediate",

                creditLimit:
                    creditLimit || 0,

                status:
                    status || "Active"

            });

        /*
        ============================================
        RETURN CREATED DATA
        ============================================
        */

        return res.status(201).json({

            success: true,

            message:
                "Supplier created successfully",

            data: supplier

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
GET ALL SUPPLIERS

GET /api/suppliers
?page=1
&limit=10
&search=abc
====================================================
*/
exports.getSuppliers = async (req, res) => {

    try {

        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const search =
            req.query.search || "";

        const skip =
            (page - 1) * limit;

        const filter = {};

        /*
        ============================================
        SEARCH
        ============================================
        */

        if (search) {

            filter.$or = [

                {
                    supplierCode: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    contactPerson: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    phone: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    city: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    state: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }

        /*
        ============================================
        TOTAL RECORDS
        ============================================
        */

        const totalRecords =
            await Supplier.countDocuments(
                filter
            );

        /*
        ============================================
        GET SUPPLIERS
        ============================================
        */

        const suppliers =
            await Supplier.find(filter)

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

            page,

            limit,

            totalRecords,

            totalPages:
                Math.ceil(
                    totalRecords / limit
                ),

            data: suppliers

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
GET SUPPLIER BY ID

GET /api/suppliers/:id
====================================================
*/
exports.getSupplierById = async (req, res) => {

    try {

        const supplier =
            await Supplier.findById(
                req.params.id
            );

        if (!supplier) {

            return res.status(404).json({

                success: false,

                message:
                    "Supplier not found"

            });

        }

        return res.status(200).json({

            success: true,

            data: supplier

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
UPDATE SUPPLIER

PUT /api/suppliers/:id
====================================================
*/
exports.updateSupplier = async (req, res) => {

    try {

        const {

            name,

            contactPerson,

            email,

            phone,

            gstNumber,

            panNumber,

            address,

            city,

            state,

            pinCode,

            country,

            paymentTerms,

            creditLimit,

            status

        } = req.body;

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {

            return res.status(404).json({

                success: false,

                message: "Supplier not found"

            });

        }

        /*
        ============================================
        CHECK DUPLICATE SUPPLIER NAME
        ============================================
        */

        if (name) {

            const existingSupplier =
                await Supplier.findOne({

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

            if (existingSupplier) {

                return res.status(400).json({

                    success: false,

                    message: "Supplier already exists"

                });

            }

            supplier.name = name.trim();

        }

        /*
        ============================================
        UPDATE FIELDS
        ============================================
        */

        if (contactPerson !== undefined) {

            supplier.contactPerson =
                contactPerson;

        }

        if (email !== undefined) {

            supplier.email =
                email;

        }

        if (phone !== undefined) {

            supplier.phone =
                phone;

        }

        if (gstNumber !== undefined) {

            supplier.gstNumber =
                gstNumber;

        }

        if (panNumber !== undefined) {

            supplier.panNumber =
                panNumber;

        }

        if (address !== undefined) {

            supplier.address =
                address;

        }

        if (city !== undefined) {

            supplier.city =
                city;

        }

        if (state !== undefined) {

            supplier.state =
                state;

        }

        if (pinCode !== undefined) {

            supplier.pinCode =
                pinCode;

        }

        if (country !== undefined) {

            supplier.country =
                country;

        }

        if (paymentTerms !== undefined) {

            supplier.paymentTerms =
                paymentTerms;
        }

        if (creditLimit !== undefined) {
            supplier.creditLimit = creditLimit;
        }

        if (status) {

            supplier.status =
                status;

        }

        await supplier.save();

        return res.status(200).json({

            success: true,

            message:
                "Supplier updated successfully",

            data: supplier

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
DEACTIVATE SUPPLIER

PATCH /api/suppliers/:id/deactivate
====================================================
*/
exports.deactivateSupplier = async (req, res) => {

    try {

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {

            return res.status(404).json({

                success: false,

                message: "Supplier not found"

            });

        }

        supplier.status = "Inactive";

        await supplier.save();

        return res.status(200).json({

            success: true,

            message:
                "Supplier deactivated successfully"

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
ACTIVATE SUPPLIER

PATCH /api/suppliers/:id/activate
====================================================
*/
exports.activateSupplier = async (req, res) => {

    try {

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {

            return res.status(404).json({

                success: false,

                message: "Supplier not found"

            });

        }

        supplier.status = "Active";

        await supplier.save();

        return res.status(200).json({

            success: true,

            message:
                "Supplier activated successfully"

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
DELETE SUPPLIER

DELETE /api/suppliers/:id

Use Carefully
====================================================
*/
exports.deleteSupplier = async (req, res) => {

    try {

        const supplier =
            await Supplier.findById(req.params.id);

        if (!supplier) {

            return res.status(404).json({

                success: false,

                message: "Supplier not found"

            });

        }

        await supplier.deleteOne();

        return res.status(200).json({

            success: true,

            message:
                "Supplier deleted successfully"

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};