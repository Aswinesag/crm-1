const RequestforQuotation = require("../models/RequestforQuotation");
const PurchaseRequisition = require("../models/PurchaseRequisitions");

// ==============================================
// Generate Next RFQ Number
// Example:
// RFQ-00001
// RFQ-00002
// RFQ-00003
// ==============================================
const generateRFQNumber = async () => {
  try {
    const lastRFQ = await RequestforQuotation.findOne()
      .sort({ createdAt: -1 })
      .select("rfqNumber");

    if (!lastRFQ) {
      return "RFQ-00001";
    }

    const lastNumber = parseInt(
      lastRFQ.rfqNumber.replace("RFQ-", ""),
      10
    );

    const nextNumber = lastNumber + 1;

    return `RFQ-${String(nextNumber).padStart(5, "0")}`;
  } catch (error) {
    throw error;
  }
};

// ==============================================
// Create Request For Quotation
// POST /api/request-for-quotations
// ==============================================
const createRequestForQuotation = async (req, res) => {
  try {
    const {
      purchaseRequisition,
      vendorIds,
      remarks,
      status,
    } = req.body;

    const pr = await PurchaseRequisition.findById(purchaseRequisition);

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: "Purchase Requisition not found.",
      });
    }
    // ==========================================
    // Validation
    // ==========================================
    if (!purchaseRequisition) {
      return res.status(400).json({
        success: false,
        message: "Purchase Requisition is required.",
      });
    }

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one vendor.",
      });
    }

    
       // ==========================================
    // Generate RFQ Number
    // ==========================================
    const rfqNumber = await generateRFQNumber();

    // ==========================================
    // Create RFQ Object
    // ==========================================
    const items = pr.items.map((item) => ({
      material: item.material,
      quantity: item.quantity,
      unit: item.unit,
      requiredQty: item.requiredQty,
      currentStock: item.currentStock,
    }));

    const newRFQ = new RequestforQuotation({
      rfqNumber,
      purchaseRequisition,
      vendors: vendorIds,
      items,
      remarks,
      status: status || "Draft",
    });

    // ==========================================
    // Save RFQ
    // ==========================================
    const savedRFQ = await newRFQ.save();

    // ==========================================
    // Populate Response
    // ==========================================
    const populatedRFQ = await RequestforQuotation.findById(savedRFQ._id)
      .populate(
        "purchaseRequisition",
        "requisitionNo department requestedBy priority requiredDate"
      )
      .populate(
          "vendors",
          "vendorName email phone"
      )
      .populate(
        "items.material",
        "materialCode materialName unit currentStock"
      );

    // ==========================================
    // Success Response
    // ==========================================
    return res.status(201).json({
      success: true,
      message: "Request For Quotation created successfully.",
      rfq: populatedRFQ,
    });
  } catch (error) {
    console.error("Create RFQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Request For Quotation.",
      error: error.message,
    });
  }
};

// ==============================================
// Get All Request For Quotations
// GET /api/request-for-quotations
// ==============================================
const getAllRequestForQuotations = async (req, res) => {
  try {
    // ==========================================
    // Pagination
    // ==========================================
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // ==========================================
    // Search Filter
    // ==========================================
    const filter = {};

    if (search.trim() !== "") {
      filter.rfqNumber = {
        $regex: search,
        $options: "i",
      };
    }

    // ==========================================
    // Total Records
    // ==========================================
    const totalRecords =
      await RequestforQuotation.countDocuments(filter);

    // ==========================================
    // Get RFQs
    // ==========================================
    const rfqs = await RequestforQuotation.find(filter)
      .populate(
        "purchaseRequisition",
        "requisitionNo department requestedBy priority requiredDate"
      )
      .populate(
          "vendors",
          "vendorName email phone"
      )
      .populate(
        "items.material",
        "materialCode materialName unit currentStock"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ==========================================
    // Response
    // ==========================================
    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      recordsPerPage: limit,
      rfqs,
    });
  } catch (error) {
    console.error("Get All RFQs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Request For Quotations.",
      error: error.message,
    });
  }
};

// ==============================================
// Get Request For Quotation By ID
// GET /api/request-for-quotations/:id
// ==============================================
const getRequestForQuotationById = async (req, res) => {
  try {
    const { id } = req.params;

    const rfq = await RequestforQuotation.findById(id)
      .populate(
        "purchaseRequisition",
        "requisitionNo requestDate department requestedBy priority requiredDate remarks status"
      )
     .populate(
          "vendors",
          "vendorName contactPerson email phone"
      )
      .populate(
        "items.material",
        "materialCode materialName unit currentStock"
      );

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "Request For Quotation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      rfq,
    });
  } catch (error) {
    console.error("Get RFQ By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Request For Quotation.",
      error: error.message,
    });
  }
};
// ==============================================
// Update Request For Quotation
// PUT /api/request-for-quotations/:id
// ==============================================
const updateRequestForQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      purchaseRequisition,
      vendorIds,
      items,
      remarks,
      status,
    } = req.body;

    // ==========================================
    // Check RFQ Exists
    // ==========================================
    const existingRFQ = await RequestforQuotation.findById(id);

    if (!existingRFQ) {
      return res.status(404).json({
        success: false,
        message: "Request For Quotation not found.",
      });
    }

    // ==========================================
    // Validation
    // ==========================================
    if (!purchaseRequisition) {
      return res.status(400).json({
        success: false,
        message: "Purchase Requisition is required.",
      });
    }

    if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one vendor.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one material is required.",
      });
    }

    // ==========================================
    // Validate Items
    // ==========================================
    for (const item of items) {
      if (!item.material) {
        return res.status(400).json({
          success: false,
          message: "Material is required.",
        });
      }

      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than zero.",
        });
      }

      if (!item.unit) {
        return res.status(400).json({
          success: false,
          message: "Unit is required.",
        });
      }
    }

    // ==========================================
    // Update RFQ
    // ==========================================
    existingRFQ.purchaseRequisition = purchaseRequisition;
    existingRFQ.vendors = vendorIds;
    existingRFQ.items = items;
    existingRFQ.remarks = remarks || "";
    existingRFQ.status = status || existingRFQ.status;

    await existingRFQ.save();

    // ==========================================
    // Populate Updated RFQ
    // ==========================================
    const updatedRFQ = await RequestforQuotation.findById(id)
      .populate(
        "purchaseRequisition",
        "requisitionNo requestDate department requestedBy priority requiredDate remarks status"
      )
      .populate(
          "vendors",
          "vendorName contactPerson email phone"
      )
      .populate(
        "items.material",
        "materialCode materialName unit currentStock"
      );

    // ==========================================
    // Success Response
    // ==========================================
    return res.status(200).json({
      success: true,
      message: "Request For Quotation updated successfully.",
      rfq: updatedRFQ,
    });
  } catch (error) {
    console.error("Update RFQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Request For Quotation.",
      error: error.message,
    });
  }
};
// ==============================================
// Delete Request For Quotation
// DELETE /api/request-for-quotations/:id
// ==============================================
const deleteRequestForQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const rfq = await RequestforQuotation.findById(id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "Request For Quotation not found.",
      });
    }

    await RequestforQuotation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Request For Quotation deleted successfully.",
    });
  } catch (error) {
    console.error("Delete RFQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Request For Quotation.",
      error: error.message,
    });
  }
};

// ==============================================
// Update RFQ Status
// PATCH /api/request-for-quotations/:id/status
// ==============================================
const updateRequestForQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ==========================================
    // Allowed Status Values
    // ==========================================
    const allowedStatus = [
      "Draft",
      "Sent",
      "Quotation Received",
      "Closed",
      "Cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const rfq = await RequestforQuotation.findById(id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "Request For Quotation not found.",
      });
    }

    rfq.status = status;

    await rfq.save();

    const updatedRFQ = await RequestforQuotation.findById(id)
      .populate(
        "purchaseRequisition",
        "requisitionNo department requestedBy priority requiredDate"
      )
      .populate(
          "vendors",
          "vendorName"
      )
      .populate(
        "items.material",
        "materialCode materialName unit currentStock"
      );

    return res.status(200).json({
      success: true,
      message: "RFQ status updated successfully.",
      rfq: updatedRFQ,
    });
  } catch (error) {
    console.error("Update RFQ Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update RFQ status.",
      error: error.message,
    });
  }
};

// ==============================================
// Export Controllers
// ==============================================
module.exports = {
  createRequestForQuotation,
  getAllRequestForQuotations,
  getRequestForQuotationById,
  updateRequestForQuotation,
  deleteRequestForQuotation,
  updateRequestForQuotationStatus,
};