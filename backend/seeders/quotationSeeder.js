require("dotenv").config();

const mongoose = require("mongoose");

const Quotation =
require("../models/Quotation");

const RFQ =
require("../models/RFQ");

const Vendor =
require("../models/Vendor");

const Material =
require("../models/Material");

const seedQuotation =
async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "MongoDB Connected"
    );

    const rfqs =
    await RFQ.find();

    const vendors =
    await Vendor.find();

    const materials =
    await Material.find();

    if (
      rfqs.length === 0 ||
      vendors.length === 0 ||
      materials.length === 0
    ) {
      console.log(
        "RFQ, Vendor or Material data missing"
      );

      process.exit();
    }

    await Quotation.deleteMany();

    const quotations = [];

    for (let i = 1; i <= 25; i++) {

      const material =
      materials[
        Math.floor(
          Math.random() *
          materials.length
        )
      ];

      const quantity =
      Math.floor(
        Math.random() * 100
      ) + 10;

      const unitPrice =
      Math.floor(
        Math.random() * 500
      ) + 100;

      quotations.push({
        quotationNumber:
          `QTN-${String(i).padStart(
            4,
            "0"
          )}`,

        rfqId:
          rfqs[
            Math.floor(
              Math.random() *
              rfqs.length
            )
          ]._id,

        vendorId:
          vendors[
            Math.floor(
              Math.random() *
              vendors.length
            )
          ]._id,

        quotationDate:
          new Date(),

        validityDate:
          new Date(
            Date.now() +
            15 * 24 * 60 * 60 * 1000
          ),

        items: [
          {
            materialId:
              material._id,

            quantity,

            unitPrice,

            totalPrice:
              quantity *
              unitPrice,
          },
        ],

        totalAmount:
          quantity *
          unitPrice,

        status:
          [
            "Submitted",
            "Under Review",
            "Accepted",
            "Rejected",
          ][
            Math.floor(
              Math.random() * 4
            )
          ],

        remarks:
          "Dummy quotation data",
      });
    }

    await Quotation.insertMany(
      quotations
    );

    console.log(
      "25 Quotations Seeded Successfully"
    );

    process.exit();

  } catch (error) {

    console.error(
      "Seeder Error:",
      error
    );

    process.exit(1);
  }
};

seedQuotation();