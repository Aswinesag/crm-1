const express = require("express");
const router = express.Router();

const subCategoryController = require("../controllers/subCategoryController");

router.post("/", subCategoryController.createSubCategory);

router.get("/", subCategoryController.getSubCategories);

router.get("/search", subCategoryController.searchSubCategories);

router.get("/:id", subCategoryController.getSubCategoryById);

router.put("/:id", subCategoryController.updateSubCategory);

router.delete("/:id", subCategoryController.deleteSubCategory);

router.patch("/:id/status", subCategoryController.changeStatus);

module.exports = router;