require("dotenv").config();

const mongoose = require("mongoose");

const Material = require("../models/Material");
const Vendor = require("../models/Vendor");
const Warehouse = require("../models/Warehouse");

const seedMaterials = async () => {
  try {
    // CONNECT DB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    // CLEAR OLD DATA
    await Material.deleteMany();

    console.log("Old Materials Deleted");

    // GET VENDORS
    const vendors = await Vendor.find();

    // GET WAREHOUSES
    const warehouses = await Warehouse.find();

    if (!vendors.length) {
      throw new Error("No vendors found. Run vendorSeeder first.");
    }

    if (!warehouses.length) {
      throw new Error("No warehouses found. Run warehouseSeeder first.");
    }

    const materials = [
      {
        materialCode: "MAT001",
        materialName: "Steel Rod",
        category: "Raw Material",
        unit: "Kg",
        currentStock: 500,
        unitPrice: 75,
        minimumStock: 100,
        reorderLevel: 150,
        vendorIds: [vendors[0]._id],
        warehouseId: warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT002",
        materialName: "Copper Wire",
        category: "Electrical",
        unit: "Meter",
        currentStock: 2000,
        unitPrice: 25,
        minimumStock: 500,
        reorderLevel: 700,
        vendorIds: [vendors[1]?._id || vendors[0]._id],
        warehouseId: warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT003",
        materialName: "Aluminium Sheet",
        category: "Raw Material",
        unit: "Piece",
        currentStock: 300,
        unitPrice: 450,
        minimumStock: 50,
        reorderLevel: 80,
        vendorIds: [vendors[2]?._id || vendors[0]._id],
        warehouseId: warehouses[1]?._id || warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT004",
        materialName: "Lubricant Oil",
        category: "Consumable",
        unit: "Litre",
        currentStock: 150,
        unitPrice: 180,
        minimumStock: 40,
        reorderLevel: 60,
        vendorIds: [vendors[0]._id],
        warehouseId: warehouses[1]?._id || warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT005",
        materialName: "Packing Box",
        category: "Packaging",
        unit: "Box",
        currentStock: 1000,
        unitPrice: 20,
        minimumStock: 200,
        reorderLevel: 300,
        vendorIds: [vendors[1]?._id || vendors[0]._id],
        warehouseId: warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT006",
        materialName: "Plastic Granules",
        category: "Raw Material",
        unit: "Kg",
        currentStock: 1200,
        unitPrice: 55,
        minimumStock: 250,
        reorderLevel: 350,
        vendorIds: [vendors[2]?._id || vendors[0]._id],
        warehouseId: warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT007",
        materialName: "Rubber Gasket",
        category: "Spare Part",
        unit: "Piece",
        currentStock: 600,
        unitPrice: 12,
        minimumStock: 100,
        reorderLevel: 150,
        vendorIds: [vendors[0]._id],
        warehouseId: warehouses[1]?._id || warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT008",
        materialName: "Industrial Paint",
        category: "Consumable",
        unit: "Litre",
        currentStock: 250,
        unitPrice: 220,
        minimumStock: 50,
        reorderLevel: 80,
        vendorIds: [vendors[1]?._id || vendors[0]._id],
        warehouseId: warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT009",
        materialName: "PVC Pipe",
        category: "Plumbing",
        unit: "Meter",
        currentStock: 1800,
        unitPrice: 35,
        minimumStock: 300,
        reorderLevel: 500,
        vendorIds: [vendors[2]?._id || vendors[0]._id],
        warehouseId: warehouses[1]?._id || warehouses[0]._id,
        status: "Active",
      },

      {
        materialCode: "MAT010",
        materialName: "Nut Bolt Set",
        category: "Hardware",
        unit: "Box",
        currentStock: 700,
        unitPrice: 150,
        minimumStock: 100,
        reorderLevel: 200,
        vendorIds: [vendors[0]._id],
        warehouseId: warehouses[0]._id,
        status: "Active",
      },
    ];

    await Material.insertMany(materials);

    console.log(`${materials.length} Materials Seeded Successfully`);

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedMaterials();