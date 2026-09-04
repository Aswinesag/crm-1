const PurchaseRequisition =
  require("../models/PurchaseRequisition");

const generatePRNumber =
  async () => {
    const lastPR =
      await PurchaseRequisition.findOne()
        .sort({ createdAt: -1 });

    if (!lastPR) {
      return "PR-1001";
    }

    const lastNumber = parseInt(
      lastPR.prNumber.split("-")[1]
    );

    return `PR-${lastNumber + 1}`;
  };

module.exports =
  generatePRNumber;