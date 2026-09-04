import React,
{
  useEffect,
  useState
}
from "react";

import
{
  getAllVendors
}
from "../services/supplierPaymentService";

//=====================================================
// Supplier Payment Modal
//=====================================================

const SupplierPaymentModal = (
{
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit
}) =>
{
  //---------------------------------------------------
  // States
  //---------------------------------------------------

  const
  [
    vendors,
    setVendors
  ] = useState([]);

  //---------------------------------------------------
  // Load Vendors
  //---------------------------------------------------

  useEffect(() =>
  {
    loadVendors();
  }, []);

  const loadVendors = async () =>
  {
    try
    {
      const
      {
        data
      } = await getAllVendors();

      setVendors(
        data.data || []
      );
    }
    catch (error)
    {
      console.log(error);
    }
  };

  //---------------------------------------------------
  // Close Modal
  //---------------------------------------------------

  if (!isOpen)
    return null;

  //---------------------------------------------------
  // JSX
  //---------------------------------------------------

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[650px] rounded-lg p-5">

        <h2 className="text-xl font-semibold mb-4">

          {
            isEdit
              ? "Edit Supplier Payment"
              : "Add Supplier Payment"
          }

        </h2>

        <div className="grid grid-cols-2 gap-4">

          {/* Payment Number */}

          <input
            type="text"
            placeholder="Payment Number"
            value={formData.paymentNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentNumber:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Payment Date */}

          <input
            type="date"
            value={formData.paymentDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentDate:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Vendor */}

          <select
            value={formData.supplier}
            onChange={(e) =>
              setFormData({
                ...formData,
                supplier:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          >

            <option value="">
              Select Vendor
            </option>

            {
              vendors.map(
                (vendor) =>
                (
                  <option
                    key={vendor._id}
                    value={vendor._id}
                  >
                    {vendor.vendorName}
                  </option>
                )
              )
            }

          </select>

          {/* Amount */}

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
                    {/* Payment Method */}

          <select
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentMethod:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          >

            <option value="">
              Select Payment Method
            </option>

            <option value="Cash">
              Cash
            </option>

            <option value="Cheque">
              Cheque
            </option>

            <option value="Bank Transfer">
              Bank Transfer
            </option>

            <option value="UPI">
              UPI
            </option>

          </select>

          {/* Reference Number */}

          <input
            type="text"
            placeholder="Reference Number"
            value={formData.referenceNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                referenceNumber:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Status */}

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          >

            <option value="Pending">
              Pending
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Failed">
              Failed
            </option>

          </select>

        </div>

        {/* Remarks */}

        <div className="mt-4">

          <textarea
            placeholder="Remarks"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({
                ...formData,
                remarks:
                  e.target.value
              })
            }
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3 mt-5">

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

export default SupplierPaymentModal;