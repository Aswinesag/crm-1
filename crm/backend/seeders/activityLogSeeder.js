const mongoose = require("mongoose");

const ActivityLog = require("../models/ActivityLog");
const PurchaseOrder = require("../models/PurchaseOrders");

require("dotenv").config();

const connectDB = async () => {
  try {

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB Connected");

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
};

const seedERPActivities = async () => {

  try {

    const pos =
      await PurchaseOrder.find();

    console.log(
      `Found ${pos.length} Purchase Orders`
    );

    for (const po of pos) {

      await ActivityLog.create({
        type: "PO_CREATED",
        description:
          `Purchase Order ${po.poNumber} created`,
        user: "Seeder"
      });

    }

    console.log(
      "ERP Activities Seeded Successfully"
    );

    process.exit(0);

  } catch (error) {

    console.error(error);

    process.exit(1);

  }

};

(async () => {

  await connectDB();

  await seedERPActivities();

})();