// Placeholder stock out controller
const stockOutMaterial = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Stock out not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { stockOutMaterial };
