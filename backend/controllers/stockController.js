// Placeholder stock controller
const stockInMaterial = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Stock in not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { stockInMaterial };
