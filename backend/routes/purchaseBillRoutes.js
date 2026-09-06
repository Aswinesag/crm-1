const express = require("express");
const controller = require("../controllers/purchaseBillController");
const { protect, restrictTo } = require("../middleware/auth");
const router = express.Router();

router.use(protect, restrictTo("Super Admin", "Admin"));
router.get("/", controller.list);
router.post("/match-preview", controller.matchPreview);
router.post("/", controller.create);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/:id/submit", controller.submit);
router.post("/:id/rematch", controller.rematch);
router.post("/:id/approve", controller.approve);
router.post("/:id/approve-exception", controller.approveException);
router.post("/:id/reject", controller.reject);

module.exports = router;
