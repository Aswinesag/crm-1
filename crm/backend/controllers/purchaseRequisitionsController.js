const PurchaseRequisition = require("../models/PurchaseRequisitions");

// =====================================================
// Generate Next Requisition Number (PR-0001, PR-0002...)
// =====================================================
const generateRequisitionNumber = async () => {
    const lastRequisition = await PurchaseRequisition
        .findOne()
        .sort({ createdAt: -1 });

    // No documents
    if (!lastRequisition) {
        return "PR-0001";
    }

    // Document exists but requisitionNo is missing
    if (!lastRequisition.requisitionNo) {
        return "PR-0001";
    }

    const parts = lastRequisition.requisitionNo.split("-");

    if (parts.length !== 2) {
        return "PR-0001";
    }

    const lastNumber = parseInt(parts[1], 10);

    if (isNaN(lastNumber)) {
        return "PR-0001";
    }

    return `PR-${String(lastNumber + 1).padStart(4, "0")}`;
};

// =====================================================
// Create Purchase Requisition
// =====================================================
exports.createPurchaseRequisition = async (req, res) => {
     console.log("Purchase Requisition Controller Called RIGHT");
    try {

        const {
            department,
            requestedBy,
            priority,
            requiredDate,
            remarks,
            status,
            items
        } = req.body;

        // Validation
        if (!department) {
            return res.status(400).json({
                success: false,
                message: "Department is required."
            });
        }

        if (!requestedBy) {
            return res.status(400).json({
                success: false,
                message: "Requested By is required."
            });
        }

        if (!requiredDate) {
            return res.status(400).json({
                success: false,
                message: "Required Date is required."
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one item is required."
            });
        }

        // Generate Requisition Number
        const requisitionNo = await generateRequisitionNumber();

        // Create Purchase Requisition
        const purchaseRequisition =
            await PurchaseRequisition.create({

                requisitionNo,

                department,

                requestedBy,

                priority,

                requiredDate,

                remarks,

                status,

                items

            });

        res.status(201).json({
            success: true,
            message: "Purchase Requisition created successfully.",
            data: purchaseRequisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }
};

// =====================================================
// Get All Purchase Requisitions
// =====================================================
exports.getAllPurchaseRequisitions = async (req, res) => {
    try {

        const requisitions = await PurchaseRequisition.find()

            .populate("items.material", "materialName materialCode unit")

            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requisitions.length,
            data: requisitions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }
};

// =====================================================
// Get Purchase Requisition By ID
// =====================================================
exports.getPurchaseRequisitionById = async (req, res) => {

    try {

        const requisition = await PurchaseRequisition.findById(
            req.params.id
        ).populate(
            "items.material",
            "materialName materialCode category unit currentStock"
        );

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        res.status(200).json({
            success: true,
            data: requisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};
// =====================================================
// Update Purchase Requisition
// =====================================================
exports.updatePurchaseRequisition = async (req, res) => {
    try {

        const {
            department,
            requestedBy,
            priority,
            requiredDate,
            remarks,
            status,
            items
        } = req.body;

        const requisition = await PurchaseRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        requisition.department = department || requisition.department;
        requisition.requestedBy = requestedBy || requisition.requestedBy;
        requisition.priority = priority || requisition.priority;
        requisition.requiredDate = requiredDate || requisition.requiredDate;
        requisition.remarks = remarks ?? requisition.remarks;
        requisition.status = status || requisition.status;

        if (items && items.length > 0) {
            requisition.items = items;
        }

        await requisition.save();

        res.status(200).json({
            success: true,
            message: "Purchase Requisition updated successfully.",
            data: requisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }
};

// =====================================================
// Delete Purchase Requisition
// =====================================================
exports.deletePurchaseRequisition = async (req, res) => {

    try {

        const requisition = await PurchaseRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        await requisition.deleteOne();

        res.status(200).json({
            success: true,
            message: "Purchase Requisition deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};

// =====================================================
// Approve Purchase Requisition
// =====================================================
exports.approvePurchaseRequisition = async (req, res) => {

    try {

        const requisition = await PurchaseRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        requisition.status = "Approved";

        await requisition.save();

        res.status(200).json({
            success: true,
            message: "Purchase Requisition approved successfully.",
            data: requisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};

// =====================================================
// Reject Purchase Requisition
// =====================================================
exports.rejectPurchaseRequisition = async (req, res) => {

    try {

        const requisition = await PurchaseRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        requisition.status = "Rejected";

        await requisition.save();

        res.status(200).json({
            success: true,
            message: "Purchase Requisition rejected successfully.",
            data: requisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};

// =====================================================
// Mark as Ordered
// =====================================================
exports.markAsOrdered = async (req, res) => {

    try {

        const requisition = await PurchaseRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        if (requisition.status !== "Approved") {
            return res.status(400).json({
                success: false,
                message: "Only approved requisitions can be marked as Ordered."
            });
        }

        requisition.status = "Ordered";

        await requisition.save();

        res.status(200).json({
            success: true,
            message: "Purchase Requisition marked as Ordered.",
            data: requisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};

// =====================================================
// Mark as Completed
// =====================================================
exports.markAsCompleted = async (req, res) => {

    try {

        const requisition = await PurchaseRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: "Purchase Requisition not found."
            });
        }

        if (requisition.status !== "Ordered") {
            return res.status(400).json({
                success: false,
                message: "Only ordered requisitions can be completed."
            });
        }

        requisition.status = "Completed";

        await requisition.save();

        res.status(200).json({
            success: true,
            message: "Purchase Requisition completed successfully.",
            data: requisition
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};

// =====================================================
// Purchase Requisition Dashboard
// =====================================================
exports.getPurchaseRequisitionDashboard = async (req, res) => {

    try {

        const total = await PurchaseRequisition.countDocuments();

        const pending = await PurchaseRequisition.countDocuments({
            status: "Pending"
        });

        const approved = await PurchaseRequisition.countDocuments({
            status: "Approved"
        });

        const rejected = await PurchaseRequisition.countDocuments({
            status: "Rejected"
        });

        const ordered = await PurchaseRequisition.countDocuments({
            status: "Ordered"
        });

        const completed = await PurchaseRequisition.countDocuments({
            status: "Completed"
        });

        const draft = await PurchaseRequisition.countDocuments({
            status: "Draft"
        });

        const recent = await PurchaseRequisition.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate(
                "items.material",
                "materialName materialCode"
            );

        res.status(200).json({
            success: true,
            data: {
                total,
                draft,
                pending,
                approved,
                rejected,
                ordered,
                completed,
                recent
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });

    }

};