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
const blockLegacyMaterialWrites = require("../middleware/blockLegacyMaterialWrites");

router.post("/", blockLegacyMaterialWrites);

router.get("/", getAllMaterials);

router.get("/search", searchMaterials);

// GET SINGLE
router.get("/:id", getSingleMaterial);

// UPDATE MATERIAL

router.put("/:id", blockLegacyMaterialWrites);


router.delete("/:id", blockLegacyMaterialWrites);

module.exports = router;
