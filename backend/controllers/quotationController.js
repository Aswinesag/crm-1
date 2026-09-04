// Placeholder quotation controller
const sendQuotationEmail = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Quotation email sending not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendQuotationEmail };
