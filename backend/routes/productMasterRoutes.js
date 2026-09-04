const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth");
const controllers = require("../controllers/productMasterController");

router.use(protect, restrictTo("Super Admin", "Admin"));
for (const [path, controller] of [["/products", controllers.product], ["/raw-materials", controllers.rawMaterial], ["/components", controllers.component]]) {
  router.route(path).get(controller.list).post(controller.create);
  router.route(`${path}/:id`).get(controller.get).put(controller.update).delete(controller.remove);
  router.patch(`${path}/:id/status`, controller.changeStatus);
}
module.exports = router;
