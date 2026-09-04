const MONEY_SCALE = 100;

const roundMoney = (value) => Math.round((value + Number.EPSILON) * MONEY_SCALE) / MONEY_SCALE;

const requireFiniteNumber = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER, exclusiveMin = false } = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number) || (exclusiveMin ? number <= min : number < min) || number > max) {
    const error = new Error(`${field} is invalid`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

const calculateInvoiceTotals = (rawItems, rawFreightCharges = 0) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 500) {
    const error = new Error("Invoice must contain between 1 and 500 items");
    error.statusCode = 400;
    throw error;
  }

  let subtotal = 0;
  let totalGst = 0;
  const items = rawItems.map((rawItem, index) => {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem)) {
      const error = new Error(`Item ${index + 1} is invalid`);
      error.statusCode = 400;
      throw error;
    }
    const productCode = String(rawItem.productCode || "").trim().slice(0, 80);
    const productName = String(rawItem.productName || "").trim().slice(0, 160);
    const unit = String(rawItem.unit || "Nos").trim().slice(0, 30);
    if (!productCode || !productName || !unit) {
      const error = new Error(`Item ${index + 1} requires product code, product name, and unit`);
      error.statusCode = 400;
      throw error;
    }

    const quantity = requireFiniteNumber(rawItem.quantity, `Item ${index + 1} quantity`, {
      min: 0,
      max: 1000000,
      exclusiveMin: true,
    });
    const rate = requireFiniteNumber(rawItem.rate, `Item ${index + 1} rate`, { max: 100000000 });
    const discount = requireFiniteNumber(rawItem.discount ?? 0, `Item ${index + 1} discount`, { max: 100000000000 });
    const gstPercent = requireFiniteNumber(rawItem.gstPercent ?? 0, `Item ${index + 1} GST`, { max: 100 });
    const gross = roundMoney(quantity * rate);
    if (discount > gross) {
      const error = new Error(`Item ${index + 1} discount cannot exceed its gross amount`);
      error.statusCode = 400;
      throw error;
    }
    const taxableAmount = roundMoney(gross - discount);
    const gstAmount = roundMoney((taxableAmount * gstPercent) / 100);
    const amount = roundMoney(taxableAmount + gstAmount);
    subtotal = roundMoney(subtotal + taxableAmount);
    totalGst = roundMoney(totalGst + gstAmount);

    return { productCode, productName, quantity, unit, rate, discount, gstPercent, taxableAmount, gstAmount, amount };
  });

  const freightCharges = requireFiniteNumber(rawFreightCharges ?? 0, "Freight charges", { max: 100000000 });
  const cgst = roundMoney(totalGst / 2);
  const sgst = roundMoney(totalGst - cgst);
  const igst = 0;
  const grandTotal = roundMoney(subtotal + cgst + sgst + igst + freightCharges);
  if (grandTotal <= 0) {
    const error = new Error("Invoice grand total must be greater than zero");
    error.statusCode = 400;
    throw error;
  }
  return { items, subtotal, cgst, sgst, igst, freightCharges: roundMoney(freightCharges), grandTotal };
};

module.exports = { calculateInvoiceTotals, roundMoney };
