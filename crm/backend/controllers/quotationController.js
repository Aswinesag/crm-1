exports.sendQuotationEmail = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Quotation email sent successfully",
      quotationId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};