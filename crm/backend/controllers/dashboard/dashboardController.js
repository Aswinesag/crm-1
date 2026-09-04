const Material = require("../../models/Material");
const StockTransaction = require("../../models/StockTransaction");

exports.getDashboardSummary = async (req, res) => {
  try {

    const totalMaterials =
      await Material.countDocuments();

    const lowStockMaterials =
      await Material.countDocuments({
        $expr: {
          $lte: ["$currentStock", "$reorderLevel"]
        }
      });

    const outOfStockMaterials =
      await Material.countDocuments({
        currentStock: 0
      });

    const totalStockQuantityResult =
      await Material.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$currentStock"
            }
          }
        }
      ]);

    const totalStockQuantity =
      totalStockQuantityResult[0]?.total || 0;

    const totalStockValueResult =
      await Material.aggregate([
        {
          $group: {
            _id: null,
            totalValue: {
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

    const totalStockValue =
      totalStockValueResult[0]?.totalValue || 0;

    
    // Low Stock List

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


// Recent Activities

const recentActivities =
  await StockTransaction.find()
  .sort({ createdAt: -1 })
  .limit(5)
  .select(
    "transactionType quantity createdAt"
  );

const recentActivitiesFormatted =
  recentActivities.map(item => ({

    type:
      item.transactionType,

    description:
      `${item.quantity} units moved`

  }));


// Inventory Trend

const inventoryTrend =
  await StockTransaction.aggregate([

    {
      $group: {

        _id: {
          month: {
            $month: "$createdAt"
          }
        },

        stock: {
          $sum: "$quantity"
        }

      }
    },

    {
      $sort: {
        "_id.month": 1
      }
    }

  ]);

  const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const inventoryTrendFormatted =
  inventoryTrend.map(item => ({
    month: monthNames[item._id.month],
    stock: item.stock
  }));


// Category Distribution

const categoryDistribution =
  await Material.aggregate([

    {
      $group: {

        _id: "$category",

        value: {
          $sum: 1
        }

      }
    }

  ]);

  const categoryDistributionFormatted =
  categoryDistribution.map(item => ({
    name: item._id || "Other",
    value: item.value
  }));

   res.status(200).json({
  success: true,

  data: {

    totalMaterials,

    lowStockMaterials,

    outOfStockMaterials,

    totalStockQuantity,

    totalStockValue,

    inventoryTrend:
      inventoryTrendFormatted,

    categoryDistribution:
      categoryDistributionFormatted,

    recentActivities:
      recentActivitiesFormatted,

    lowStockItems

  }

});

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getRecentTransactions = async (req, res) => {
  try {

    const transactions =
      await StockTransaction.find()
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getStockOverview = async (req, res) => {
  try {

    const stockData =
      await StockTransaction.aggregate([
        {
          $group: {
            _id: "$transactionType",
            totalQuantity: {
              $sum: "$quantity"
            }
          }
        }
      ]);

    let stockIn = 0;
    let stockOut = 0;

    stockData.forEach((item) => {

      if (item._id === "IN") {
        stockIn = item.totalQuantity;
      }

      if (item._id === "OUT") {
        stockOut = item.totalQuantity;
      }

    });

    res.status(200).json({
      success: true,
      data: {
        stockIn,
        stockOut
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getTopMaterials = async (req, res) => {
  try {

    const topMaterials =
      await StockTransaction.aggregate([

        {
          $match: {
            transactionType: "OUT"
          }
        },

        {
          $group: {
            _id: "$materialId",
            totalUsed: {
              $sum: "$quantity"
            }
          }
        },

        {
          $sort: {
            totalUsed: -1
          }
        },

        {
          $limit: 5
        },

        {
          $lookup: {
            from: "materials",
            localField: "_id",
            foreignField: "_id",
            as: "materialDetails"
          }
        },

        {
          $unwind: "$materialDetails"
        },

        {
          $project: {
            _id: 0,
            materialId:
              "$materialDetails._id",

            materialName:
              "$materialDetails.materialName",

            materialCode:
              "$materialDetails.materialCode",

            totalUsed: 1
          }
        }

      ]);

    res.status(200).json({
      success: true,
      count: topMaterials.length,
      data: topMaterials
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getMonthlyReport = async (req, res) => {
  try {

    const monthlyReport =
      await StockTransaction.aggregate([

        {
          $group: {

            _id: {
              month: {
                $month: "$createdAt"
              }
            },

            stockIn: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$transactionType",
                      "IN"
                    ]
                  },
                  "$quantity",
                  0
                ]
              }
            },

            stockOut: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$transactionType",
                      "OUT"
                    ]
                  },
                  "$quantity",
                  0
                ]
              }
            }

          }
        },

        {
          $sort: {
            "_id.month": 1
          }
        },

        {
          $project: {
            _id: 0,
            month: "$_id.month",
            stockIn: 1,
            stockOut: 1
          }
        }

      ]);

    res.status(200).json({
      success: true,
      data: monthlyReport
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getLowStockDashboardList =
  async (req, res) => {

    try {

      const materials =
        await Material.find({
          $expr: {
            $lte: [
              "$currentStock",
              "$reorderLevel"
            ]
          }
        });

      const dashboardData =
        materials.map((material) => {

          let urgency = "Warning";

          if (
            material.currentStock <=
            material.reorderLevel / 2
          ) {
            urgency = "Critical";
          }

          return {

            materialId: material._id,

            materialName:
              material.materialName,

            materialCode:
              material.materialCode,

            currentStock:
              material.currentStock,

            reorderLevel:
              material.reorderLevel,

            urgency

          };

        });

      dashboardData.sort((a, b) => {

        if (
          a.urgency === "Critical" &&
          b.urgency !== "Critical"
        ) {
          return -1;
        }

        if (
          a.urgency !== "Critical" &&
          b.urgency === "Critical"
        ) {
          return 1;
        }

        return (
          a.currentStock -
          b.currentStock
        );

      });

      res.status(200).json({
        success: true,
        count: dashboardData.length,
        data: dashboardData
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }

};