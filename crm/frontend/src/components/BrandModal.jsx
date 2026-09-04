import React from "react";

const BrandModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-lg p-5">

        <h2 className="text-xl font-semibold mb-4">
          {isEdit
            ? "Edit Brand"
            : "Add Brand"}
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Brand Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description:
                  e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

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
            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

        </div>

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

export default BrandModal;