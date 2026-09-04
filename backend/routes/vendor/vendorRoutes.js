const express = require("express");
const router = express.Router();

const {
  createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor, assignMaterialsToVendor,
} = require("../../controllers/vendor/vendorController");

router.post("/", createVendor);

router.get("/", getAllVendors);

router.get("/:id", getVendorById);

router.put("/:id", updateVendor);

router.delete("/:id", deleteVendor);

router.put("/:vendorId/materials", assignMaterialsToVendor);

module.exports = router;