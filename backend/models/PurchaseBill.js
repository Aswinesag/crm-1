const mongoose = require("mongoose");

const ITEM_TYPES = ["Product", "RawMaterial", "Component"];
const EXCEPTION_CODES = ["QUANTITY_EXCEEDS_RECEIPT", "QUANTITY_EXCEEDS_PO", "PRICE_MISMATCH", "DUPLICATE_INVOICE", "NO_RECEIPT", "PO_CANCELLED", "SUPPLIER_MISMATCH", "ITEM_IDENTITY_MISMATCH", "INVALID_PO_LINE", "OVERBILLED"];

const reasonSchema = new mongoose.Schema({ code: { type: String, enum: EXCEPTION_CODES, required: true }, message: { type: String, required: true, trim: true } }, { _id: false });
const matchResultSchema = new mongoose.Schema({
  orderedQuantity: Number, receivedQuantity: Number, previouslyBilledQuantity: Number, remainingBillableQuantity: Number,
  quantityVariance: Number, poUnitPriceMinor: Number, billedUnitPriceMinor: Number, priceVarianceMinor: Number,
  priceVariancePercent: Number, status: { type: String, enum: ["MATCHED", "EXCEPTION"], required: true }, reasons: [reasonSchema],
}, { _id: false });
const lineSchema = new mongoose.Schema({
  poLineId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ITEM_TYPES, required: true }, item: { type: mongoose.Schema.Types.ObjectId, refPath: "itemType", required: true },
  itemCodeSnapshot: { type: String, trim: true, default: "" }, itemNameSnapshot: { type: String, trim: true, default: "" }, unitSnapshot: { type: String, trim: true, default: "" },
  quantity: { type: Number, required: true, min: 0.000001 }, unitPriceMinor: { type: Number, required: true, min: 0 },
  discountMinor: { type: Number, min: 0, default: 0 }, taxMinor: { type: Number, min: 0, default: 0 },
  subtotalMinor: { type: Number, min: 0, default: 0 }, totalMinor: { type: Number, min: 0, default: 0 }, matchResult: matchResultSchema,
}, { _id: true });
const auditSchema = new mongoose.Schema({ action: { type: String, required: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, at: { type: Date, default: Date.now }, reason: { type: String, trim: true, default: "" } }, { _id: true });
const historySchema = new mongoose.Schema({ checkedAt: Date, checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, matchStatus: String, totalExceptions: Number, lines: [matchResultSchema] }, { _id: true });

const schema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  supplierInvoiceNumber: { type: String, required: true, trim: true }, normalizedSupplierInvoiceNumber: { type: String, required: true, trim: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true }, purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true, index: true },
  currency: { type: String, enum: ["INR"], default: "INR" }, invoiceDate: { type: Date, required: true }, dueDate: { type: Date, default: null }, notes: { type: String, trim: true, maxlength: 2000, default: "" },
  lines: { type: [lineSchema], validate: [(v) => v.length > 0, "At least one bill line is required"] },
  subtotalMinor: { type: Number, min: 0, default: 0 }, discountTotalMinor: { type: Number, min: 0, default: 0 }, taxTotalMinor: { type: Number, min: 0, default: 0 }, grandTotalMinor: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"], default: "DRAFT", index: true },
  matchStatus: { type: String, enum: ["NOT_CHECKED", "MATCHED", "EXCEPTION"], default: "NOT_CHECKED", index: true },
  matchSummary: { quantityMatched: { type: Boolean, default: false }, priceMatched: { type: Boolean, default: false }, duplicateInvoice: { type: Boolean, default: false }, totalExceptions: { type: Number, default: 0 }, checkedAt: Date },
  grnsConsidered: [{ type: mongoose.Schema.Types.ObjectId, ref: "GRN" }], reservationActive: { type: Boolean, default: false, index: true },
  accountsPayable: { type: mongoose.Schema.Types.ObjectId, ref: "AccountsPayable", default: null }, paymentStatus: { type: String, enum: ["UNPAID", "PARTIALLY_PAID", "PAID"], default: "UNPAID", index: true }, paidAmountMinor: { type: Number, min: 0, default: 0 }, outstandingAmountMinor: { type: Number, min: 0, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, submittedAt: Date, submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, approvedAt: Date, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, rejectedAt: Date, rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, rejectionReason: String,
  exceptionOverride: { approved: { type: Boolean, default: false }, reason: String, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, approvedAt: Date },
  auditTrail: [auditSchema], matchHistory: [historySchema],
}, { timestamps: true, optimisticConcurrency: true });

schema.index({ supplier: 1, normalizedSupplierInvoiceNumber: 1 }, { unique: true });
schema.index({ purchaseOrder: 1, reservationActive: 1 });
schema.index({ invoiceDate: -1 });

module.exports = mongoose.models.PurchaseBill || mongoose.model("PurchaseBill", schema);
module.exports.EXCEPTION_CODES = EXCEPTION_CODES;
