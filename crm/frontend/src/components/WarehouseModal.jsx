import React from "react";

const WarehouseModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">

        {/* Header */}

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Warehouse" : "Add Warehouse"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-500"
          >
            ×
          </button>
        </div>

        {/* Form */}

        <div className="grid grid-cols-2 gap-4">

          {/* Warehouse Code */}

          <div>
            <label className="block mb-1 font-medium">
              Warehouse Code
            </label>

            <input
              type="text"
              name="warehouseCode"
              value={formData.warehouseCode}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter Warehouse Code"
            />
          </div>

          {/* Warehouse Name */}

          <div>
            <label className="block mb-1 font-medium">
              Warehouse Name
            </label>

            <input
              type="text"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter Warehouse Name"
            />
          </div>

          {/* Location */}

          <div>
            <label className="block mb-1 font-medium">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter Location"
            />
          </div>

          {/* Manager Name */}

          <div>
            <label className="block mb-1 font-medium">
              Manager Name
            </label>

            <input
              type="text"
              name="managerName"
              value={formData.managerName}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter Manager Name"
            />
          </div>

          {/* Contact Number */}

          <div>
            <label className="block mb-1 font-medium">
              Contact Number
            </label>

            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter Contact Number"
            />
          </div>

          {/* Status */}

          <div>
            <label className="block mb-1 font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md border"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            {isEdit ? "Update" : "Save"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default WarehouseModal;