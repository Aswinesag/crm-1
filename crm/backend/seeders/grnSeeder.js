require("dotenv").config();

const mongoose = require("mongoose");

const GRN = require("../models/grn/grnModel");

const PurchaseOrder = require("../models/PurchaseOrders");

const User = require("../models/User");

const Vendor = require("../models/Vendor");

async function seedGRNs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    const purchaseOrders = await PurchaseOrder.find()
      .populate("vendorId")
      .populate("createdBy");

    if (!purchaseOrders.length) {
      console.log(
        "No Purchase Orders Found. Seed PO First."
      );

      process.exit();
    }

    const users = await User.find();

    await GRN.deleteMany();

    const grns = [];

    let grnCounter = 1;

    for (const po of purchaseOrders) {

        if (!po.vendorId) {
            console.log(
                `Skipping ${po.poNumber} because vendorId is missing`
            );
            continue;
            }
      const items = [];

      for (const item of po.items) {
        const orderedQty =
          item.quantity || 100;

        const receivedQty =
          Math.floor(
            orderedQty *
              (0.8 + Math.random() * 0.2)
          );

        const rejectedQty =
          Math.floor(
            receivedQty *
              (Math.random() * 0.1)
          );

        const acceptedQty =
          receivedQty - rejectedQty;

        items.push({
          materialId: item.materialId,

          orderedQuantity:
            orderedQty,

          quantityReceived:
            receivedQty,

          acceptedQuantity:
            acceptedQty,

          rejectedQuantity:
            rejectedQty,

          unitPrice:
            item.unitPrice || 100,

          remarks:
            "Material received and inspected",
        });
      }

      grns.push({
        grnNumber: `GRN-${String(
          grnCounter
        ).padStart(4, "0")}`,

        purchaseOrder: po._id,

        vendor: po.vendorId,

        items,

        deliveryDate:
          new Date(),

        remarks:
          "Auto generated GRN",

        createdBy:
          po.createdBy ||
          users[0]._id,
      });

      grnCounter++;
    }

    await GRN.insertMany(grns);

    console.log(
      `${grns.length} GRNs Seeded Successfully`
    );

    process.exit();
  } catch (error) {
    console.error(
      "GRN Seeder Error:",
      error
    );

    process.exit(1);
  }
}

seedGRNs();