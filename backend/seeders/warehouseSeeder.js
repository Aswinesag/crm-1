// backend/seeders/warehouseSeeder.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Warehouse = require("../models/Warehouse");

dotenv.config();

const warehouses = [
  {
    warehouseCode: "WH-001",
    warehouseName: "Main Warehouse",
    location: "Pune",
    managerName: "Rahul Sharma",
    contactNumber: "9876543210",
    status: "Active",
  },
  {
    warehouseCode: "WH-002",
    warehouseName: "Mumbai Warehouse",
    location: "Mumbai",
    managerName: "Amit Patel",
    contactNumber: "9876543211",
    status: "Active",
  },
  {
    warehouseCode: "WH-003",
    warehouseName: "Delhi Warehouse",
    location: "Delhi",
    managerName: "Vikas Singh",
    contactNumber: "9876543212",
    status: "Active",
  },
  {
    warehouseCode: "WH-004",
    warehouseName: "Chennai Warehouse",
    location: "Chennai",
    managerName: "Ramesh Kumar",
    contactNumber: "9876543213",
    status: "Active",
  },
  {
    warehouseCode: "WH-005",
    warehouseName: "Backup Warehouse",
    location: "Pune",
    managerName: "Suresh Patil",
    contactNumber: "9876543214",
    status: "Inactive",
  },
];

const seedWarehouses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    await Warehouse.deleteMany();

    console.log("Existing Warehouses Deleted");

    await Warehouse.insertMany(warehouses);

    console.log("Warehouse Data Seeded Successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedWarehouses();