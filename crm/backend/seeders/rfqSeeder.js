require("dotenv").config();
const mongoose = require("mongoose");

const RFQ = require("../models/RFQ");
const Material = require("../models/Material");
const Vendor = require("../models/Vendor");

const seedRFQs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    const materials = await Material.find();
    const vendors = await Vendor.find();

    if (materials.length === 0) {
      console.log("No materials found.");
      process.exit();
    }

    if (vendors.length === 0) {
      console.log("No vendors found.");
      process.exit();
    }

    await RFQ.deleteMany();

    const rfqs = [];

    for (let i = 0; i < 20; i++) {
      const material = materials[i % materials.length];

      const selectedVendors = vendors
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      rfqs.push({
        rfqNumber: `RFQ-${String(i + 1).padStart(4, "0")}`,

        materialId: material._id,

        quantity: Math.floor(Math.random() * 500) + 50,

        unit: material.unit || "Nos",

        requiredDate: new Date(
          Date.now() +
            Math.floor(Math.random() * 30 + 10) *
              24 *
              60 *
              60 *
              1000
        ),

        vendorIds: selectedVendors.map((v) => v._id),

        status: [
          "Draft",
          "Sent",
          "Quotation Received",
          "Closed",
        ][Math.floor(Math.random() * 4)],

        remarks: "Auto generated RFQ for ERP testing",

        createdBy: "purchase.manager@company.com",

        quotations: selectedVendors.map((vendor) => ({
          vendorId: vendor._id,

          quotedPrice:
            Math.floor(Math.random() * 10000) + 1000,

          deliveryDays:
            Math.floor(Math.random() * 15) + 2,

          paymentTerms: [
            "30 Days",
            "45 Days",
            "Advance 50%",
            "Immediate",
          ][Math.floor(Math.random() * 4)],

          quotationDate: new Date(),

          remarks: "Generated quotation",
        })),
      });
    }

    await RFQ.insertMany(rfqs);

    console.log(`${rfqs.length} RFQs inserted`);

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedRFQs();