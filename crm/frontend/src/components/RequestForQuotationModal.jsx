import React, {
  useEffect,
  useState,
} from "react";

import { getPurchaseRequisitions } from "../services/PurchaseRequisitionService";
import { getAllVendors } from "../services/vendorService";

const RequestForQuotationModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
}) => {
  const [
    purchaseRequisitions,
    setPurchaseRequisitions,
  ] = useState([]);

  const [vendors, setVendors] =
    useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPurchaseRequisitions();
      fetchVendors();
    }
  }, [isOpen]);

  const fetchPurchaseRequisitions =
    async () => {
      try {
        const response =
          await getPurchaseRequisitions();

        console.log("get Purchase Requisitions:",response.data);

        setPurchaseRequisitions(
          response.data.data || []
        );
      } catch (error) {
        console.log(error);
      }
    };

  const fetchVendors =
    async () => {
      try {
        const response =
        await getAllVendors();

        console.log("get All Vendors:",response.data);

        setVendors(
        response.data || []
        );
      } catch (error) {
        console.log(error);
      }
    };

  const handleVendorChange = (
    e
  ) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    console.log("Selected Vendors:", values);

    setFormData({
      ...formData,
      vendorIds: values,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[600px] rounded-lg p-5">

        <h2 className="text-xl font-semibold mb-5">
          {isEdit
            ? "Edit Request For Quotation"
            : "Add Request For Quotation"}
        </h2>

        <div className="space-y-4">

          {/* Purchase Requisition */}

          <select
            value={
              formData.purchaseRequisition
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                purchaseRequisition:
                  e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">
              Select Purchase Requisition
            </option>

            {purchaseRequisitions.map(
              (pr) => (
                <option
                  key={pr._id}
                  value={pr._id}
                >
                  {pr.requisitionNo}
                </option>
              )
            )}
          </select>

          {/* Vendors */}

          <select
            multiple
            value={
              formData.vendorIds
            }
            onChange={
              handleVendorChange
            }
            className="w-full border rounded-lg px-3 py-2 h-40"
          >
            {vendors.map(
              (vendor) => (
                <option
                  key={vendor._id}
                  value={vendor._id}
                >
                  {vendor.vendorName}
                </option>
              )
            )}
          </select>

          <p className="text-xs text-gray-500">
            Hold Ctrl (Windows) or Cmd
            (Mac) to select multiple
            vendors.
          </p>

          {/* Required Date */}

          <input
            type="date"
            value={
              formData.requiredDate
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                requiredDate:
                  e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Remarks */}

          <textarea
            rows={4}
            placeholder="Remarks"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({
                ...formData,
                remarks:
                  e.target.value,
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="bg-[#FB6514] text-white px-4 py-2 rounded"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
};

export default RequestForQuotationModal;