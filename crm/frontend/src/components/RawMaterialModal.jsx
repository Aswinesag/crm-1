import React from "react";

const RawMaterialModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  categories = [],
  units = [],
  suppliers = [],
  warehouses = [],
  isEdit
}) => {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">

      <div className="bg-white w-[750px] rounded-lg shadow-lg p-6 my-10">

        {/* ===============================
            TITLE
        =============================== */}

        <h2 className="text-2xl font-semibold mb-6">

          {
            isEdit
              ? "Edit Raw Material"
              : "Add Raw Material"
          }

        </h2>


        {/* ===============================
            FORM
        =============================== */}

        <div className="grid grid-cols-2 gap-5">


          {/* =====================================
                MATERIAL NAME
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Material Name
              <span className="text-red-500">*</span>

            </label>

            <input
              type="text"
              placeholder="Enter Material Name"
              value={formData.materialName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  materialName: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400"
            />

          </div>



          {/* =====================================
                CATEGORY
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Category
              <span className="text-red-500">*</span>

            </label>

            <select

              value={formData.category}

              onChange={(e) =>
                setFormData({

                  ...formData,

                  category: e.target.value

                })
              }

              className="w-full border rounded-lg px-3 py-2"

            >

              <option value="">

                Select Category

              </option>

              {
                categories.map((category) => (

                  <option
                    key={category._id}
                    value={category._id}
                  >

                    {category.name}

                  </option>

                ))
              }

            </select>

          </div>



          {/* =====================================
                UNIT
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Unit
              <span className="text-red-500">*</span>

            </label>

            <select

              value={formData.unit}

              onChange={(e) =>
                setFormData({

                  ...formData,

                  unit: e.target.value

                })
              }

              className="w-full border rounded-lg px-3 py-2"

            >

              <option value="">

                Select Unit

              </option>

              {
                units.map((unit) => (

                  <option
                    key={unit._id}
                    value={unit._id}
                  >

                    {unit.name}

                  </option>

                ))
              }

            </select>

          </div>



          {/* =====================================
                SUPPLIER
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Supplier

            </label>

            <select

              value={formData.supplier}

              onChange={(e) =>
                setFormData({

                  ...formData,

                  supplier: e.target.value

                })
              }

              className="w-full border rounded-lg px-3 py-2"

            >

              <option value="">

                Select Supplier

              </option>

              {
                suppliers.map((supplier) => (

                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >

                    {supplier.name}

                  </option>

                ))
              }

            </select>

          </div>

                    {/* =====================================
                WAREHOUSE
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Warehouse
              <span className="text-red-500">*</span>

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

              {
                warehouses.map((warehouse) => (

                  <option
                    key={warehouse._id}
                    value={warehouse._id}
                  >

                    {warehouse.warehouseName}

                  </option>

                ))
              }

            </select>

          </div>



          {/* =====================================
                COST PRICE
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Cost Price
              <span className="text-red-500">*</span>

            </label>

            <input
              type="number"
              min="0"
              placeholder="Enter Cost Price"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  costPrice: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>



          {/* =====================================
                MINIMUM STOCK
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Minimum Stock

            </label>

            <input
              type="number"
              min="0"
              placeholder="Enter Minimum Stock"
              value={formData.minimumStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumStock: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>



          {/* =====================================
                REORDER LEVEL
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Reorder Level

            </label>

            <input
              type="number"
              min="0"
              placeholder="Enter Reorder Level"
              value={formData.reorderLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reorderLevel: e.target.value
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />

          </div>



          {/* =====================================
                CURRENT STOCK
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Current Stock

            </label>

            <input
              type="number"
              value={formData.currentStock || 0}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />

          </div>



          {/* =====================================
                STATUS
          ===================================== */}

          <div>

            <label className="block mb-2 font-medium">

              Status

            </label>

            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value
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

        </div>



        {/* =====================================
              BUTTONS
        ===================================== */}

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="bg-[#FB6514] text-white px-5 py-2 rounded-lg hover:bg-orange-600"
          >
            {isEdit ? "Update" : "Save"}
          </button>

        </div>

      </div>

    </div>

  );

};

export default RawMaterialModal;