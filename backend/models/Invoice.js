const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, trim: true, maxlength: 80 },
    productName: { type: String, required: true, trim: true, maxlength: 160 },
    quantity: { type: Number, required: true, min: 0.000001 },
    unit: { type: String, required: true, trim: true, maxlength: 30 },
    rate: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    gstPercent: { type: Number, required: true, min: 0, max: 100, default: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    invoiceDate: { type: Date, required: true },
    salesOrderNo: { type: String, required: true, trim: true, maxlength: 80 },
    customerName: { type: String, required: true, trim: true, maxlength: 160, index: true },
    customerEmail: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
    customerContact: { type: String, trim: true, maxlength: 30, default: "" },
    gstin: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
    billingAddress: { type: String, required: true, trim: true, maxlength: 1000 },
    shippingAddress: { type: String, required: true, trim: true, maxlength: 1000 },
    paymentTerms: { type: String, required: true, trim: true, maxlength: 120 },
    dueDate: { type: Date, required: true, index: true },
    items: { type: [invoiceItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    cgst: { type: Number, required: true, min: 0 },
    sgst: { type: Number, required: true, min: 0 },
    igst: { type: Number, required: true, min: 0, default: 0 },
    freightCharges: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0.01 },
    amountPaid: { type: Number, required: true, min: 0, default: 0 },
    balanceDue: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid", "Overdue"],
      default: "Unpaid",
      index: true,
    },
    currency: { type: String, enum: ["INR"], default: "INR", immutable: true },
    lastPaymentDate: { type: Date, default: null },
    paymentReferences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    invoiceType: { type: String, enum: ["Standard", "Subscription", "SubscriptionRenewal"], default: "Standard", index: true },
    subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", default: null },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, optimisticConcurrency: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
