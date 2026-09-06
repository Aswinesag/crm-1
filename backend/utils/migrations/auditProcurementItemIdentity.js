require("dotenv").config();
const mongoose = require("mongoose");

// Read-only audit: this script reports legacy identities and never updates data.
const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = new Set((await db.listCollections().toArray()).map((entry) => entry.name));
  const ids = {};
  for (const [type, name] of [["Product", "products"], ["RawMaterial", "rawmaterials"], ["Component", "components"]]) ids[type] = collections.has(name) ? new Set((await db.collection(name).find({}, { projection: { _id: 1 } }).toArray()).map((row) => String(row._id))) : new Set();
  const classify = (id) => { const matches = Object.entries(ids).filter(([, values]) => values.has(String(id))).map(([type]) => type); return matches.length === 1 ? { status: "resolvable", itemType: matches[0] } : { status: matches.length ? "ambiguous" : "unresolved", itemType: null }; };
  const report = { dryRun: true, generatedAt: new Date().toISOString(), records: [] };
  for (const collectionName of ["purchaseorders", "purchaseorderses", "grns", "goodsreceiptnotes", "rfqs", "vendormaterials", "stockissues"]) {
    if (!collections.has(collectionName)) continue;
    const rows = await db.collection(collectionName).find({}).toArray();
    for (const row of rows) (Array.isArray(row.items) ? row.items : [row]).forEach((line, index) => {
      const legacyId = line.materialId || line.material;
      if (legacyId && !(line.itemType && line.item)) report.records.push({ collection: collectionName, recordId: String(row._id), line: index, legacyField: line.materialId ? "materialId" : "material", legacyId: String(legacyId), ...classify(legacyId) });
    });
  }
  report.summary = report.records.reduce((result, row) => ({ ...result, [row.status]: (result[row.status] || 0) + 1 }), {});
  console.log(JSON.stringify(report, null, 2));
  await mongoose.disconnect();
};
main().catch((error) => { console.error(error); process.exitCode = 1; });
