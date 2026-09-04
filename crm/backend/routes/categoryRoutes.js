const express = require("express");

const router = express.Router();

const categoryController =
    require("../controllers/categoryController");

/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
*/

// Create Category
router.post(
    "/",
    categoryController.createCategory
);

// Get All Categories
router.get(
    "/",
    categoryController.getCategories
);

// Get Category By ID
router.get(
    "/:id",
    categoryController.getCategoryById
);

// Update Category
router.put(
    "/:id",
    categoryController.updateCategory
);

// Delete Category
router.delete(
    "/:id",
    categoryController.deleteCategory
);

module.exports = router;