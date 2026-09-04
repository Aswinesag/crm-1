require("dotenv").config();

const mongoose = require("mongoose");

const PurchaseOrder = require("../models/PurchaseOrder");
const Vendor = require("../models/Vendor");
const Warehouse = require("../models/Warehouse");
const Material = require("../models/Material");
const RFQ = require("../models/RFQ");
const User = require("../models/User");

async function seedPurchaseOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    // Remove old records
    await PurchaseOrder.deleteMany();

    const vendors = await Vendor.find();
    const warehouses = await Warehouse.find();
    const materials = await Material.find();
    const rfqs = await RFQ.find();
    const users = await User.find();

    if (
      !vendors.length ||
      !warehouses.length ||
      !materials.length ||
      !users.length
    ) {
      throw new Error(
        "Vendor/Warehouse/Material/User data missing. Run previous seeders first."
      );
    }

    const purchaseOrders = [];

    for (let i = 1; i <= 25; i++) {
      const vendor =
        vendors[Math.floor(Math.random() * vendors.length)];

      const warehouse =
        warehouses[
          Math.floor(Math.random() * warehouses.length)
        ];

      const user =
        users[Math.floor(Math.random() * users.length)];

      const rfq =
        rfqs.length > 0
          ? rfqs[Math.floor(Math.random() * rfqs.length)]
          : null;

      const itemCount =
        Math.floor(Math.random() * 4) + 1;

      const items = [];

      const usedMaterials = new Set();

      for (let j = 0; j < itemCount; j++) {
        let material;

        do {
          material =
            materials[
              Math.floor(
                Math.random() * materials.length
              )
            ];
        } while (
          usedMaterials.has(material._id.toString())
        );

        usedMaterials.add(material._id.toString());

        const quantity =
          Math.floor(Math.random() * 100) + 10;

        const unitPrice =
          Math.floor(Math.random() * 5000) + 500;

        items.push({
          materialId: material._id,

          quantity,

          unitPrice,

          receivedQuantity: 0,

          pendingQuantity: quantity,

          taxPercent: 18,
        });
      }

      purchaseOrders.push({
        poNumber: `PO-${String(i).padStart(4, "0")}`,

        vendorId: vendor._id,

        warehouseId: warehouse._id,

        rfqId: rfq ? rfq._id : null,

        items,

        deliveryDate: new Date(
          Date.now() +
            Math.floor(Math.random() * 30) *
              24 *
              60 *
              60 *
              1000
        ),

        paymentTerms: "30 Days",

        notes: `Purchase Order ${i}`,

        status: [
          "DRAFT",
          "APPROVED",
          "SENT",
        ][Math.floor(Math.random() * 3)],

        createdBy: user._id,
      });
    }

    for (const poData of purchaseOrders) {
         const po = new PurchaseOrder(poData);
    await po.save();
    }

    console.log(
      `${purchaseOrders.length} Purchase Orders Seeded Successfully`
    );

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
}

seedPurchaseOrders();