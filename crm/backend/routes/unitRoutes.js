const express = require("express");
const router = express.Router();

const unitController = require("../controllers/unitController");

router.post("/", unitController.createUnit);

router.get("/", unitController.getUnits);

router.get("/search", unitController.searchUnits);

router.get("/:id", unitController.getUnitById);

router.put("/:id", unitController.updateUnit);

router.delete("/:id", unitController.deleteUnit);

router.patch("/:id/status", unitController.changeStatus);

module.exports = router;