const Material = require("../../models/Material");
const Warehouse = require("../../models/Warehouse");
const Inventory = require("../../models/Inventory");
const StockMovement = require("../../models/inventory/stockMovementModel");
const GRN = require("../../models/grn/grnModel");

const getInventoryDashboard = async (req, res) => {
  try {
    const totalMaterials =
      await Material.countDocuments();

    const totalWarehouses =
      await Warehouse.countDocuments();

    const stockSummary =
      await Inventory.aggregate([
        {
          $group: {
            _id: null,
            totalStock: {
              $sum: "$currentStock"
            }
          }
        }
      ]);

    const totalStock =
      stockSummary.length
        ? stockSummary[0].totalStock
        : 0;

    const lowStockMaterials =
      await Material.find({
        $expr: {
          $lte: [
            "$currentStock",
            "$minimumStock"
          ]
        }
      });

    const outOfStockMaterials =
      await Material.find({
        currentStock: 0
      });

    const recentMovements =
      await StockMovement.find()
        .populate("material")
        .sort({ createdAt: -1 })
        .limit(10);

    const recentGRNs =
      await GRN.find()
        .populate("purchaseOrder")
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(200).json({
      success: true,
      dashboard: {
        totalMaterials,
        totalWarehouses,
        totalStock,

        lowStockCount:
          lowStockMaterials.length,

        outOfStockCount:
          outOfStockMaterials.length,

        lowStockMaterials,

        recentMovements,

        recentGRNs
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getInventoryDashboard
};