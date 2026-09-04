const express = require("express");

const router = express.Router();

const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    activateSupplier,
    deactivateSupplier,
    deleteSupplier
} = require("../controllers/supplierController");

router.post("/", createSupplier);

router.get("/", getSuppliers);

router.get("/:id", getSupplierById);

router.put("/:id", updateSupplier);

router.patch("/:id/deactivate", deactivateSupplier);

router.patch("/:id/activate", activateSupplier);

router.delete("/:id", deleteSupplier);


module.exports = router;