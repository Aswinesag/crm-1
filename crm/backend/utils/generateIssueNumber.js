const StockIssue = require("../models/stockIssue/stockIssueModel");

const generateIssueNumber = async () => {
  const lastIssue =
    await StockIssue.findOne().sort({
      createdAt: -1,
    });

  if (!lastIssue) {
    return "ISS-1001";
  }

  const lastNumber = parseInt(
    lastIssue.issueNumber.split("-")[1]
  );

  return `ISS-${lastNumber + 1}`;
};

module.exports = generateIssueNumber;