const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateInvoiceTotals } = require("../utils/invoiceCalculations");

test("calculates authoritative totals with deterministic GST splitting", () => {
  const totals = calculateInvoiceTotals([
    { productCode: "P1", productName: "Pump", quantity: 2, unit: "Nos", rate: 100, discount: 10, gstPercent: 18 },
  ], 5);
  assert.equal(totals.subtotal, 190);
  assert.equal(totals.cgst, 17.1);
  assert.equal(totals.sgst, 17.1);
  assert.equal(totals.grandTotal, 229.2);
  assert.equal(totals.items[0].amount, 224.2);
});

test("rejects invalid quantities, negative values, excessive discounts and malformed GST", () => {
  const base = { productCode: "P1", productName: "Pump", quantity: 1, unit: "Nos", rate: 100, discount: 0, gstPercent: 18 };
  assert.throws(() => calculateInvoiceTotals([{ ...base, quantity: 0 }]), /quantity is invalid/);
  assert.throws(() => calculateInvoiceTotals([{ ...base, rate: -1 }]), /rate is invalid/);
  assert.throws(() => calculateInvoiceTotals([{ ...base, discount: 101 }]), /discount cannot exceed/);
  assert.throws(() => calculateInvoiceTotals([{ ...base, gstPercent: "bad" }]), /GST is invalid/);
  assert.throws(() => calculateInvoiceTotals([{ ...base, rate: Infinity }]), /rate is invalid/);
});
