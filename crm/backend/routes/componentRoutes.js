const express = require("express");

const router = express.Router();

const {

    createComponent,

    getComponents,

    getComponentById,

    updateComponent,

    activateComponent,

    deactivateComponent,

    deleteComponent

} = require("../controllers/componentController");


router.post("/", createComponent);

router.get("/", getComponents);

router.get("/:id", getComponentById);

router.put("/:id", updateComponent);

router.patch("/activate/:id", activateComponent);

router.patch("/deactivate/:id", deactivateComponent);

router.delete("/:id", deleteComponent);

module.exports = router;