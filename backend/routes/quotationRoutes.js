const express = require("express");

const router = express.Router();

const {
  sendQuotationEmail,
} = require("../controllers/quotationController");

router.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "Quotation Route Working",
  });
});

router.post("/sendQuotation/:id", sendQuotationEmail);

module.exports = router;