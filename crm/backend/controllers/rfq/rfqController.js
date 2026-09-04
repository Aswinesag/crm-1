const RFQ = require("../../models/RFQ");
const Material = require("../../models/Material");
const Vendor = require("../../models/Vendor");

const createRFQ = async (req, res) => {
  try {

    console.log("REQ BODY:");
    console.log(req.body);

    const {
      rfqNumber,
      materialId,
      quantity,
      unit,
      requiredDate,
      vendorIds,
      status,
      remarks,
      createdBy,
    } = req.body;

    const existingRFQ = await RFQ.findOne({ rfqNumber });

    if (existingRFQ) {
      return res.status(400).json({
        success: false,
        message: "RFQ Number already exists",
      });
    }

    const rfq = await RFQ.create({
      rfqNumber,
      materialId,
      quantity,
      unit,
      requiredDate,
      vendorIds,
      status,
      remarks,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "RFQ created successfully",
      data: rfq,
    });
  } catch (error) {

  console.log("========== RFQ CREATE ERROR ==========");
  console.log(error);
  console.log("======================================");

  res.status(500).json({
    success: false,
    message: error.message,
  });

}
};

// =============================================
// GET ALL RFQS
// =============================================
const getAllRFQs = async (req, res) => {
  try {

    // =============================================
    // PAGINATION
    // =============================================
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;



    // =============================================
    // SEARCH
    // =============================================
    const search = req.query.search || "";



    // =============================================
    // BUILD FILTER
    // =============================================
    let filter = {};



    // =============================================
    // SEARCH FUNCTIONALITY
    // SEARCH:
    // RFQ NUMBER
    // MATERIAL NAME
    // VENDOR NAME
    // =============================================
    if (search) {

      // FIND MATERIAL IDS
      const materials = await Material.find({
        materialName: {
          $regex: search,
          $options: "i",
        },
      }).select("_id");



      // FIND VENDOR IDS
      const vendors = await Vendor.find({
        vendorName: {
          $regex: search,
          $options: "i",
        },
      }).select("_id");



      // EXTRACT IDS
      const materialIds = materials.map((m) => m._id);
      const vendorIds = vendors.map((v) => v._id);



      // ADD SEARCH CONDITIONS
      filter.$or = [

        // SEARCH RFQ NUMBER
        {
          rfqNumber: {
            $regex: search,
            $options: "i",
          },
        },



        // SEARCH MATERIAL
        {
          materialId: {
            $in: materialIds,
          },
        },



        // SEARCH VENDOR
        {
          vendorIds: {
            $in: vendorIds,
          },
        },
      ];
    }



    // =============================================
    // FILTER BY STATUS
    // Example:
    // /api/rfqs?status=Pending
    // =============================================
    if (req.query.status) {
      filter.status = req.query.status;
    }



    // =============================================
    // FILTER BY MATERIAL
    // Example:
    // /api/rfqs?materialId=683ab123
    // =============================================
    if (req.query.materialId) {
      filter.materialId = req.query.materialId;
    }



    // =============================================
    // FILTER BY VENDOR
    // Example:
    // /api/rfqs?vendorId=683xy555
    // =============================================
    if (req.query.vendorId) {
      filter.vendorIds = req.query.vendorId;
    }



    // =============================================
    // FILTER BY DATE RANGE
    // Example:
    // /api/rfqs?fromDate=2026-05-01&toDate=2026-05-31
    // =============================================
    if (req.query.fromDate || req.query.toDate) {

      filter.createdAt = {};



      // FROM DATE
      if (req.query.fromDate) {
        filter.createdAt.$gte = new Date(req.query.fromDate);
      }



      // TO DATE
      if (req.query.toDate) {
        filter.createdAt.$lte = new Date(req.query.toDate);
      }
    }



    // =============================================
    // TOTAL COUNT
    // =============================================
    const total = await RFQ.countDocuments(filter);



    // =============================================
    // GET RFQS
    // =============================================
    const rfqs = await RFQ.find(filter)
      .populate("materialId")
      .populate("vendorIds")
      .populate("quotations.vendorId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);



    // =============================================
    // RESPONSE
    // =============================================
    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      count: rfqs.length,
      data: rfqs,
    });

  } catch (error) {

    console.log(error);



    res.status(500).json({
      success: false,
      message: "Failed to fetch RFQs",
      error: error.message,
    });
  }
};

const getSingleRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate("materialId")
      .populate("vendorIds")
      .populate("quotations.vendorId");

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sendRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    rfq.status = "Sent";

    await rfq.save();

    res.status(200).json({
      success: true,
      message: "RFQ sent successfully",
      data: rfq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const submitQuotation = async (req, res) => {
  try {
    const {
      vendorId,
      quotedPrice,
      deliveryDays,
      paymentTerms,
      remarks,
    } = req.body;

    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    rfq.quotations.push({
      vendorId,
      quotedPrice,
      deliveryDays,
      paymentTerms,
      remarks,
    });

    rfq.status = "Quotation Received";

    await rfq.save();

    res.status(200).json({
      success: true,
      message: "Quotation submitted successfully",
      data: rfq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const closeRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    rfq.status = "Closed";

    await rfq.save();

    res.status(200).json({
      success: true,
      message: "RFQ closed successfully",
      data: rfq,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRFQById = async (req, res) => {
  try {

    const rfq =
      await RFQ.findById(
        req.params.id
      )
      .populate("purchaseRequest")
      .populate("suppliers");

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: "RFQ not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rfq,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {
  createRFQ,
  getAllRFQs,
  getSingleRFQ,
  sendRFQ,
  submitQuotation,
  closeRFQ,
  getRFQById,
};