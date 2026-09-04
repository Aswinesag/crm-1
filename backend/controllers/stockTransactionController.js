// Placeholder stock transaction controller
const getStockTransactions = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStockTransactions };
