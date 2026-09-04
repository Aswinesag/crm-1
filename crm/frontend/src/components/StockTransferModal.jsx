import React, { useEffect, useState } from "react";

import {
  getRawMaterials,
} from "../services/rawMaterialService";

import {
  getWarehouses,
} from "../services/warehouseService";

const StockTransferModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
}) => {

  const [materials, setMaterials] = useState([]);

  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD MATERIALS
  // ==========================================

  const fetchMaterials = async () => {

    try {

      const response = await getRawMaterials(
        1,
        1000,
        ""
      );

      setMaterials(
        response.data.data || []
      );

    } catch (error) {

      console.log(error);

    }

  };

  // ==========================================
  // LOAD WAREHOUSES
  // ==========================================

  const fetchWarehouses = async () => {

    try {

      const response = await getWarehouses(
        1,
        1000,
        ""
      );

      setWarehouses(
        response.data.data || []
      );

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    if (isOpen) {

      setLoading(true);

      Promise.all([
        fetchMaterials(),
        fetchWarehouses(),
      ]).finally(() => {

        setLoading(false);

      });

    }

  }, [isOpen]);

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 overflow-y-auto">

      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">

        <h2 className="text-2xl font-semibold mb-6">

          Add Stock Transfer

        </h2>

        {
          loading ?

            (
              <div className="py-10 text-center">

                Loading...

              </div>
            )

            :

            (

              <>

                {/* Date */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Transfer Date

                  </label>

                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                  />

                </div>

                {/* Material */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Raw Material

                  </label>

                  <select
                    value={formData.material}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        material: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                  >

                    <option value="">
                      Select Material
                    </option>

                    {

                      materials.map((item) => (

                        <option
                          key={item._id}
                          value={item._id}
                        >

                          {item.materialName}

                        </option>

                      ))

                    }

                  </select>

                </div>

                {/* From Warehouse */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    From Warehouse

                  </label>

                  <select
                    value={formData.fromWarehouse}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fromWarehouse: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
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

                {/* To Warehouse */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    To Warehouse

                  </label>

                  <select
                    value={formData.toWarehouse}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        toWarehouse: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
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

                {/* Quantity */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Quantity

                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="Enter Quantity"
                  />

                </div>

                {/* Notes */}

                <div className="mb-6">

                  <label className="block mb-2 font-medium">

                    Notes

                  </label>

                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="Enter Notes"
                  />

                </div>

                {/* Buttons */}

                <div className="flex justify-end gap-3">

                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-gray-500 text-white rounded-md"
                  >

                    Cancel

                  </button>

                  <button
                    onClick={onSubmit}
                    className="px-5 py-2 bg-[#FB6514] text-white rounded-md"
                  >

                    Save Transfer

                  </button>

                </div>

              </>

            )

        }

      </div>

    </div>

  );

};

export default StockTransferModal;