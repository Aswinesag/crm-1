const express = require("express");
const router = express.Router();

const taxController = require("../controllers/taxController");

router.post("/", taxController.createTax);

router.get("/", taxController.getTaxes);

router.get("/search", taxController.searchTaxes);

router.get("/:id", taxController.getTaxById);

router.put("/:id", taxController.updateTax);

router.delete("/:id", taxController.deleteTax);

router.patch("/:id/status", taxController.changeStatus);

module.exports = router;