const VendorMaterial = require("../../models/VendorMaterial");
const Vendor = require("../../models/Vendor");
const Material = require("../../models/Material");



// =============================================
// CREATE VENDOR-MATERIAL LINK
// =============================================
const createVendorMaterial = async (req, res) => {
  try {
    const {
      vendorId,
      materialId,
      vendorMaterialCode,
      price,
      leadTimeDays,
      minimumOrderQty,
      isPreferred,
      remarks,
    } = req.body;

    // =========================
    // REQUIRED FIELD VALIDATION
    // =========================
    if (!vendorId || !materialId || price === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "vendorId, materialId and price are required",
      });
    }

    // =========================
    // CHECK VENDOR EXISTS
    // =========================
    const vendorExists = await Vendor.findById(vendorId);

    if (!vendorExists) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // =========================
    // CHECK MATERIAL EXISTS
    // =========================
    const materialExists = await Material.findById(
      materialId
    );

    if (!materialExists) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // =========================
    // PREVENT DUPLICATE LINKING
    // =========================
    const existingLink =
      await VendorMaterial.findOne({
        vendorId,
        materialId,
      });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message:
          "Vendor already linked with this material",
      });
    }

    // =========================
    // CREATE LINK
    // =========================
    const vendorMaterial =
      await VendorMaterial.create({
        vendorId,
        materialId,
        vendorMaterialCode,
        price,
        leadTimeDays,
        minimumOrderQty,
        isPreferred,
        remarks,
      });

    res.status(201).json({
      success: true,
      message:
        "Vendor material linked successfully",
      data: vendorMaterial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// GET ALL VENDOR-MATERIAL LINKS
// =============================================
const getAllVendorMaterials = async (req, res) => {
  try {
    const vendorMaterials =
      await VendorMaterial.find()
        .populate(
          "vendorId",
          "vendorCode vendorName email phone city state"
        )
        .populate(
          "materialId",
          "materialCode materialName category unit"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendorMaterials.length,
      data: vendorMaterials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// GET SINGLE VENDOR-MATERIAL LINK
// =============================================
const getSingleVendorMaterial = async (
  req,
  res
) => {
  try {
    const vendorMaterial =
      await VendorMaterial.findById(req.params.id)
        .populate(
          "vendorId",
          "vendorCode vendorName email phone city state"
        )
        .populate(
          "materialId",
          "materialCode materialName category unit"
        );

    if (!vendorMaterial) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor material link not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendorMaterial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// GET VENDORS BY MATERIAL
// =============================================
const getVendorsByMaterial = async (
  req,
  res
) => {
  try {
    const { materialId } = req.params;

    const vendors =
      await VendorMaterial.find({
        materialId,
      })
        .populate(
          "vendorId",
          "vendorCode vendorName email phone city state"
        )
        .populate(
          "materialId",
          "materialCode materialName category unit"
        )
        .sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// GET MATERIALS BY VENDOR
// =============================================
const getMaterialsByVendor = async (
  req,
  res
) => {
  try {
    const { vendorId } = req.params;

    const materials =
      await VendorMaterial.find({
        vendorId,
      })
        .populate(
          "vendorId",
          "vendorCode vendorName email phone city state"
        )
        .populate(
          "materialId",
          "materialCode materialName category unit"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// UPDATE VENDOR-MATERIAL LINK
// =============================================
const updateVendorMaterial = async (
  req,
  res
) => {
  try {
    const updatedVendorMaterial =
      await VendorMaterial.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedVendorMaterial) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor material link not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Vendor material updated successfully",
      data: updatedVendorMaterial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// DELETE VENDOR-MATERIAL LINK
// =============================================
const deleteVendorMaterial = async (
  req,
  res
) => {
  try {
    const deletedVendorMaterial =
      await VendorMaterial.findByIdAndDelete(
        req.params.id
      );

    if (!deletedVendorMaterial) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor material link not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Vendor material link deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// =============================================
// EXPORT ALL CONTROLLERS
// =============================================
module.exports = {
  createVendorMaterial,
  getAllVendorMaterials,
  getSingleVendorMaterial,
  getVendorsByMaterial,
  getMaterialsByVendor,
  updateVendorMaterial,
  deleteVendorMaterial,
};