const express = require("express");

const {
    createMaterial,
    getAllMaterials,
    updateMaterial,
    deleteMaterial,
    getSingleMaterial,
    searchMaterials
} = require("../controllers/materialController");


const router = express.Router();

router.post("/", createMaterial);

router.get("/", getAllMaterials);

router.get("/search", searchMaterials);

// GET SINGLE
router.get("/:id", getSingleMaterial);

// UPDATE MATERIAL

router.put("/:id", updateMaterial);


router.delete("/:id", deleteMaterial);

module.exports = router;