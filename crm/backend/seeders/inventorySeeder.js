const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Material = require("../models/Material");
const Inventory = require("../models/Inventory");

dotenv.config();

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    const materials = await Material.find();

    console.log(`Found ${materials.length} materials`);

    for (const material of materials) {
      const exists = await Inventory.findOne({
        materialId: material._id,
        warehouseId: material.warehouseId,
      });

      if (!exists) {
        await Inventory.create({
          materialId: material._id,
          warehouseId: material.warehouseId,
          quantity: material.currentStock || 0,
        });

        console.log(
          `Inventory Created -> ${material.materialName || material.name}`
        );
      }
    }

    console.log("Inventory Seeding Completed");
    process.exit(0);
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedInventory();