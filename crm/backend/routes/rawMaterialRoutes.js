const express = require("express");

const router = express.Router();

const {
    createRawMaterial,
    getRawMaterials,
    getRawMaterialById,
    updateRawMaterial,
    activateRawMaterial,
    deactivateRawMaterial,
    deleteRawMaterial
} = require("../controllers/rawMaterialController");


/*
====================================================
CREATE RAW MATERIAL
POST /api/raw-materials
====================================================
*/
router.post("/", createRawMaterial);


/*
====================================================
GET ALL RAW MATERIALS
GET /api/raw-materials
?page=1
&limit=10
&search=copper
====================================================
*/
router.get("/", getRawMaterials);


/*
====================================================
GET RAW MATERIAL BY ID
GET /api/raw-materials/:id
====================================================
*/
router.get("/:id", getRawMaterialById);


/*
====================================================
UPDATE RAW MATERIAL
PUT /api/raw-materials/:id
====================================================
*/
router.put("/:id", updateRawMaterial);


/*
====================================================
DEACTIVATE RAW MATERIAL
PATCH /api/raw-materials/:id/deactivate
====================================================
*/
router.patch("/:id/deactivate", deactivateRawMaterial);


/*
====================================================
ACTIVATE RAW MATERIAL
PATCH /api/raw-materials/:id/activate
====================================================
*/
router.patch("/:id/activate", activateRawMaterial);


/*
====================================================
DELETE RAW MATERIAL
DELETE /api/raw-materials/:id
====================================================
*/
router.delete("/:id", deleteRawMaterial);


module.exports = router;