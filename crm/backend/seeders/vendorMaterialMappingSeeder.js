require("dotenv").config();

const mongoose = require("mongoose");

const Vendor = require("../models/Vendor");
const Material = require("../models/Material");

const seedVendorMaterialMapping = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");

    // ==================================
    // FETCH MATERIALS
    // ==================================

    const materials = await Material.find();

    if (!materials.length) {
      console.log(
        "No Materials Found. Run Material Seeder First."
      );

      process.exit();
    }

    // ==================================
    // FETCH VENDORS
    // ==================================

    const vendors = await Vendor.find();

    if (!vendors.length) {
      console.log(
        "No Vendors Found. Run Vendor Seeder First."
      );

      process.exit();
    }

    // ==================================
    // HELPER FUNCTION
    // ==================================

    const getMaterialIds = (...codes) => {
      return materials
        .filter((m) =>
          codes.includes(m.materialCode)
        )
        .map((m) => m._id);
    };

    // ==================================
    // VEN001
    // ==================================

    await Vendor.findOneAndUpdate(
      { vendorCode: "VEN001" },
      {
        suppliedMaterials: getMaterialIds(
          "MAT001",
          "MAT002",
          "MAT003"
        ),
      }
    );

    // ==================================
    // VEN002
    // ==================================

    await Vendor.findOneAndUpdate(
      { vendorCode: "VEN002" },
      {
        suppliedMaterials: getMaterialIds(
          "MAT002",
          "MAT004",
          "MAT005"
        ),
      }
    );

    // ==================================
    // VEN003
    // ==================================

    await Vendor.findOneAndUpdate(
      { vendorCode: "VEN003" },
      {
        suppliedMaterials: getMaterialIds(
          "MAT006",
          "MAT007",
          "MAT008"
        ),
      }
    );

    // ==================================
    // VEN004
    // ==================================

    await Vendor.findOneAndUpdate(
      { vendorCode: "VEN004" },
      {
        suppliedMaterials: getMaterialIds(
          "MAT009",
          "MAT010"
        ),
      }
    );

    // ==================================
    // VEN005
    // ==================================

    await Vendor.findOneAndUpdate(
      { vendorCode: "VEN005" },
      {
        suppliedMaterials: getMaterialIds(
          "MAT003",
          "MAT005",
          "MAT008",
          "MAT010"
        ),
      }
    );

    console.log(
      "Vendor-Material Mapping Completed Successfully"
    );

    process.exit();
  } catch (error) {
    console.error(
      "Vendor Material Mapping Error:",
      error
    );

    process.exit(1);
  }
};

seedVendorMaterialMapping();