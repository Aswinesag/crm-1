require("dotenv").config();
const mongoose = require("mongoose");

const migratePaymentAttemptIndexes = async (collection) => {
  const indexes = await collection.indexes();
  const legacy = indexes.find((index) => index.name === "invoice_1" && index.unique);
  if (legacy) await collection.dropIndex("invoice_1");

  const current = await collection.indexes();
  if (!current.some((index) => index.name === "invoice_1")) {
    await collection.createIndex({ invoice: 1 }, { name: "invoice_1" });
  }
  if (!current.some((index) => index.name === "invoice_created_unique")) {
    await collection.createIndex(
      { invoice: 1 },
      { unique: true, name: "invoice_created_unique", partialFilterExpression: { status: "Created", invoice: { $type: "objectId" } } }
    );
  }
  if (!current.some((index) => index.name === "invoice_paid_unique")) {
    await collection.createIndex(
      { invoice: 1 },
      { unique: true, name: "invoice_paid_unique", partialFilterExpression: { status: "Paid", invoice: { $type: "objectId" } } }
    );
  }
  await collection.createIndex({ status: 1, attemptExpiresAt: 1 }, { name: "status_1_attemptExpiresAt_1" });
  return collection.indexes();
};

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const indexes = await migratePaymentAttemptIndexes(mongoose.connection.collection("payments"));
    console.log("Payment attempt index migration complete:", indexes.map((index) => index.name).join(", "));
    await mongoose.disconnect();
  })().catch((error) => {
    console.error("Payment attempt index migration failed:", error.message);
    process.exit(1);
  });
}

module.exports = { migratePaymentAttemptIndexes };
