const express = require("express");
const router = express.Router();

const hsnController = require("../controllers/hsnController");

router.post("/", hsnController.createHSN);

router.get("/", hsnController.getHSNCodes);

router.get("/search", hsnController.searchHSN);

router.get("/:id", hsnController.getHSNById);

router.put("/:id", hsnController.updateHSN);

router.delete("/:id", hsnController.deleteHSN);

module.exports = router;