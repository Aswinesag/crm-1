// Placeholder GRN controller
const createGRN = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'GRN creation not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllGRNs = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSingleGRN = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateGRN = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'GRN update not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteGRN = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'GRN deletion not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createGRN,
  getAllGRNs,
  getSingleGRN,
  updateGRN,
  deleteGRN,
};
