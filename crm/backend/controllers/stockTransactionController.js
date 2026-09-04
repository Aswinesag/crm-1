const StockTransaction = require("../models/StockTransaction");

const getStockTransactions = async (req, res) => {
  try {
    // PAGE NUMBER
    const page = parseInt(req.query.page) || 1;

    // RECORDS PER PAGE
    const limit = parseInt(req.query.limit) || 10;

    // SKIP RECORDS
    const skip = (page - 1) * limit;

    // FILTER OBJECT
    let filter = {};

    // FILTER BY TRANSACTION TYPE
    if (req.query.transactionType) {
      filter.transactionType = req.query.transactionType;
    }

    // FILTER BY MATERIAL ID
    if (req.query.materialId) {
      filter.materialId = req.query.materialId;
    }

    // FETCH TRANSACTIONS
    const transactions = await StockTransaction.find(filter)
      .populate("materialId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // TOTAL RECORDS
    const total = await StockTransaction.countDocuments(filter);

    res.status(200).json({
      success: true,

      totalTransactions: total,

      currentPage: page,

      totalPages: Math.ceil(total / limit),

      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStockTransactions,
};