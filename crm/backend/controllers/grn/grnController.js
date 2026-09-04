const GRN = require("../../models/grn/grnModel");
const PurchaseOrder = require("../../models/purchaseOrders");
const { processStockMovement,} = require("../../services/inventoryService");

// =============================================
// CREATE GRN
// =============================================
const createGRN = async (req, res) => {
  try {
    const {
      purchaseOrder,
      items,
      remarks,
      deliveryDate,
    } = req.body;

    // =============================================
    // VALIDATION
    // =============================================
    if (!purchaseOrder) {
      return res.status(400).json({
        success: false,
        message: "Purchase Order is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "GRN items are required",
      });
    }

    // =============================================
    // FETCH PURCHASE ORDER
    // =============================================
   const po = await PurchaseOrder.findById(
      purchaseOrder
    );

    if (!po) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found",
      });
    }

    const warehouseId = po.warehouseId;

    // =============================================
    // PREVENT RECEIVED/CANCELLED PO
    // =============================================
    if (
      po.status === "RECEIVED" ||
      po.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot create GRN for this PO",
      });
    }

    // =============================================
    // PREPARE GRN ITEMS
    // =============================================
    const grnItems = [];

    for (const incomingItem of items) {
      // =============================================
// DEBUG LOGS
// =============================================
console.log("=================================");
console.log("CHECKING NEW GRN ITEM");
console.log("GRN MATERIAL =>", incomingItem.materialId);

po.items.forEach((item) => {
  console.log(
    "PO MATERIAL =>",
    item.materialId.toString()
  );

  console.log(
    "GRN MATERIAL =>",
    incomingItem.materialId.toString()
  );
});

// =============================================
// FIND MATCHING PO ITEM
// =============================================

console.log(
  JSON.stringify(po.items, null, 2)
);

const poItem = po.items.find((item) => {
  return (
    item.materialId &&
    incomingItem.materialId &&
    item.materialId.toString() ===
      incomingItem.materialId.toString()
  );
});

      if (!poItem) {
        return res.status(400).json({
          success: false,
          message:
            "Material not found in Purchase Order",
        });
      }

      // =============================================
      // CURRENT VALUES
      // =============================================
      const alreadyReceived =
        poItem.receivedQuantity || 0;

      const incomingQty =
        Number(
          incomingItem.quantityReceived
        );

      const totalReceived =
        alreadyReceived + incomingQty;

      // =============================================
      // OVER RECEIVING VALIDATION
      // =============================================
      if (
        totalReceived > poItem.quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Received quantity exceeded for material ${incomingItem.materialId}`,
        });
      }

      // =============================================
      // UPDATE PO ITEM
      // =============================================
      poItem.receivedQuantity =
        totalReceived;

      poItem.pendingQuantity =
        poItem.quantity - totalReceived;

      // =============================================
      // FULLY RECEIVED CHECK
      // =============================================
      if (
        poItem.receivedQuantity >=
        poItem.quantity
      ) {
        poItem.isFullyReceived = true;
      }

      // =============================================
      // CREATE GRN ITEM
      // =============================================
      grnItems.push({
        materialId:
          incomingItem.materialId,

        orderedQuantity:
          poItem.quantity,

        quantityReceived:
          incomingItem.quantityReceived,

        acceptedQuantity:
          incomingItem.acceptedQuantity,

        rejectedQuantity:
          incomingItem.rejectedQuantity || 0,

        unitPrice:
          poItem.unitPrice,

        remarks:
          incomingItem.remarks || "",
      });
    }

    // =============================================
    // UPDATE PO STATUS
    // =============================================
    let fullyReceived = true;

    po.items.forEach((item) => {
      if (!item.isFullyReceived) {
        fullyReceived = false;
      }
    });

    if (fullyReceived) {
      po.status = "RECEIVED";
      po.isCompleted = true;
    } else {
      po.status =
        "PARTIALLY_RECEIVED";
    }

    // =============================================
    // SAVE PURCHASE ORDER
    // =============================================
    await po.save();

    // =============================================
    // GENERATE GRN NUMBER
    // =============================================
    const count =
      await GRN.countDocuments();

    const grnNumber = `GRN-${
      count + 1
    }`;

    // =============================================
    // CREATE GRN
    // =============================================
    const grn = await GRN.create({
      grnNumber,
      purchaseOrder:
        po._id,

      vendor:
        po.vendorId,

      items: grnItems,

      remarks,

      deliveryDate,

      createdBy: req.user._id,
    });

    // =============================================
// UPDATE INVENTORY & CREATE STOCK MOVEMENTS
// =============================================
for (const item of grn.items) {
  const acceptedQty =
    Number(item.acceptedQuantity) || 0;

  if (acceptedQty > 0) {
    await processStockMovement({
      materialId: item.materialId,

      warehouseId: po.warehouseId,

      quantity: acceptedQty,

      movementType: "GRN_RECEIPT",

      direction: "IN",

      referenceModel: "GRN",

      referenceId: grn._id,

      remarks: `GRN ${grn.grnNumber}`,

      userId: req.user._id,
    });
  }
}

    // =============================================
    // RESPONSE
    // =============================================
    res.status(201).json({
      success: true,
      message:
        "GRN created successfully",
      data: grn,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// GET ALL GRNS
// =============================================
const getAllGRNs = async (
  req,
  res
) => {
  try {
    const grns = await GRN.find()
      .populate(
        "purchaseOrder"
      )
      .populate("vendor")
      .populate(
        "items.materialId"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: grns.length,
      data: grns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// GET SINGLE GRN
// =============================================
const getSingleGRN = async (
  req,
  res
) => {
  try {
    const grn =
      await GRN.findById(
        req.params.id
      )
        .populate(
          "purchaseOrder"
        )
        .populate("vendor")
        .populate(
          "items.material"
        );

    if (!grn) {
      return res.status(404).json({
        success: false,
        message:
          "GRN not found",
      });
    }

    res.status(200).json({
      success: true,
      data: grn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// UPDATE GRN
// =============================================
const updateGRN = async (
  req,
  res
) => {
  try {
    const grn =
      await GRN.findById(
        req.params.id
      );

    if (!grn) {
      return res.status(404).json({
        success: false,
        message:
          "GRN not found",
      });
    }

    const updatedGRN =
      await GRN.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "purchaseOrder"
        )
        .populate("vendor")
        .populate(
          "items.material"
        );

    res.status(200).json({
      success: true,
      message:
        "GRN updated successfully",
      data: updatedGRN,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// DELETE GRN
// =============================================
const deleteGRN = async (
  req,
  res
) => {
  try {
    const grn =
      await GRN.findById(
        req.params.id
      );

    if (!grn) {
      return res.status(404).json({
        success: false,
        message:
          "GRN not found",
      });
    }

    await grn.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "GRN deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGRN,
  getAllGRNs,
  getSingleGRN,
  updateGRN,
  deleteGRN,
};