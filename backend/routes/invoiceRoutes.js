const express = require("express");
const { protect } = require("../middleware/auth");
const { createInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice } = require("../controllers/invoiceController");

const router = express.Router();
router.use(protect);
router.route("/").post(createInvoice).get(getInvoices);
router.route("/:id").get(getInvoice).put(updateInvoice).delete(deleteInvoice);

module.exports = router;
