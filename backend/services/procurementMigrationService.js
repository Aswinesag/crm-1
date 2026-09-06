const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const VERSION = 1;
const ITEM_TYPES = ["Product", "RawMaterial", "Component"];
const TARGETS = { Product: "products", RawMaterial: "rawmaterials", Component: "components" };
const ACTIVE_COLLECTIONS = new Set(["purchaserequests", "purchaserequisitions", "rfqs", "purchaseorders", "grns", "vendormaterials"]);
const DEFERRED_COLLECTIONS = new Set(["vendors", "stockissues", "inventories", "stockmovements", "stocktransactions"]);
const norm = (value) => String(value || "").trim().toLowerCase();
const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const get = (object, dotted) => dotted.split(".").reduce((value, key) => value?.[key], object);
const set = (object, dotted, value) => { const keys = dotted.split("."), leaf = keys.pop(); let target = object; for (const key of keys) target = target[key] ??= {}; target[leaf] = value; };
const exists = (object, dotted) => { const keys = dotted.split("."), leaf = keys.pop(); const target = keys.reduce((value, key) => value?.[key], object); return Boolean(target && Object.prototype.hasOwnProperty.call(target, leaf)); };
const safeName = (value) => String(value || "").replace(/[^a-z0-9_.-]/gi, "_");

const loadOverrides = async (file, db) => {
  if (!file) return new Map();
  const rows = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  if (!Array.isArray(rows)) throw new Error("Override mapping file must contain a JSON array");
  const result = new Map();
  for (const row of rows) {
    const id = String(row.legacyMaterialId || "");
    if (!mongoose.isValidObjectId(id) || !ITEM_TYPES.includes(row.itemType) || !mongoose.isValidObjectId(row.item) || !String(row.reason || "").trim()) throw new Error("Every override requires valid legacyMaterialId, itemType, item, and reason");
    if (result.has(id)) throw new Error(`Duplicate or conflicting override for ${id}`);
    if (!(await db.collection(TARGETS[row.itemType]).findOne({ _id: new mongoose.Types.ObjectId(row.item) }, { projection: { _id: 1 } }))) throw new Error(`Override target does not exist for ${id}`);
    result.set(id, { itemType: row.itemType, item: String(row.item), confidence: "EXPLICIT_MAPPING", reason: row.reason });
  }
  return result;
};

const catalog = async (db) => {
  const names = new Set((await db.listCollections().toArray()).map((row) => row.name)), canonical = [], byId = new Map();
  for (const itemType of ITEM_TYPES) if (names.has(TARGETS[itemType])) for (const row of await db.collection(TARGETS[itemType]).find({}).toArray()) {
    const entry = { itemType, item: String(row._id), code: row.productCode || row.materialCode || row.componentCode || row.code || row.sku || "", name: row.productName || row.materialName || row.componentName || row.name || "", unit: String(row.unit || ""), type: row.productType || row.type || row.category || "" };
    canonical.push(entry); const values = byId.get(entry.item) || []; values.push(entry); byId.set(entry.item, values);
  }
  const materials = names.has("materials") ? await db.collection("materials").find({}).toArray() : [];
  return { names, canonical, byId, materials: new Map(materials.map((row) => [String(row._id), row])) };
};

const resolveMapping = (legacyId, evidence, override, data) => {
  if (override) return { ...override, legacyMaterialId: legacyId };
  const idMatches = data.byId.get(legacyId) || [];
  if (idMatches.length === 1) return { ...idMatches[0], legacyMaterialId: legacyId, confidence: "EXACT_ID" };
  if (idMatches.length > 1) return { legacyMaterialId: legacyId, confidence: "AMBIGUOUS", candidates: idMatches };
  const material = data.materials.get(legacyId) || evidence || {}, code = norm(material.materialCode || material.code || material.sku), name = norm(material.materialName || material.name), type = norm(material.itemType || material.type || material.category), unit = norm(material.unit);
  if (code) {
    const candidates = data.canonical.filter((row) => norm(row.code) === code), typed = candidates.filter((row) => !type || norm(row.itemType) === type || norm(row.type) === type);
    if (typed.length === 1) return { ...typed[0], legacyMaterialId: legacyId, confidence: type ? "EXACT_CODE_AND_TYPE" : "EXACT_CODE" };
    if (candidates.length > 1 || typed.length > 1) return { legacyMaterialId: legacyId, confidence: "AMBIGUOUS", candidates };
  }
  if (name && unit) {
    const candidates = data.canonical.filter((row) => norm(row.name) === name && norm(row.unit) === unit);
    if (candidates.length === 1) return { ...candidates[0], legacyMaterialId: legacyId, confidence: "EXACT_NAME_AND_METADATA" };
    if (candidates.length > 1) return { legacyMaterialId: legacyId, confidence: "AMBIGUOUS", candidates };
  }
  return { legacyMaterialId: legacyId, confidence: "UNRESOLVED" };
};

const occurrencesFor = (collection, document) => {
  const rows = [];
  const add = (legacyPath, canonicalRoot, legacyId, lineId = null) => legacyId && rows.push({ legacyPath, canonicalRoot, legacyMaterialId: String(legacyId), lineId: lineId && String(lineId) });
  if (Array.isArray(document.items)) document.items.forEach((line, index) => add(line.materialId !== undefined ? `items.${index}.materialId` : `items.${index}.material`, `items.${index}`, line.materialId || line.material, line._id));
  add(document.materialId !== undefined ? "materialId" : "material", "", document.materialId || document.material, null);
  if (collection === "vendors") (document.suppliedMaterials || []).forEach((id, index) => add(`suppliedMaterials.${index}`, `suppliedItems.${index}`, id, null));
  return rows;
};

const survey = async (db, options = {}) => {
  const data = await catalog(db), overrides = await loadOverrides(options.mappingFile, db), records = [], documents = new Map();
  const collections = ["purchaserequests", "purchaserequisitions", "purchaserequisitionses", "rfqs", "purchaseorders", "purchaseorderses", "grns", "goodsreceiptnotes", "vendormaterials", "vendors", "stockissues", "inventories", "stockmovements", "stocktransactions"];
  for (const collection of collections) if (data.names.has(collection)) for (const document of await db.collection(collection).find({}).toArray()) {
    const key = `${collection}:${document._id}`, occurrences = occurrencesFor(collection, document); if (!occurrences.length) continue; documents.set(key, document);
    for (const occurrence of occurrences) {
      const mapping = resolveMapping(occurrence.legacyMaterialId, null, overrides.get(occurrence.legacyMaterialId), data), typePath = occurrence.canonicalRoot ? `${occurrence.canonicalRoot}.itemType` : "itemType", itemPath = occurrence.canonicalRoot ? `${occurrence.canonicalRoot}.item` : "item", metadataPath = occurrence.canonicalRoot ? `${occurrence.canonicalRoot}.identityMigration` : "identityMigration", currentType = get(document, typePath), currentItem = get(document, itemPath);
      let status = mapping.confidence;
      if (currentType && currentItem) status = String(currentType) === mapping.itemType && String(currentItem) === mapping.item ? (get(document, metadataPath)?.version === VERSION ? "ALREADY_MIGRATED" : "CANONICAL") : "CONFLICT";
      if (DEFERRED_COLLECTIONS.has(collection)) status = "DEFERRED";
      const safe = ["EXACT_ID", "EXACT_CODE", "EXACT_CODE_AND_TYPE", "EXACT_NAME_AND_METADATA", "EXPLICIT_MAPPING"];
      records.push({ key, collection, documentId: String(document._id), ...occurrence, typePath, itemPath, metadataPath, proposedItemType: mapping.itemType || null, proposedItem: mapping.item || null, targetCode: mapping.code || null, targetName: mapping.name || null, confidence: mapping.confidence, status, action: ACTIVE_COLLECTIONS.has(collection) && safe.includes(status) ? "MIGRATE" : "NONE" });
    }
  }
  // Conservative chain rule: linked single-item documents must resolve identically.
  const idToKey = new Map([...documents].map(([key, doc]) => [String(doc._id), key])), parent = new Map([...documents.keys()].map((key) => [key, key]));
  const find = (key) => parent.get(key) === key ? key : (parent.set(key, find(parent.get(key))), parent.get(key)); const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent.set(b, a); };
  for (const [key, doc] of documents) for (const ref of [doc.sourceRequisition, doc.purchaseRequisition, doc.sourceRFQ, doc.rfqId, doc.purchaseOrder]) if (ref && idToKey.has(String(ref))) union(key, idToKey.get(String(ref)));
  const groups = new Map(); for (const record of records) { const root = find(record.key), values = groups.get(root) || []; values.push(record); groups.set(root, values); }
  for (const values of groups.values()) {
    const documentCount = new Set(values.map((row) => row.key)).size, singleLine = values.length === documentCount, identities = new Set(values.filter((row) => row.proposedItemType && row.proposedItem).map((row) => `${row.proposedItemType}:${row.proposedItem}`));
    if (singleLine && documentCount > 1 && identities.size > 1) for (const row of values) { row.status = "CHAIN_CONFLICT"; row.action = "NONE"; }
  }
  const units = [...groups.values()];
  return { version: VERSION, generatedAt: new Date().toISOString(), legacyMaterialCollectionExists: data.names.has("materials"), legacyMaterialCount: data.materials.size, records, documents, units };
};

const reportPayload = (plan) => {
  const publicRows = plan.records.map(({ key, ...row }) => row), by = (statuses) => publicRows.filter((row) => statuses.includes(row.status));
  return { summary: { migrationVersion: VERSION, dryRun: true, totalLegacyIds: new Set(publicRows.map((row) => row.legacyMaterialId)).size, affectedDocumentCount: new Set(publicRows.map((row) => `${row.collection}:${row.documentId}`)).size, affectedLineCount: publicRows.length, safelyMapped: by(["EXACT_ID", "EXACT_CODE", "EXACT_CODE_AND_TYPE", "EXACT_NAME_AND_METADATA"]).length, manuallyMapped: by(["EXPLICIT_MAPPING"]).length, ambiguous: by(["AMBIGUOUS"]).length, unresolved: by(["UNRESOLVED"]).length, conflicts: by(["CONFLICT", "CHAIN_CONFLICT"]).length, alreadyMigrated: by(["ALREADY_MIGRATED"]).length, deferred: by(["DEFERRED"]).length, affectedCollections: [...new Set(publicRows.map((row) => row.collection))], legacyMaterialCollectionExists: plan.legacyMaterialCollectionExists, legacyMaterialCount: plan.legacyMaterialCount }, rows: publicRows, mappings: by(["EXACT_ID", "EXACT_CODE", "EXACT_CODE_AND_TYPE", "EXACT_NAME_AND_METADATA", "EXPLICIT_MAPPING"]), ambiguous: by(["AMBIGUOUS"]), unresolved: by(["UNRESOLVED", "DEFERRED"]), conflicts: by(["CONFLICT", "CHAIN_CONFLICT"]), affected: publicRows };
};
const writeReports = (plan, outputDir) => { const payload = reportPayload(plan); fs.mkdirSync(outputDir, { recursive: true }); for (const [name, value] of Object.entries({ summary: payload.summary, mappings: payload.mappings, ambiguous: payload.ambiguous, unresolved: payload.unresolved, conflicts: payload.conflicts, "affected-records": payload.affected })) fs.writeFileSync(path.join(outputDir, `${name}.json`), JSON.stringify(value, null, 2)); return payload; };

const apply = async (db, plan, options) => {
  if (!options.apply || options.confirm !== "MIGRATE_LEGACY_IDENTITY") throw new Error("Apply requires --apply --confirm MIGRATE_LEGACY_IDENTITY");
  const outputDir = path.resolve(options.outputDir), backupDir = path.join(outputDir, "backups"); fs.mkdirSync(backupDir, { recursive: true }); fs.accessSync(backupDir, fs.constants.W_OK);
  const session = db.client.startSession(), migrated = new Set(), batchSize = Math.max(1, Math.min(500, Number(options.batchSize || 50)));
  const eligible = plan.units.filter((unit) => unit.some((row) => row.action === "MIGRATE") && unit.every((row) => !["AMBIGUOUS", "UNRESOLVED", "CONFLICT", "CHAIN_CONFLICT"].includes(row.status)));
  const backup = [];
  for (const unit of eligible) for (const row of unit.filter((entry) => entry.action === "MIGRATE")) {
    const original = plan.documents.get(row.key), originals = {};
    for (const field of [row.typePath, row.itemPath, row.metadataPath]) originals[field] = { existed: exists(original, field), value: clone(get(original, field)) };
    backup.push({ collection: row.collection, documentId: row.documentId, migrationVersion: VERSION, metadataPath: row.metadataPath, fields: originals });
  }
  const backupFile = path.join(backupDir, `migration-v${VERSION}-${safeName(new Date().toISOString())}.json`); fs.writeFileSync(backupFile, JSON.stringify({ version: VERSION, createdAt: new Date().toISOString(), records: backup }, null, 2));
  try {
    for (let start = 0; start < eligible.length; start += batchSize) await session.withTransaction(async () => {
      for (const unit of eligible.slice(start, start + batchSize)) for (const row of unit.filter((entry) => entry.action === "MIGRATE")) {
        const collection = db.collection(row.collection), id = new mongoose.Types.ObjectId(row.documentId), current = await collection.findOne({ _id: id }, { session }); if (!current) throw new Error(`Document disappeared: ${row.collection}/${row.documentId}`);
        const currentType = get(current, row.typePath), currentItem = get(current, row.itemPath); if (currentType || currentItem) { if (String(currentType) === row.proposedItemType && String(currentItem) === row.proposedItem) continue; throw new Error(`Canonical conflict during apply: ${row.collection}/${row.documentId}`); }
        const metadata = { version: VERSION, migratedAt: new Date(), source: "legacy-material", legacyMaterialId: new mongoose.Types.ObjectId(row.legacyMaterialId), confidence: row.confidence };
        const changes = { [row.typePath]: row.proposedItemType, [row.itemPath]: new mongoose.Types.ObjectId(row.proposedItem), [row.metadataPath]: metadata };
        await collection.updateOne({ _id: id }, { $set: changes }, { session }); migrated.add(JSON.stringify({ collection: row.collection, documentId: row.documentId, field: row.canonicalRoot || "document" }));
      }
    });
  } finally { await session.endSession(); }
  return { migrated: [...migrated].map((value) => JSON.parse(value)), backupFile };
};

const verify = async (db) => { const plan = await survey(db); const migrated = plan.records.filter((row) => row.status === "ALREADY_MIGRATED"), invalid = []; for (const row of migrated) if (!ITEM_TYPES.includes(row.proposedItemType) || !mongoose.isValidObjectId(row.proposedItem) || !(await db.collection(TARGETS[row.proposedItemType]).findOne({ _id: new mongoose.Types.ObjectId(row.proposedItem) }))) invalid.push(row); return { version: VERSION, verified: migrated.length - invalid.length, invalid }; };
const rollback = async (db, backupFile, options) => {
  if (!options.apply || options.confirm !== "ROLLBACK_LEGACY_IDENTITY") throw new Error("Rollback apply requires --apply --confirm ROLLBACK_LEGACY_IDENTITY");
  const backup = JSON.parse(fs.readFileSync(path.resolve(backupFile), "utf8")); if (backup.version !== VERSION) throw new Error("Unsupported migration backup version");
  const session = db.client.startSession(); let restored = 0;
  try { for (let start = 0; start < backup.records.length; start += Number(options.batchSize || 50)) await session.withTransaction(async () => { for (const row of backup.records.slice(start, start + Number(options.batchSize || 50))) { const collection = db.collection(row.collection), id = new mongoose.Types.ObjectId(row.documentId), current = await collection.findOne({ _id: id }, { session }); if (get(current, row.metadataPath)?.version !== VERSION) continue; const $set = {}, $unset = {}; for (const [field, original] of Object.entries(row.fields)) original.existed ? $set[field] = original.value : $unset[field] = ""; await collection.updateOne({ _id: id }, { ...Object.keys($set).length && { $set }, ...Object.keys($unset).length && { $unset } }, { session }); restored += 1; } }); } finally { await session.endSession(); }
  return { restored };
};

module.exports = { VERSION, ITEM_TYPES, ACTIVE_COLLECTIONS, DEFERRED_COLLECTIONS, survey, reportPayload, writeReports, apply, verify, rollback };
