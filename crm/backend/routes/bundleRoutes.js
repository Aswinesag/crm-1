const express = require("express");

const router = express.Router();

const bundleController =
    require("../controllers/bundleController");

router.post(
    "/",
    bundleController.createBundle
);

router.get(
    "/",
    bundleController.getBundles
);

router.get(
    "/search",
    bundleController.searchBundles
);

router.get(
    "/:id",
    bundleController.getBundleById
);

router.put(
    "/:id",
    bundleController.updateBundle
);

router.delete(
    "/:id",
    bundleController.deleteBundle
);

router.patch(
    "/:id/status",
    bundleController.changeStatus
);

module.exports = router;