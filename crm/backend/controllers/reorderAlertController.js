const RawMaterial = require("../models/RawMaterial");

// ==============================================
// GET ALL REORDER ALERTS
// ==============================================

const getReorderAlerts = async (req, res) => {

    try {

        const materials = await RawMaterial.find()
    .populate("unit");

const reorderItems = materials.filter((material) => {
    return material.currentStock <= material.minimumStock;
});

const alerts = reorderItems.map((material) => {

    const suggestedQuantity =
        material.minimumStock - material.currentStock;

    return {

        itemCode: material.materialCode,

        itemName: material.materialName,

        currentStock: material.currentStock,

        reorderLevel: material.minimumStock,

        suggestedQuantity,

        unit: material.unit?.name,

        status: "Reorder Required"

    };

});

res.status(200).json(alerts);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};
// ==============================================
// EXPORT
// ==============================================

module.exports = {
    getReorderAlerts
};