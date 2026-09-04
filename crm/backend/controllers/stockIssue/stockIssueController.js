const StockIssue = require(
  "../../models/stockIssue/stockIssueModel"
);

const Inventory = require("../../models/Inventory");


const StockMovement = require(
  "../../models/inventory/stockMovementModel"
);

const generateIssueNumber = require(
  "../../utils/generateIssueNumber"
);

const createStockIssue = async (
  req,
  res
) => {
  try {
    const {
      issuedTo,
      department,
      items,
      remarks,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items required",
      });
    }

    const issueNumber =
      await generateIssueNumber();

    const allInventory =
      await Inventory.find();

    console.log(
      "ALL INVENTORY RECORDS:"
    );

    console.log(
      JSON.stringify(
        allInventory,
        null,
        2
      )
    );

    for (const item of items) {

  console.log(
    "MATERIAL RECEIVED:",
    item.material
  );

  const inventory =
    await Inventory.findOne({
      materialId: item.material,
    });

  console.log(
    "INVENTORY RESULT:",
    inventory
  );

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message:
        "Inventory not found",
    });
  }

 if (
  inventory.quantity <
  item.quantity
) {
    return res.status(400).json({
      success: false,
      message:
        "Insufficient stock",
    });
  }
}

    const stockIssue =
      await StockIssue.create({
        issueNumber,
        issuedTo,
        department,
        items,
        remarks,
      });

    for (const item of items) {

  const inventory =
    await Inventory.findOne({
      materialId: item.material,
    });

  const beforeStock =
    inventory.quantity;

  inventory.quantity -=
    item.quantity;

  const afterStock =
    inventory.quantity;

  await inventory.save();

  await StockMovement.create({
    material: item.material,

    movementType:
      "PRODUCTION_CONSUMPTION",

    direction: "OUT",

    quantity: item.quantity,

    beforeStock,

    afterStock,

    referenceModel:
      "StockIssue",

    referenceId:
      stockIssue._id,

    remarks:
      "Material Issued To Production",
  });
}

    res.status(201).json({
      success: true,
      data: stockIssue,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllStockIssues =
  async (req, res) => {
    try {
      const issues =
        await StockIssue.find()
          .populate(
            "items.material"
          );

      res.status(200).json({
        success: true,
        count: issues.length,
        data: issues,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  const getStockIssueById =
  async (req, res) => {
    try {
      const issue =
        await StockIssue.findById(
          req.params.id
        ).populate(
          "items.material"
        );

      if (!issue) {
        return res.status(404).json({
          success: false,
          message:
            "Issue not found",
        });
      }

      res.status(200).json({
        success: true,
        data: issue,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  module.exports = {
  createStockIssue,
  getAllStockIssues,
  getStockIssueById,
};