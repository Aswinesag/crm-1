const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth");
const controllers = require("../controllers/productSettingsController");

router.use(protect, restrictTo("Super Admin", "Admin"));

for (const [path, controller] of [
  ["/categories", controllers.category],
  ["/subcategories", controllers.subcategory],
  ["/brands", controllers.brand],
  ["/units", controllers.unit],
  ["/hsn-codes", controllers.hsn],
]) {
  router.route(path).get(controller.list).post(controller.create);
  router.route(`${path}/:id`).get(controller.get).put(controller.update).delete(controller.remove);
}

module.exports = router;
