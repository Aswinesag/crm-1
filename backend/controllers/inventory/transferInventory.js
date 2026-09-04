// Placeholder transfer inventory controller
const transferInventory = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Inventory transfer not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { transferInventory };
