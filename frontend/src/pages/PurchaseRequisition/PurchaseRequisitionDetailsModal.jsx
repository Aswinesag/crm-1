import { useState } from "react";

const PurchaseRequisitionDetailsModal = ({
  open,
  onClose,
  purchaseRequisition,
  onStatusUpdate,
}) => {
  const [approvedBy, setApprovedBy] =
    useState("");

  if (!open || !purchaseRequisition)
    return null;

  const handleStatusChange = (
    status
  ) => {
    const payload = {
      status,
    };

    if (status === "APPROVED") {
      payload.approvedBy =
        approvedBy;
    }

    onStatusUpdate(
      purchaseRequisition._id,
      payload
    );
  };

  const getStatusColor = (
    status
  ) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Purchase Requisition Details
          </h2>

          <button
            onClick={onClose}
            className="text-red-500 text-xl font-bold"
          >
            ✕
          </button>

        </div>

        {/* PR Number */}

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>
            <p className="text-gray-500">
              PR Number
            </p>

            <p className="font-semibold">
              {
                purchaseRequisition.prNumber
              }
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Status
            </p>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                purchaseRequisition.status
              )}`}
            >
              {
                purchaseRequisition.status
              }
            </span>
          </div>

        </div>

        {/* Material Details */}

        <div className="border rounded p-4 mb-6">

          <h3 className="font-bold text-lg mb-4">
            Material Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-gray-500">
                Material Name
              </p>

              <p>
                {
                  purchaseRequisition
                    .materialId
                    ?.materialName
                }
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Quantity
              </p>

              <p>
                {
                  purchaseRequisition.quantity
                }
              </p>
            </div>

          </div>

        </div>

        {/* Request Information */}

        <div className="border rounded p-4 mb-6">

          <h3 className="font-bold text-lg mb-4">
            Request Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-gray-500">
                Department
              </p>

              <p>
                {
                  purchaseRequisition.department
                }
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Priority
              </p>

              <p>
                {
                  purchaseRequisition.priority
                }
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Requested By
              </p>

              <p>
                {
                  purchaseRequisition.requestedBy
                }
              </p>
            </div>

            <div>
              <p className="text-gray-500">
                Required Date
              </p>

              <p>
                {new Date(
                  purchaseRequisition.requiredDate
                ).toLocaleDateString()}
              </p>
            </div>

          </div>

        </div>

        {/* Justification */}

        <div className="border rounded p-4 mb-6">

          <h3 className="font-bold mb-2">
            Justification
          </h3>

          <p>
            {
              purchaseRequisition.justification ||
              "N/A"
            }
          </p>

        </div>

        {/* Remarks */}

        <div className="border rounded p-4 mb-6">

          <h3 className="font-bold mb-2">
            Remarks
          </h3>

          <p>
            {
              purchaseRequisition.remarks ||
              "N/A"
            }
          </p>

        </div>

        {/* Approval Section */}

        {purchaseRequisition.status ===
          "PENDING" && (
          <div className="border rounded p-4 mb-6">

            <h3 className="font-bold mb-4">
              Approval Actions
            </h3>

            <input
              type="text"
              placeholder="Approved By"
              value={approvedBy}
              onChange={(e) =>
                setApprovedBy(
                  e.target.value
                )
              }
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex gap-3">

              <button
                onClick={() =>
                  handleStatusChange(
                    "APPROVED"
                  )
                }
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  handleStatusChange(
                    "REJECTED"
                  )
                }
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>

              <button
                onClick={() =>
                  handleStatusChange(
                    "CANCELLED"
                  )
                }
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>
        )}

        {/* Approved Info */}

        {purchaseRequisition.approvedBy && (
          <div className="border rounded p-4 mb-6">

            <h3 className="font-bold mb-2">
              Approval Information
            </h3>

            <p>
              Approved By :
              {" "}
              {
                purchaseRequisition.approvedBy
              }
            </p>

          </div>
        )}

        {/* Footer */}

        <div className="flex justify-end">

          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
};

export default PurchaseRequisitionDetailsModal;