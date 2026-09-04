// Placeholder low stock alert controller
const getLowStockMaterials = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getLowStockMaterials };
