const Vendor = require("../../models/Vendor");
const AccountsPayable = require("../../models/AccountsPayable");
const SupplierPayment = require("../../models/SupplierPayment");

// Most vendor CRUD remains legacy placeholder behavior; deletion is fail-closed once finance depends on a vendor.
const createVendor = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Vendor creation not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllVendors = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getVendorById = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVendor = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Vendor update not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    if (await AccountsPayable.exists({ supplier: vendor._id }) || await SupplierPayment.exists({ supplier: vendor._id })) return res.status(409).json({ success: false, message: "Vendor cannot be deleted because Accounts Payable or Supplier Payment history depends on it; deactivate the vendor instead" });
    await vendor.deleteOne();
    return res.json({ success: true, message: "Vendor deleted" });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const assignMaterialsToVendor = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Material assignment not yet implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  assignMaterialsToVendor,
};
