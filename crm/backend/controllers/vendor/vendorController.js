const Vendor = require("../../models/Vendor");

const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllVendors = async (req, res) => {
  try {

    // =========================================
    // FILTER OBJECT
    // =========================================
    const filter = {};

    // FILTER BY STATUS
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // FILTER BY CITY
    if (req.query.city) {
      filter.city = req.query.city;
    }

    // SEARCH BY VENDOR NAME
    if (req.query.search) {
      filter.vendorName = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    // =========================================
    // PAGINATION
    // =========================================

    // CURRENT PAGE
    const page = parseInt(req.query.page) || 1;

    // RECORDS PER PAGE
    const limit = parseInt(req.query.limit) || 10;

    // SKIP CALCULATION
    const skip = (page - 1) * limit;

    // =========================================
    // TOTAL DOCUMENT COUNT
    // =========================================
    const total = await Vendor.countDocuments(filter);

    // =========================================
    // FETCH VENDORS
    // =========================================
    const vendors = await Vendor.find(filter)
      .populate("suppliedMaterials")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // =========================================
    // TOTAL PAGES
    // =========================================
    const pages = Math.ceil(total / limit);

    // =========================================
    // RESPONSE
    // =========================================
    res.status(200).json({
      success: true,

      // PAGINATION INFO
      total,
      page,
      pages,
      limit,

      // CURRENT PAGE RECORD COUNT
      count: vendors.length,

      // DATA
      data: vendors,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate("suppliedMaterials");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const assignMaterialsToVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { materialIds } = req.body;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    vendor.suppliedMaterials = materialIds;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Materials assigned successfully",
      data: vendor,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor, assignMaterialsToVendor,
};