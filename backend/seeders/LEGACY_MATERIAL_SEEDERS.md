# Legacy Material seeders

The following scripts are obsolete and must not be run: `materialSeeder.js`, `purchaseRequestSeeder.js`, `rfqSeeder.js`, `quotationSeeder.js`, `purchaseOrderSeeder.js`, `inventorySeeder.js`, and `vendorMaterialMappingSeeder.js`.

They depend on the removed generic `Material` model and are retained only as historical migration evidence. Canonical demo data must use Product, RawMaterial, or Component identities explicitly. These scripts currently fail closed because `models/Material.js` does not exist; do not recreate that model.
