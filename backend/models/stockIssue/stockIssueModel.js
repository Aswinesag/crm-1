const mongoose = require("mongoose");

const stockIssueItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const stockIssueSchema = new mongoose.Schema(
  {
    issueNumber: {
      type: String,
      unique: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    issuedTo: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    items: [stockIssueItemSchema],

    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StockIssue",
  stockIssueSchema
);