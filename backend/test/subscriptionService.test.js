const test = require("node:test");
const assert = require("node:assert/strict");
const { addMonthsClamped } = require("../services/subscriptionService");
const { selectRenewalStage } = require("../services/subscriptionReminderService");

test("calculates six and twelve month subscription periods", () => {
  assert.equal(addMonthsClamped(new Date("2026-01-15T00:00:00Z"), 6).toISOString(), "2026-07-15T00:00:00.000Z");
  assert.equal(addMonthsClamped(new Date("2026-01-15T00:00:00Z"), 12).toISOString(), "2027-01-15T00:00:00.000Z");
});
test("clamps month-end and preserves leap-year dates", () => {
  assert.equal(addMonthsClamped(new Date("2026-08-31T00:00:00Z"), 6).toISOString(), "2027-02-28T00:00:00.000Z");
  assert.equal(addMonthsClamped(new Date("2024-02-29T00:00:00Z"), 12).toISOString(), "2025-02-28T00:00:00.000Z");
});
test("rejects unsupported subscription durations", () => assert.throws(() => addMonthsClamped(new Date(), 3), /Invalid/));
test("selects every requested renewal reminder stage without catch-up spam", () => {
  for (const days of [60, 30, 15, 7, 3, 1]) assert.equal(selectRenewalStage(days), `${days}_DAY`);
  assert.equal(selectRenewalStage(0), "EXPIRY");
  assert.equal(selectRenewalStage(61), null);
  assert.equal(selectRenewalStage(10), "15_DAY");
});
