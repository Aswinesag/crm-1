require("dotenv").config();

const mongoose = require("mongoose");

const Vendor = require("../models/Vendor");

const vendorData = [
  {
    vendorCode: "VEN001",
    vendorName: "Tata Steel Suppliers",
    contactPerson: "Rakesh Sharma",
    email: "tata.vendor@gmail.com",
    phone: "9876543210",
    alternatePhone: "9876543211",
    gstNumber: "27ABCDE1234F1Z5",

    addressLine1: "MIDC Industrial Area",
    addressLine2: "Phase 1",

    city: "Pune",
    state: "Maharashtra",
    country: "India",
    postalCode: "411019",

    paymentTerms: "30 Days",

    status: "ACTIVE",

    notes: "Primary steel supplier",
  },

  {
    vendorCode: "VEN002",
    vendorName: "Reliance Industrial Materials",
    contactPerson: "Ankit Patel",
    email: "reliance.vendor@gmail.com",
    phone: "9876543220",
    alternatePhone: "9876543221",
    gstNumber: "27ABCDE1234F1Z6",

    addressLine1: "Industrial Estate",
    addressLine2: "Building A",

    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    postalCode: "400001",

    paymentTerms: "45 Days",

    status: "ACTIVE",

    notes: "Bulk raw material supplier",
  },

  {
    vendorCode: "VEN003",
    vendorName: "ABC Electrical Components",
    contactPerson: "Vikas Gupta",
    email: "abc.electrical@gmail.com",
    phone: "9876543230",
    alternatePhone: "9876543231",
    gstNumber: "27ABCDE1234F1Z7",

    addressLine1: "Electronics Market",
    addressLine2: "Shop 22",

    city: "Nashik",
    state: "Maharashtra",
    country: "India",
    postalCode: "422001",

    paymentTerms: "15 Days",

    status: "ACTIVE",

    notes: "Electrical material supplier",
  },

  {
    vendorCode: "VEN004",
    vendorName: "Shree Packaging Solutions",
    contactPerson: "Priya Verma",
    email: "packaging.vendor@gmail.com",
    phone: "9876543240",
    alternatePhone: "9876543241",
    gstNumber: "27ABCDE1234F1Z8",

    addressLine1: "Packaging Hub",
    addressLine2: "Warehouse No 8",

    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    postalCode: "380001",

    paymentTerms: "30 Days",

    status: "ACTIVE",

    notes: "Packaging material vendor",
  },

  {
    vendorCode: "VEN005",
    vendorName: "Global Fasteners Pvt Ltd",
    contactPerson: "Amit Singh",
    email: "fasteners.vendor@gmail.com",
    phone: "9876543250",
    alternatePhone: "9876543251",
    gstNumber: "27ABCDE1234F1Z9",

    addressLine1: "Industrial Zone",
    addressLine2: "Plot 45",

    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    postalCode: "600001",

    paymentTerms: "60 Days",

    status: "ACTIVE",

    notes: "Fasteners and hardware supplier",
  },
];

const seedVendors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    await Vendor.deleteMany();

    console.log("Old Vendors Deleted");

    await Vendor.insertMany(vendorData);

    console.log("Vendor Seeder Completed Successfully");

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);

    process.exit(1);
  }
};

seedVendors();