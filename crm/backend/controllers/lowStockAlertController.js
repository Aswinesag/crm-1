const Material = require("../models/Material");

const getLowStockMaterials = async (req, res) => {
  try {
    const lowStockMaterials = await Material.find({

      status: "Active",

      $expr: {
        $lte: ["$currentStock", "$reorderLevel"],
      },
    }).sort({ currentStock: 1 });


    res.status(200).json({
      success: true,
      count: lowStockMaterials.length,
      data: lowStockMaterials,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getLowStockMaterials,
};