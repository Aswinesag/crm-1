const express = require("express");
const router = express.Router();

console.log("✅ productRoutes loaded");

const productController = require("../controllers/productController");

router.post("/", productController.createProduct);

router.get("/", productController.getProducts);

router.get("/search", productController.searchProducts);

router.get("/:id", productController.getProductById);

router.put("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

router.patch("/:id/status", productController.changeStatus);

module.exports = router;