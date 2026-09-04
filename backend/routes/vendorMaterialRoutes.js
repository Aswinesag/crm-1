const express = require("express");

const router = express.Router();



// =============================================
// IMPORT CONTROLLERS
// =============================================
const {
  createVendorMaterial,
  getAllVendorMaterials,
  getSingleVendorMaterial,
  getVendorsByMaterial,
  getMaterialsByVendor,
  updateVendorMaterial,
  deleteVendorMaterial,
} = require(
  "../controllers/vendorMaterial/vendorMaterialController"
);



// =============================================
// CREATE VENDOR-MATERIAL LINK
// =============================================
// POST /api/vendor-materials
router.post("/", createVendorMaterial);



// =============================================
// GET ALL VENDOR-MATERIAL LINKS
// =============================================
// GET /api/vendor-materials
router.get("/", getAllVendorMaterials);



// =============================================
// GET VENDORS BY MATERIAL
// =============================================
// GET /api/vendor-materials/material/:materialId
router.get(
  "/material/:materialId",
  getVendorsByMaterial
);



// =============================================
// GET MATERIALS BY VENDOR
// =============================================
// GET /api/vendor-materials/vendor/:vendorId
router.get(
  "/vendor/:vendorId",
  getMaterialsByVendor
);



// =============================================
// GET SINGLE VENDOR-MATERIAL LINK
// =============================================
// GET /api/vendor-materials/:id
router.get("/:id", getSingleVendorMaterial);



// =============================================
// UPDATE VENDOR-MATERIAL LINK
// =============================================
// PUT /api/vendor-materials/:id
router.put("/:id", updateVendorMaterial);



// =============================================
// DELETE VENDOR-MATERIAL LINK
// =============================================
// DELETE /api/vendor-materials/:id
router.delete("/:id", deleteVendorMaterial);



// =============================================
// EXPORT ROUTER
// =============================================
module.exports = router;