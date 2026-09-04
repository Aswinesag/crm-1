import React from "react";

const HsnModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit
}) => {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-semibold">

            {isEdit
              ? "Edit HSN Code"
              : "Add HSN Code"}

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ×
          </button>

        </div>

        {/* HSN Code */}

        <div className="mb-4">

          <label className="block mb-2 font-medium">

            HSN Code
          </label>

          <input
            type="text"
            placeholder="Enter HSN Code"
            value={formData.hsnCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                hsnCode: e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
          />

        </div>

        {/* Description */}

        <div className="mb-4">

          <label className="block mb-2 font-medium">

            Description
          </label>

          <textarea
            rows="4"
            placeholder="Enter Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-orange-400"
          />

        </div>

        {/* GST Percentage */}

        <div className="mb-6">

          <label className="block mb-2 font-medium">

            GST Percentage
          </label>

          <select
            value={formData.gstPercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                gstPercentage: Number(e.target.value)
              })
            }
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
          >

            <option value="">
              Select GST Percentage
            </option>

            <option value={0}>
              0%
            </option>

            <option value={3}>
              3%
            </option>

            <option value={5}>
              5%
            </option>

            <option value={12}>
              12%
            </option>

            <option value={18}>
              18%
            </option>

            <option value={28}>
              28%
            </option>

          </select>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-lg"
          >
            {isEdit
              ? "Update"
              : "Save"}
          </button>

        </div>

      </div>

    </div>

  );

};

export default HsnModal;