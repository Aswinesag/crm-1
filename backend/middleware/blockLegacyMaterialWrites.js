const blockLegacyMaterialWrites = (_req, res) => res.status(410).json({ success: false, message: "This legacy Material write endpoint is deprecated. Use canonical itemType + item APIs." });
module.exports = blockLegacyMaterialWrites;
