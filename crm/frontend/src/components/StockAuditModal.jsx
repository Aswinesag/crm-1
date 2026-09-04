import React, { useEffect, useState } from "react";

import {
  getRawMaterials,
} from "../services/rawMaterialService";

import {
  getWarehouses,
} from "../services/warehouseService";

const StockAuditModal = ({
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

  // ==========================================
  // LOAD DATA
  // ==========================================

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

  // ==========================================
  // CALCULATE DIFFERENCE
  // ==========================================

  useEffect(() => {

    const system = Number(formData.systemStock) || 0;

    const physical = Number(formData.physicalStock) || 0;

    setFormData((prev) => ({
      ...prev,
      difference: physical - system,
    }));

  }, [
    formData.systemStock,
    formData.physicalStock,
  ]);

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 overflow-y-auto">

      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">

        <h2 className="text-2xl font-semibold mb-6">

          Add Stock Audit

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

                {/* Audit Date */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Audit Date

                  </label>

                  <input
                    type="date"
                    value={formData.auditDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        auditDate: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                  />

                </div>

                {/* Warehouse */}

                <div className="mb-4">

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

                {/* System Stock */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    System Stock

                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.systemStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemStock: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="Enter System Stock"
                  />

                </div>

                {/* Physical Stock */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Physical Stock

                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.physicalStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        physicalStock: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="Enter Physical Stock"
                  />

                </div>

                {/* Difference */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Difference

                  </label>

                  <input
                    type="number"
                    value={formData.difference}
                    readOnly
                    className="w-full border rounded-md p-2 bg-gray-100"
                  />

                </div>

                {/* Auditor */}

                <div className="mb-4">

                  <label className="block mb-2 font-medium">

                    Auditor

                  </label>

                  <input
                    type="text"
                    value={formData.auditor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        auditor: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="Enter Auditor Name"
                  />

                </div>

                {/* Status */}

                <div className="mb-4">

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
                    className="w-full border rounded-md p-2"
                  >

                    <option value="Pending">

                      Pending

                    </option>

                    <option value="Completed">

                      Completed

                    </option>

                    <option value="Approved">

                      Approved

                    </option>

                  </select>

                </div>

                {/* Remarks */}

                <div className="mb-6">

                  <label className="block mb-2 font-medium">

                    Remarks

                  </label>

                  <textarea
                    rows="3"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remarks: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2"
                    placeholder="Enter Remarks"
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

                    Save Audit

                  </button>

                </div>

              </>

            )

        }

      </div>

    </div>

  );

};

export default StockAuditModal;