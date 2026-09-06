require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const migration = require("../../services/procurementMigrationService");

const args = process.argv.slice(2), action = args[0] || "audit";
const option = (name, fallback = undefined) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : fallback; };
const flags = { apply: args.includes("--apply"), confirm: option("confirm"), mappingFile: option("mapping-file"), batchSize: Number(option("batch-size", 50)), outputDir: path.resolve(option("output-dir", path.join(process.cwd(), "reports", "procurement-identity-migration"))), backupFile: option("backup-file") };

const ensureTransactions = async (db) => { const session = db.client.startSession(); try { await session.withTransaction(async () => { await db.collection("migrationpreflights").findOne({}, { session }); }); } finally { await session.endSession(); } };
const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI); const db = mongoose.connection.db;
  if (action === "rollback") {
    if (!flags.backupFile) throw new Error("Rollback requires --backup-file");
    const backup = JSON.parse(fs.readFileSync(path.resolve(flags.backupFile), "utf8"));
    if (!flags.apply) { console.log(JSON.stringify({ dryRun: true, version: backup.version, wouldRestore: backup.records?.length || 0 }, null, 2)); return; }
    await ensureTransactions(db); console.log(JSON.stringify(await migration.rollback(db, flags.backupFile, flags), null, 2)); return;
  }
  const plan = await migration.survey(db, flags), report = migration.writeReports(plan, flags.outputDir);
  if (action === "verify") { const result = await migration.verify(db); fs.writeFileSync(path.join(flags.outputDir, "verification.json"), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result, null, 2)); return; }
  if (action === "migrate" && flags.apply) { await ensureTransactions(db); const result = await migration.apply(db, plan, flags); const verification = await migration.verify(db); fs.writeFileSync(path.join(flags.outputDir, "verification.json"), JSON.stringify(verification, null, 2)); console.log(JSON.stringify({ ...result, verification }, null, 2)); return; }
  console.log(JSON.stringify(report.summary, null, 2));
};
main().catch((error) => { console.error(`Migration ${action} failed: ${error.message}`); process.exitCode = 1; }).finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
