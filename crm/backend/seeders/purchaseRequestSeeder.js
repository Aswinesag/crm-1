require("dotenv").config();

const mongoose = require("mongoose");

const PurchaseRequest = require("../models/PurchaseRequest");
const Material = require("../models/Material");
const User = require("../models/User");

const seedPurchaseRequests = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    // Remove old PR records
    await PurchaseRequest.deleteMany({});

    const materials = await Material.find();
    const users = await User.find();

    console.log(`Materials Found: ${materials.length}`);
    console.log(`Users Found: ${users.length}`);

    if (!materials.length) {
      throw new Error(
        "No Materials found. Run materialSeeder first."
      );
    }

    if (!users.length) {
      throw new Error(
        "No Users found in database."
      );
    }

    const priorities = [
      "LOW",
      "MEDIUM",
      "HIGH"
    ];

    const statuses = [
      "PENDING",
      "APPROVED",
      "REJECTED"
    ];

    const purchaseRequests = [];

    for (let i = 1; i <= 50; i++) {

      const randomMaterial =
        materials[
          Math.floor(
            Math.random() * materials.length
          )
        ];

      const randomUser =
        users[
          Math.floor(
            Math.random() * users.length
          )
        ];

      purchaseRequests.push({
        prNumber: `PR-${String(i).padStart(5, "0")}`,

        materialId: randomMaterial._id,

        quantity:
          Math.floor(Math.random() * 500) + 10,

        priority:
          priorities[
            Math.floor(
              Math.random() * priorities.length
            )
          ],

        requestedBy: randomUser._id,

        status:
          statuses[
            Math.floor(
              Math.random() * statuses.length
            )
          ]
      });
    }

    await PurchaseRequest.insertMany(
      purchaseRequests
    );

    console.log(
      `✅ ${purchaseRequests.length} Purchase Requests Seeded`
    );

    process.exit();

  } catch (error) {

    console.error(
      "Seeder Error:",
      error.message
    );

    process.exit(1);
  }
};

seedPurchaseRequests();