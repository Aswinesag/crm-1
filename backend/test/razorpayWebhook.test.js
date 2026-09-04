const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const { webhookSignatureMatches } = require("../utils/razorpaySignatures");
const { extractSuccessfulPayment } = require("../controllers/razorpayWebhookController");

const secret = "test_webhook_secret";
const rawBody = Buffer.from('{"event":"payment.captured"}');
const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

test("accepts a valid raw-body webhook signature", () => {
  assert.equal(webhookSignatureMatches(rawBody, validSignature, secret), true);
});

test("rejects invalid, missing and malformed webhook signatures", () => {
  assert.equal(webhookSignatureMatches(rawBody, "0".repeat(64), secret), false);
  assert.equal(webhookSignatureMatches(rawBody, undefined, secret), false);
  assert.equal(webhookSignatureMatches(rawBody, "not-hex", secret), false);
});

test("extracts authoritative captured-payment fields", () => {
  const result = extractSuccessfulPayment({
    event: "payment.captured",
    payload: { payment: { entity: {
      id: "pay_test", order_id: "order_test", status: "captured", captured: true,
      amount: 2460000, currency: "INR", created_at: 1_700_000_000,
    } } },
  });
  assert.deepEqual(
    { paymentId: result.paymentId, orderId: result.orderId, amountPaise: result.amountPaise, currency: result.currency },
    { paymentId: "pay_test", orderId: "order_test", amountPaise: 2460000, currency: "INR" }
  );
});

test("validates order.paid association and status", () => {
  const payload = {
    event: "order.paid",
    payload: {
      order: { entity: { id: "order_test", status: "paid" } },
      payment: { entity: { id: "pay_test", order_id: "order_test", status: "captured", captured: true, amount: 100, currency: "INR" } },
    },
  };
  assert.equal(extractSuccessfulPayment(payload).orderId, "order_test");
  payload.payload.order.entity.id = "order_other";
  assert.throws(() => extractSuccessfulPayment(payload), /associations conflict/);
});

test("rejects uncaptured, malformed, and unsupported financial payloads", () => {
  const payment = { id: "pay_test", order_id: "order_test", status: "created", captured: false, amount: 100, currency: "INR" };
  assert.throws(() => extractSuccessfulPayment({ event: "payment.captured", payload: { payment: { entity: payment } } }), /captured payment/);
  payment.status = "captured";
  payment.captured = true;
  payment.amount = 1.5;
  assert.throws(() => extractSuccessfulPayment({ event: "payment.captured", payload: { payment: { entity: payment } } }), /financial data/);
  payment.amount = 100;
  payment.currency = "USD";
  assert.throws(() => extractSuccessfulPayment({ event: "payment.captured", payload: { payment: { entity: payment } } }), /financial data/);
});
