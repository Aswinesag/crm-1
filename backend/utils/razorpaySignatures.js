const crypto = require("crypto");

const safeHmacMatch = (payload, suppliedSignature, secret) => {
  if (!secret || !Buffer.isBuffer(payload) || typeof suppliedSignature !== "string") return false;
  if (!/^[a-f0-9]{64}$/i.test(suppliedSignature)) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(suppliedSignature, "hex");
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
};

const checkoutSignatureMatches = (orderId, paymentId, signature, secret) =>
  safeHmacMatch(Buffer.from(`${orderId}|${paymentId}`, "utf8"), signature, secret);

const webhookSignatureMatches = (rawBody, signature, secret) =>
  safeHmacMatch(rawBody, signature, secret);

module.exports = { checkoutSignatureMatches, webhookSignatureMatches };
