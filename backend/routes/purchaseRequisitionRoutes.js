const express = require("express");

const router = express.Router();

const {
  createPurchaseRequisition,
  getAllPurchaseRequisitions,
  getSinglePurchaseRequisition,
  updatePurchaseRequisitionStatus,
  convertToRFQ,
} = require(
  "../controllers/purchaseRequisition/purchaseRequisitionController"
);
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("Super Admin", "Admin"));



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
router.post("/:id/rfq", convertToRFQ);

module.exports = router;
