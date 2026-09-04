const express = require("express");

const router = express.Router();

const brandController = require(
    "../controllers/brandController"
);

/*
=================================================
BRAND ROUTES
Base URL : /api/brands
=================================================
*/

// Create Brand
router.post(
    "/",
    brandController.createBrand
);

// Get All Brands
router.get(
    "/",
    brandController.getBrands
);

// Get Brand By ID
router.get(
    "/:id",
    brandController.getBrandById
);

// Update Brand
router.put(
    "/:id",
    brandController.updateBrand
);

// Activate Brand
router.patch(
    "/:id/activate",
    brandController.activateBrand
);

// Deactivate Brand
router.patch(
    "/:id/deactivate",
    brandController.deactivateBrand
);

// Hard Delete Brand
router.delete(
    "/:id",
    brandController.deleteBrand
);

module.exports = router;