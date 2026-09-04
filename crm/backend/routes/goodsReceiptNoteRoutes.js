const express = require("express");

const router = express.Router();

const {
    createGRN,
    getGRNs,
    getGRNById,
    updateGRN,
    deleteGRN
} = require("../controllers/goodsReceiptNoteController");

router.post("/", createGRN);

router.get("/", getGRNs);

router.get("/:id", getGRNById);

router.put("/:id", updateGRN);

router.delete("/:id", deleteGRN);

module.exports = router;