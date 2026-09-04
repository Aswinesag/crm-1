import React, { useEffect, useState } from "react";

import {
  createPurchaseRequisition,
  updatePurchaseRequisition,
} from "../services/PurchaseRequisitionService";

import { getAllMaterials } from "../services/materialService";

const PurchaseRequisitionModal = ({
  isOpen,
  purchaseRequisition,
  onClose,
  onSuccess,
}) => {
  // =====================================
  // States
  // =====================================
  const [loading, setLoading] = useState(false);

  const [materials, setMaterials] = useState([]);

  const [formData, setFormData] = useState({
    requisitionNo: "",
    requestDate: "",
    department: "",
    requestedBy: "",
    priority: "Medium",
    requiredDate: "",
    remarks: "",
    status: "Pending",

    items: [
      {
        material: "",
        quantity: 1,
        unit: "",
        currentStock: 0,
        requiredQty: 1,
      },
    ],
  });

  
  // =====================================
  // Fetch Materials
  // =====================================
  const fetchMaterials = async () => {
    try {
      const response = await getAllMaterials();

      const data = response.data;

      setMaterials(data.materials || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  // =====================================
  // useEffect
  // =====================================
  useEffect(() => {
    fetchMaterials();

    if (purchaseRequisition) {
      setFormData({
        requisitionNo: purchaseRequisition.requisitionNo || "",
        requestDate: purchaseRequisition.requestDate
          ? purchaseRequisition.requestDate.substring(0, 10)
          : "",
        department: purchaseRequisition.department || "",
        requestedBy: purchaseRequisition.requestedBy || "",
        priority: purchaseRequisition.priority || "Medium",
        requiredDate: purchaseRequisition.requiredDate
          ? purchaseRequisition.requiredDate.substring(0, 10)
          : "",
        remarks: purchaseRequisition.remarks || "",
        status: purchaseRequisition.status || "Pending",
        items:
          purchaseRequisition.items?.length > 0
            ? purchaseRequisition.items
            : [
                {
                  material: "",
                  quantity: 1,
                  unit: "",
                  currentStock: 0,
                  requiredQty: 1,
                },
              ],
      });
    }
  }, [purchaseRequisition]);
    // =====================================
  // Handle Header Field Change
  // =====================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // Handle Item Change
  // =====================================
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = value;

    // Auto Fill Unit & Current Stock
    if (field === "material") {
      const selectedMaterial = materials.find(
        (mat) => mat._id === value
      );

      if (selectedMaterial) {
        updatedItems[index].unit =
          selectedMaterial.unit || "";

        updatedItems[index].currentStock =
          selectedMaterial.currentStock || 0;
      }
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // =====================================
  // Add Item
  // =====================================
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          material: "",
          quantity: 1,
          unit: "",
          currentStock: 0,
          requiredQty: 1,
        },
      ],
    });
  };

  // =====================================
  // Remove Item
  // =====================================
  const removeItem = (index) => {
    const updatedItems = [...formData.items];

    updatedItems.splice(index, 1);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // =====================================
  // Submit Form
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (purchaseRequisition) {
        await updatePurchaseRequisition(
          purchaseRequisition._id,
          formData
        );
      } else {
        await createPurchaseRequisition(formData);
      }

      onSuccess();
    } catch (error) {
      console.error(
        "Error saving Purchase Requisition:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">

        {/* ============================
            Header
        ============================ */}
        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-xl font-bold">
            {purchaseRequisition
              ? "Edit Purchase Requisition"
              : "Add Purchase Requisition"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            ×
          </button>

        </div>

        {/* ============================
            Form
        ============================ */}
        <form onSubmit={handleSubmit} className="p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* PR Number */}
            <div>
              <label className="block mb-1 font-medium">
                PR Number
              </label>

              <input
                type="text"
                name="requisitionNo"
                value={formData.requisitionNo}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block mb-1 font-medium">
                Department
              </label>

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Requested By */}
            <div>
              <label className="block mb-1 font-medium">
                Requested By
              </label>

              <input
                type="text"
                name="requestedBy"
                value={formData.requestedBy}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block mb-1 font-medium">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Required Date */}
            <div>
              <label className="block mb-1 font-medium">
                Required Date
              </label>

              <input
                type="date"
                name="requiredDate"
                value={formData.requiredDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block mb-1 font-medium">
                Remarks
              </label>

              <textarea
                name="remarks"
                rows="3"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

          </div>
                    {/* =====================================
              Items Table
          ===================================== */}
          <div className="mt-8">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-lg font-semibold">
                Requisition Items
              </h3>

              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                + Add Item
              </button>

            </div>

            <div className="overflow-x-auto border rounded-lg">

              <table className="min-w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="border px-4 py-2 text-left">
                      Material
                    </th>

                    <th className="border px-4 py-2 text-left">
                      Quantity
                    </th>

                    <th className="border px-4 py-2 text-left">
                      Unit
                    </th>

                    <th className="border px-4 py-2 text-left">
                      Current Stock
                    </th>

                    <th className="border px-4 py-2 text-left">
                      Required Qty
                    </th>

                    <th className="border px-4 py-2 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {formData.items.map((item, index) => (

                    <tr key={index}>

                      {/* Material */}
                      <td className="border p-2">

                        <select
                          value={item.material}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "material",
                              e.target.value
                            )
                          }
                          className="w-full border rounded px-2 py-2"
                        >
                          <option value="">
                            Select Material
                          </option>

                          {materials.map((material) => (

                            <option
                              key={material._id}
                              value={material._id}
                            >
                              {material.materialCode} -{" "}
                              {material.materialName}
                            </option>

                          ))}

                        </select>

                      </td>

                      {/* Quantity */}
                      <td className="border p-2">

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border rounded px-2 py-2"
                        />

                      </td>

                      {/* Unit */}
                      <td className="border p-2">

                        <input
                          type="text"
                          value={item.unit}
                          readOnly
                          className="w-full border rounded px-2 py-2 bg-gray-100"
                        />

                      </td>

                      {/* Current Stock */}
                      <td className="border p-2">

                        <input
                          type="number"
                          value={item.currentStock}
                          readOnly
                          className="w-full border rounded px-2 py-2 bg-gray-100"
                        />

                      </td>

                      {/* Required Qty */}
                      <td className="border p-2">

                        <input
                          type="number"
                          min="1"
                          value={item.requiredQty}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "requiredQty",
                              Number(e.target.value)
                            )
                          }
                          className="w-full border rounded px-2 py-2"
                        />

                      </td>

                      {/* Remove Item */}
                      <td className="border p-2 text-center">

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          className={`px-3 py-2 rounded text-white ${
                            formData.items.length === 1
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          Remove
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* =====================================
              Footer Buttons
          ===================================== */}
          <div className="flex justify-end gap-3 mt-8">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
            >
              {loading
                ? "Saving..."
                : purchaseRequisition
                ? "Update"
                : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default PurchaseRequisitionModal;