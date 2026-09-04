const express = require("express");

const router = express.Router();

const {
  createPurchaseRequisition,
  getAllPurchaseRequisitions,
  getSinglePurchaseRequisition,
  updatePurchaseRequisitionStatus,
} = require(
  "../controllers/purchaseRequisition/purchaseRequisitionController"
);



// CREATE PR
router.post("/", createPurchaseRequisition);



// GET ALL PRs
router.get("/", getAllPurchaseRequisitions);



// GET SINGLE PR
router.get("/:id", getSinglePurchaseRequisition);



// UPDATE STATUS
router.put(
  "/:id/status",
  updatePurchaseRequisitionStatus
);

module.exports = router;