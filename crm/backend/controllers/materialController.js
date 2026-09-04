const Material = require("../models/Material");
const PurchaseRequisition = require("../models/PurchaseRequisitions");

// CREATE MATERIAL
const createMaterial = async (req, res) => {

    try {

        const material = await Material.create(req.body);

        res.status(201).json({
            success: true,
            message: "Material created successfully",
            data: material
        });

    } catch (error) {

        // DUPLICATE MATERIAL CODE
        if (error.code === 11000) {

            return res.status(400).json({
                success: false,
                message: "Material code already exists"
            });

        }

        // VALIDATION ERROR
        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

// GET ALL MATERIALS

const getAllMaterials = async (req, res) => {
  try {

    // SEARCH
    const search = req.query.search || "";

    // PAGINATION
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // FILTER
    const filter = {
      materialName: {
        $regex: search,
        $options: "i"
      }
    };

    // TOTAL RECORDS
    const totalRecords = await Material.countDocuments(filter);

    // TOTAL PAGES
    const totalPages = Math.ceil(totalRecords / limit);

    // MATERIALS
    const materials = await Material.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      currentPage: page,

      totalPages,

      totalRecords,

      recordsPerPage: limit,

      materials
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// UPDATE MATERIAL

const updateMaterial = async (req, res) => {

    try {

        const material = await Material.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        // CHECK MATERIAL EXISTS
        if (!material) {

            return res.status(404).json({
                success: false,
                message: "Material not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Material updated successfully",
            data: material
        });

    } catch (error) {

        // DUPLICATE MATERIAL CODE
        if (error.code === 11000) {

            return res.status(400).json({
                success: false,
                message: "Material code already exists"
            });

        }

        // VALIDATION ERROR
        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


// DELETE MATERIAL

 const deleteMaterial = async (req, res) => {

    try {

        const { id } = req.params;

        // CHECK MATERIAL EXISTS

        const material =
            await Material.findById(id);

        if (!material) {

            return res.status(404).json({

                success: false,
                message: "Material not found"

            });

        }

        // CHECK WHETHER MATERIAL IS USED IN PR

          const usedInPR =
              await PurchaseRequisition.findOne({
                  materialId: id
              });

          if (usedInPR) {

              return res.status(400).json({

                  success: false,
                  message:
                      "Material is used in Purchase Requisitions and cannot be deleted"

              });

          }

        // DELETE MATERIAL

        await Material.findByIdAndDelete(id);

        res.status(200).json({

            success: true,
            message: "Material deleted successfully"

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

const searchMaterials = async (req, res) => {
  try {

    const {
      keyword,
      category,
      unit,
      status
    } = req.query;

    const filter = {};

    if (keyword) {
      filter.$or = [
        {
          materialName: {
            $regex: keyword,
            $options: "i"
          }
        },
        {
          materialCode: {
            $regex: keyword,
            $options: "i"
          }
        }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (unit) {
      filter.unit = unit;
    }

    if (status) {
      filter.status = status;
    }

    const materials = await Material.find(filter);

    res.status(200).json(materials);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET SINGLE MATERIAL
const getSingleMaterial = async (req, res) => {
  try {

    // GET ID FROM URL
    const materialId = req.params.id;

    // FIND MATERIAL
    const material = await Material.findById(materialId);

    // CHECK MATERIAL EXISTS
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found"
      });
    }

    // SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: "Material fetched successfully",
      data: material
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });

  }
};


module.exports = {
    createMaterial, getAllMaterials, updateMaterial, deleteMaterial, getSingleMaterial, searchMaterials
};