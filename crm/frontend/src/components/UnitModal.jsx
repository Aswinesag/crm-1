import React from "react";

const UnitModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">

        {/* Header */}

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-xl font-semibold">

            {isEdit
              ? "Edit Unit"
              : "Add Unit"}

          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            ×
          </button>

        </div>

        {/* Body */}

        <div className="p-6 space-y-5">

          {/* Unit Name */}

          <div>

            <label className="block mb-2 font-medium">

              Unit Name
              <span className="text-red-500">
                *
              </span>

            </label>

            <input
              type="text"
              placeholder="Enter Unit Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
            />

          </div>

          {/* Short Name */}

          <div>

            <label className="block mb-2 font-medium">

              Short Name

            </label>

            <input
              type="text"
              placeholder="Example : Kg, Pc, Ltr"
              value={formData.shortName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shortName:
                    e.target.value,
                })
              }
              className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
            />

          </div>

          {/* Status */}

          <div>

            <label className="block mb-2 font-medium">

              Status

            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status:
                    e.target.value,
                })
              }
              className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
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

        <div className="border-t px-6 py-4 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md border"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md hover:bg-orange-600"
          >

            {isEdit
              ? "Update Unit"
              : "Save Unit"}

          </button>

        </div>

      </div>

    </div>
  );
};

export default UnitModal;