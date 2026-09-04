const PurchaseOrder = require("../models/PurchaseOrders");

// ======================================================
// Generate Next Purchase Order Number
// Example:
// PO-2026-001
// PO-2026-002
// PO-2026-003
// ======================================================
const generatePONumber = async () => {
  try {
    const currentYear = new Date().getFullYear();

    const lastPO = await PurchaseOrder.findOne()
      .sort({ createdAt: -1 })
      .select("poNumber");

    // First Purchase Order
    if (!lastPO) {
      return `PO-${currentYear}-001`;
    }

    // Extract sequence number
    const parts = lastPO.poNumber.split("-");
    const lastSequence = parseInt(parts[2], 10) || 0;

    const nextSequence = String(lastSequence + 1).padStart(3, "0");

    return `PO-${currentYear}-${nextSequence}`;
  } catch (error) {
    throw new Error("Failed to generate Purchase Order Number.");
  }
};

// ======================================================
// Create Purchase Order
// POST /api/purchase-orders
// ======================================================
const createPurchaseOrder = async (req, res) => {
  try {
    const {
      supplier,
      supplierGST,
      deliveryDate,
      paymentTerms,
      deliveryAddress,
      transportCharges = 0,
      remarks,
      createdBy,
      items,
    } = req.body;

    // ================================
    // Validation
    // ================================
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required.",
      });
    }

    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery Date is required.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required.",
      });
    }

    // ================================
    // Calculate Totals
    // ================================
    let subTotal = 0;
    let gstAmount = 0;

    const orderItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const discount = Number(item.discount || 0);
      const gst = Number(item.gst || 0);

      const amount = quantity * unitPrice - discount;
      const gstValue = (amount * gst) / 100;

      subTotal += amount;
      gstAmount += gstValue;

      return {
        material: item.material,
        quantity,
        unit: item.unit,
        unitPrice,
        discount,
        gst,
        amount,
      };
    });

    const grandTotal =
      subTotal + gstAmount + Number(transportCharges || 0);

    // ================================
    // Generate PO Number
    // ================================
    const poNumber = await generatePONumber();

    // ================================
    // Create Purchase Order
    // ================================
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      supplier,
      supplierGST,
      deliveryDate,
      paymentTerms,
      deliveryAddress,
      transportCharges,
      remarks,
      createdBy,
      items: orderItems,
      subTotal,
      gstAmount,
      grandTotal,
    });

    // ================================
    // Populate Data
    // ================================
    const populatedPO = await PurchaseOrder.findById(
      purchaseOrder._id
    )
      .populate("supplier", "vendorName vendorCode gstNumber")
      .populate("items.material", "materialCode materialName");

    return res.status(201).json({
      success: true,
      message: "Purchase Order created successfully.",
      data: populatedPO,
    });
  } catch (error) {
    console.error("Create Purchase Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Purchase Order.",
      error: error.message,
    });
  }
};

// ======================================================
// Get All Purchase Orders
// GET /api/purchase-orders
// ======================================================
const getPurchaseOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const query = {};

    // ================================
    // Search by PO Number
    // ================================
    if (search) {
      query.poNumber = {
        $regex: search,
        $options: "i",
      };
    }

    // ================================
    // Filter by Status
    // ================================
    if (status) {
      query.status = status;
    }

    const total = await PurchaseOrder.countDocuments(query);

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate("supplier", "vendorName vendorCode")
      .populate("items.material", "materialCode materialName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      count: purchaseOrders.length,
      data: purchaseOrders,
    });
  } catch (error) {
    console.error("Get Purchase Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Purchase Orders.",
      error: error.message,
    });
  }
};
// ======================================================
// Get Purchase Order By ID
// GET /api/purchase-orders/:id
// ======================================================
const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate("supplier", "vendorName vendorCode gstNumber email phone")
      .populate("items.material", "materialCode materialName unit");

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    console.error("Get Purchase Order By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Purchase Order.",
      error: error.message,
    });
  }
};

// ======================================================
// Update Purchase Order
// PUT /api/purchase-orders/:id
// ======================================================
const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found.",
      });
    }

    const {
      supplier,
      supplierGST,
      deliveryDate,
      paymentTerms,
      deliveryAddress,
      transportCharges = 0,
      remarks,
      status,
      items,
    } = req.body;

    console.log("==================================");
    console.log("Full Request Body:");
    console.log(req.body);

    console.log("Status received:", status);
    console.log("==================================");

    // ================================
    // Validation
    // ================================
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required.",
      });
    }

    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery Date is required.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required.",
      });
    }

    // ================================
    // Recalculate Totals
    // ================================
    let subTotal = 0;
    let gstAmount = 0;

    const updatedItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const discount = Number(item.discount || 0);
      const gst = Number(item.gst || 0);

      const amount = quantity * unitPrice - discount;
      const gstValue = (amount * gst) / 100;

      subTotal += amount;
      gstAmount += gstValue;

      return {
        material: item.material,
        quantity,
        unit: item.unit,
        unitPrice,
        discount,
        gst,
        amount,
      };
    });

    const grandTotal =
      subTotal + gstAmount + Number(transportCharges || 0);

    // ================================
    // Update Purchase Order
    // ================================
    purchaseOrder.supplier = supplier;
    purchaseOrder.supplierGST = supplierGST;
    purchaseOrder.deliveryDate = deliveryDate;
    purchaseOrder.paymentTerms = paymentTerms;
    purchaseOrder.deliveryAddress = deliveryAddress;
    purchaseOrder.transportCharges = transportCharges;
    purchaseOrder.remarks = remarks;

    if (status) {
      purchaseOrder.status = status;
    }

    purchaseOrder.items = updatedItems;
    purchaseOrder.subTotal = subTotal;
    purchaseOrder.gstAmount = gstAmount;
    purchaseOrder.grandTotal = grandTotal;

    await purchaseOrder.save();

    const updatedPurchaseOrder = await PurchaseOrder.findById(id)
      .populate("supplier", "vendorName vendorCode gstNumber email phone")
      .populate("items.material", "materialCode materialName unit");

    return res.status(200).json({
      success: true,
      message: "Purchase Order updated successfully.",
      data: updatedPurchaseOrder,
    });
  } catch (error) {
    console.error("Update Purchase Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order.",
      error: error.message,
    });
  }
};
// ======================================================
// Delete Purchase Order
// DELETE /api/purchase-orders/:id
// ======================================================
const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found.",
      });
    }

    await PurchaseOrder.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Purchase Order deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Purchase Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Purchase Order.",
      error: error.message,
    });
  }
};

// ======================================================
// Update Purchase Order Status
// PATCH /api/purchase-orders/:id/status
// ======================================================
const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Draft",
      "Pending",
      "Approved",
      "Sent",
      "Partially Received",
      "Completed",
      "Cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Purchase Order status.",
      });
    }

    const purchaseOrder = await PurchaseOrder.findById(id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found.",
      });
    }

    purchaseOrder.status = status;

    await purchaseOrder.save();

    return res.status(200).json({
      success: true,
      message: "Purchase Order status updated successfully.",
      data: purchaseOrder,
    });
  } catch (error) {
    console.error("Update Purchase Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Purchase Order status.",
      error: error.message,
    });
  }
};

// ======================================================
// Export Controllers
// ======================================================
module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
};