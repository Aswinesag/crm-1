import React from "react";

const StockOutModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  materials,
  warehouses,
  isEdit
}) => {

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">

        {/* Header */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-semibold">

            {isEdit ? "Edit Stock Out" : "Add Stock Out"}

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            ×
          </button>

        </div>

        {/* Form */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Date */}

          <div>

            <label className="block mb-2 font-medium">
              Date
            </label>

            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>

          {/* Material */}

          <div>

            <label className="block mb-2 font-medium">
              Raw Material
            </label>

            <select
              value={formData.material}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  material: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >

              <option value="">
                Select Material
              </option>

              {materials.map((material) => (

                <option
                  key={material._id}
                  value={material._id}
                >
                  {material.materialName}
                </option>

              ))}

            </select>

          </div>
                    {/* Warehouse */}

          <div>

            <label className="block mb-2 font-medium">
              Warehouse
            </label>

            <select
              value={formData.warehouse}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  warehouse: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            >

              <option value="">
                Select Warehouse
              </option>

              {warehouses.map((warehouse) => (

                <option
                  key={warehouse._id}
                  value={warehouse._id}
                >
                  {warehouse.warehouseName}
                </option>

              ))}

            </select>

          </div>

          {/* Quantity */}

          <div>

            <label className="block mb-2 font-medium">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              placeholder="Enter Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>

        </div>

        {/* Remarks */}

        <div className="mt-5">

          <label className="block mb-2 font-medium">
            Remarks
          </label>

          <textarea
            rows={4}
            placeholder="Enter Remarks (Optional)"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({
                ...formData,
                remarks: e.target.value
              })
            }
            className="w-full border rounded-lg px-3 py-2 resize-none"
          />

        </div>

        {/* Validation Message */}

        {
          (
            !formData.material ||
            !formData.warehouse ||
            !formData.quantity
          ) && (

            <div className="mt-4 text-sm text-red-500">

              Please select a material, warehouse, and enter a valid quantity.

            </div>

          )
        }
                {/* Action Buttons */}

        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={
              !formData.material ||
              !formData.warehouse ||
              !formData.quantity
            }
            className={`px-6 py-2 rounded-lg text-white ${
              !formData.material ||
              !formData.warehouse ||
              !formData.quantity
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#FB6514] hover:bg-orange-600"
            }`}
          >
            {isEdit ? "Update Stock Out" : "Save Stock Out"}
          </button>

        </div>

      </div>

    </div>

  );

};

export default StockOutModal;