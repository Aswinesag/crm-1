import React from "react";

const ComponentModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  categories,
  units,
  suppliers,
  warehouses,
  isEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">

        <div className="flex items-center justify-between border-b px-6 py-4">

          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Component" : "Add Component"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            ×
          </button>

        </div>

        <div className="p-6">

          <div className="grid grid-cols-2 gap-4">
                    <div>

              <label className="block mb-2 font-medium">
                Component Code
              </label>

              <input
                type="text"
                value={formData.componentCode}
                readOnly
                className="w-full border rounded-md px-3 py-2 bg-gray-100"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Component Name
              </label>

              <input
                type="text"
                value={formData.componentName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    componentName: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Category
              </label>

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              >

                <option value="">
                  Select Category
                </option>

                {categories.map((category) => (

                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Unit
              </label>

              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              >

                <option value="">
                  Select Unit
                </option>

                {units.map((unit) => (

                  <option
                    key={unit._id}
                    value={unit._id}
                  >
                    {unit.name}
                  </option>

                ))}

              </select>

            </div>
                    <div>

              <label className="block mb-2 font-medium">
                Supplier
              </label>

              <select
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplier: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              >

                <option value="">
                  Select Supplier
                </option>

                {suppliers.map((supplier) => (

                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >
                    {supplier.name}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Warehouse
              </label>

              <select
                value={formData.warehouse}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    warehouse: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
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

            <div>

              <label className="block mb-2 font-medium">
                Cost Price
              </label>

              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Stock Quantity
              </label>

              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: e.target.value,
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />

            </div>

            <div className="col-span-2">

              <label className="block mb-2 font-medium">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
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

          <div className="flex justify-end gap-3 mt-6">

            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-[#FB6514] text-white rounded-md hover:bg-[#e85b10]"
            >
              {isEdit ? "Update Component" : "Save Component"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ComponentModal;