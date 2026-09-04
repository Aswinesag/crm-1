const Material = require("../../models/Material");
const Vendor = require("../../models/Vendor");
const Warehouse = require("../../models/Warehouse");
const PurchaseOrder = require("../../models/PurchaseOrders");
const PurchaseRequisition = require("../../models/PurchaseRequisitions");
const GoodsReceiptNote = require("../../models/grn/grnModel");
const Inventory = require("../../models/Inventory");
const StockTransaction = require("../../models/StockTransaction");
const ActivityLog = require("../../models/ActivityLog");

exports.getERPSummary = async (req, res) => {
  try {

    const totalMaterials =
      await Material.countDocuments();

    const totalVendors =
      await Vendor.countDocuments();

    const totalWarehouses =
      await Warehouse.countDocuments();

    const totalInventoryRecords =
      await Inventory.countDocuments();

    const totalPOs =
      await PurchaseOrder.countDocuments();

    const totalPRs =
      await PurchaseRequisition.countDocuments();

    const totalGRNs =
      await GoodsReceiptNote.countDocuments();

    const inventoryValueResult =
  await Material.aggregate([
    {
      $group: {
        _id: null,
        totalInventoryValue: {
          $sum: {
            $multiply: [
              "$currentStock",
              "$unitPrice"
            ]
          }
        }
      }
    }
  ]);

const totalInventoryValue =
  inventoryValueResult[0]
    ?.totalInventoryValue || 0;

  const lowStockMaterials =
  await Material.countDocuments({
    $expr: {
      $lte: [
        "$currentStock",
        "$reorderLevel"
      ]
    }
  });

const outOfStockMaterials =
  await Material.countDocuments({
    currentStock: 0
  });

  const lowStockItems =
  await Material.find({
    $expr: {
      $lte: [
        "$currentStock",
        "$reorderLevel"
      ]
    }
  })
  .select(
    "materialName currentStock reorderLevel"
  )
  .limit(5);

  const recentActivities =
  await ActivityLog.find({
    type: {
      $in: [
        "PR_CREATED",
        "PO_CREATED",
        "PO_STATUS_UPDATED",
        "GRN_CREATED",
        "STOCK_IN",
        "STOCK_OUT"
      ]
    }
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .select(
    "type description user createdAt"
  );

  // INVENTORY TREND

const inventoryTrend = [
  {
    month: "Current",
    stock: totalInventoryValue
  }
];

const categoryDistribution =
  await Material.aggregate([
    {
      $group: {
        _id: "$category",
        value: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: 1
      }
    }
  ]);

  console.log("Recent Activities:", recentActivities);

    res.status(200).json({
      success: true,
      data: {
        totalMaterials,
        totalVendors,
        totalWarehouses,
        totalInventoryRecords,
        totalPOs,
        totalPRs,
        totalGRNs,
        lowStockMaterials,
        outOfStockMaterials,
        totalInventoryValue,
        inventoryTrend,
        categoryDistribution,
        lowStockItems,
        recentActivities
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getPurchaseSummary = async (req, res) => {
  try {

    const pendingPR =
      await PurchaseRequisition.countDocuments({
        status: "PENDING"
      });

    const approvedPR =
      await PurchaseRequisition.countDocuments({
        status: "APPROVED"
      });

    const sentPO =
      await PurchaseOrder.countDocuments({
        status: "SENT"
      });

    const receivedPO =
      await PurchaseOrder.countDocuments({
        status: "RECEIVED"
      });

    res.status(200).json({
      success: true,
      data: {
        pendingPR,
        approvedPR,
        sentPO,
        receivedPO
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getWarehouseSummary =
  async (req, res) => {

    try {

      const warehouseData =
        await Inventory.aggregate([

          {
            $group: {

              _id: "$warehouseId",

              totalStock: {
                $sum: "$quantity"
              }

            }
          }

        ]);

      res.status(200).json({
        success: true,
        data: warehouseData
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }

};


exports.getTopVendors = async (req, res) => {
  try {

    const vendors =
      await PurchaseOrder.aggregate([
        {
          $group: {
            _id: "$vendorId",
            totalOrders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "vendors",
            localField: "_id",
            foreignField: "_id",
            as: "vendor"
          }
        },
        {
          $unwind: "$vendor"
        },
        {
          $project: {
            vendorName: "$vendor.vendorName",
            totalOrders: 1
          }
        },
        {
          $sort: {
            totalOrders: -1
          }
        },
        {
          $limit: 5
        }
      ]);

    res.status(200).json({
      success: true,
      data: vendors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};