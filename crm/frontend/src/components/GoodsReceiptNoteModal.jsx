import React, {
  useEffect,
  useState,
} from "react";

import {
  getPurchaseOrders,
} from "../services/purchaseOrderService";

import {
  getWarehouses,
} from "../services/warehouseService";

import {
  getUsers,
} from "../services/userService";

//==================================================
// Goods Receipt Note Modal
//==================================================

const GoodsReceiptNoteModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
}) => {

  //==================================================
  // Initial Form
  //==================================================

  const initialForm = {
    grnNumber: "",
    grnDate: new Date().toISOString().split("T")[0],

    purchaseOrder: "",
    supplier: "",
    warehouse: "",

    invoiceNumber: "",

    receivedBy: "",

    status: "Pending",

    remarks: "",

    items: [],
  };

  //==================================================
  // States
  //==================================================

  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [warehouses, setWarehouses] = useState([]);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  //==================================================
  // Fetch Purchase Orders
  //==================================================

  const fetchPurchaseOrders = async () => {
    try {

      const response = await getPurchaseOrders();

      console.log("Purchase Orders :", response);

      if (Array.isArray(response)) {
        setPurchaseOrders(response);
      }
      else if (response?.purchaseOrders) {
        setPurchaseOrders(response.purchaseOrders);
      }
      else if (response?.data?.purchaseOrders) {
        setPurchaseOrders(response.data.purchaseOrders);
      }
      else {
        setPurchaseOrders([]);
      }

    } catch (error) {

      console.error("Purchase Orders Error :", error);

      setPurchaseOrders([]);

    }
  };

  //==================================================
  // Fetch Warehouses
  //==================================================

  const fetchWarehouses = async () => {

    try {

      const response = await getWarehouses();

      console.log("Warehouses :", response);

      if (Array.isArray(response)) {
        setWarehouses(response);
      }
      else if (response?.warehouses) {
        setWarehouses(response.warehouses);
      }
      else if (response?.data?.warehouses) {
        setWarehouses(response.data.warehouses);
      }
      else {
        setWarehouses([]);
      }

    } catch (error) {

      console.error("Warehouse Error :", error);

      setWarehouses([]);

    }
  };

  //==================================================
  // Fetch Users
  //==================================================

  const fetchUsers = async () => {

    try {

      const response = await getUsers();

      console.log("Users :", response);

      if (Array.isArray(response)) {
        setUsers(response);
      }
      else if (response?.users) {
        setUsers(response.users);
      }
      else if (response?.data?.users) {
        setUsers(response.data.users);
      }
      else {
        setUsers([]);
      }

    } catch (error) {

      console.error("Users Error :", error);

      setUsers([]);

    }
  };

  //==================================================
  // Load Dropdown Data
  //==================================================

  useEffect(() => {

    if (!isOpen) return;

    fetchPurchaseOrders();

    fetchWarehouses();

    fetchUsers();

  }, [isOpen]);

  //==================================================
  // Populate Edit Data
  //==================================================

  useEffect(() => {

    if (!isOpen) return;

    if (isEdit && formData) {

      setFormData({
        ...initialForm,
        ...formData,
      });

    } else {

      setFormData(initialForm);

      setErrors({});
    }

  }, [isOpen, isEdit]);

  //==================================================
  // Reset Form
  //==================================================

  const resetForm = () => {

    setFormData(initialForm);

    setErrors({});

  };
    //==================================================
  // Input Change Handler
  //==================================================

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove validation error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  //==================================================
  // Item Change Handler
  //==================================================

  const handleItemChange = (index, field, value) => {

    const updatedItems = [...formData.items];

    updatedItems[index][field] = value;

    // -----------------------------
    // Auto Calculate Rejected Qty
    // -----------------------------

    const receivedQty =
      Number(updatedItems[index].receivedQty) || 0;

    const acceptedQty =
      Number(updatedItems[index].acceptedQty) || 0;

    let rejectedQty = receivedQty - acceptedQty;

    if (rejectedQty < 0) {
      rejectedQty = 0;
    }

    updatedItems[index].rejectedQty = rejectedQty;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  //==================================================
  // Remove Item
  //==================================================

  const removeItem = (index) => {

    // Prevent deleting the last row
    if (formData.items.length <= 1) {
      return;
    }

    const updatedItems = [...formData.items];

    updatedItems.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  //==================================================
  // Reset Form
  //==================================================

  const handleReset = () => {

    setFormData(initialForm);

    setErrors({});

  };
    //==================================================
  // Purchase Order Change Handler
  //==================================================

  const handlePurchaseOrderChange = (e) => {

    const purchaseOrderId = e.target.value;

    // Find selected Purchase Order
    const selectedPO = purchaseOrders.find(
      (po) => po._id === purchaseOrderId
    );

    if (!selectedPO) {

      setFormData((prev) => ({
        ...prev,
        purchaseOrder: "",
        supplier: "",
        items: [],
      }));

      return;
    }

    // Convert PO Items to GRN Items
    const grnItems = (selectedPO.items || []).map((item) => ({

      material:
        item.material?._id || item.material || "",

      materialName:
        item.material?.name ||
        item.material?.materialName ||
        "",

      orderedQty:
        Number(item.quantity) || 0,

      unit:
        item.unit || "",

      receivedQty: 0,

      acceptedQty: 0,

      rejectedQty: 0,

      remarks: "",

    }));

    // Populate Form
    setFormData((prev) => ({
      ...prev,

      purchaseOrder: purchaseOrderId,

      supplier:
        selectedPO.supplier?._id ||
        selectedPO.supplier ||
        "",

      items: grnItems,
    }));

    // Clear validation errors
    setErrors((prev) => ({
      ...prev,
      purchaseOrder: "",
      supplier: "",
      items: "",
    }));
  };

  //==================================================
  // Auto Populate Edit Data Items
  //==================================================

  useEffect(() => {

    if (!isEdit) return;

    if (!formData?.items?.length) return;

    const updatedItems = formData.items.map((item) => ({

      material:
        item.material?._id || item.material || "",

      materialName:
        item.material?.name ||
        item.materialName ||
        "",

      orderedQty:
        Number(item.orderedQty || item.quantity) || 0,

      unit:
        item.unit || "",

      receivedQty:
        Number(item.receivedQty) || 0,

      acceptedQty:
        Number(item.acceptedQty) || 0,

      rejectedQty:
        Number(item.rejectedQty) || 0,

      remarks:
        item.remarks || "",

    }));

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

  }, [isEdit]);
    //==================================================
  // Validate Form
  //==================================================

  const validateForm = () => {

    const newErrors = {};

    //==========================================
    // GRN Details
    //==========================================

    if (!formData.grnNumber?.trim()) {
      newErrors.grnNumber = "GRN Number is required.";
    }

    if (!formData.grnDate) {
      newErrors.grnDate = "GRN Date is required.";
    }

    if (!formData.purchaseOrder) {
      newErrors.purchaseOrder = "Purchase Order is required.";
    }

    if (!formData.warehouse) {
      newErrors.warehouse = "Warehouse is required.";
    }

    if (!formData.receivedBy) {
      newErrors.receivedBy = "Received By is required.";
    }

    if (!formData.status) {
      newErrors.status = "Status is required.";
    }

    //==========================================
    // Items Validation
    //==========================================

    if (
      !formData.items ||
      formData.items.length === 0
    ) {
      newErrors.items = "At least one item is required.";
    } else {

      const itemErrors = [];

      formData.items.forEach((item, index) => {

        const error = {};

        const receivedQty =
          Number(item.receivedQty) || 0;

        const acceptedQty =
          Number(item.acceptedQty) || 0;

        const rejectedQty =
          Number(item.rejectedQty) || 0;

        //------------------------------
        // Material
        //------------------------------

        if (!item.material) {
          error.material = "Material is required.";
        }

        //------------------------------
        // Received Quantity
        //------------------------------

        if (receivedQty <= 0) {
          error.receivedQty =
            "Received Qty must be greater than 0.";
        }

        //------------------------------
        // Accepted Quantity
        //------------------------------

        if (acceptedQty < 0) {
          error.acceptedQty =
            "Accepted Qty cannot be negative.";
        }

        if (acceptedQty > receivedQty) {
          error.acceptedQty =
            "Accepted Qty cannot exceed Received Qty.";
        }

        //------------------------------
        // Rejected Quantity
        //------------------------------

        if (rejectedQty < 0) {
          error.rejectedQty =
            "Rejected Qty cannot be negative.";
        }

        if (
          rejectedQty !==
          receivedQty - acceptedQty
        ) {
          error.rejectedQty =
            "Rejected Qty must equal Received Qty - Accepted Qty.";
        }

        itemErrors[index] = error;

      });

      const hasItemErrors = itemErrors.some(
        (item) => Object.keys(item).length > 0
      );

      if (hasItemErrors) {
        newErrors.itemErrors = itemErrors;
      }
    }

    //==========================================
    // Set Errors
    //==========================================

    setErrors(newErrors);

    //==========================================
    // Return Validation Result
    //==========================================

    return Object.keys(newErrors).length === 0;
  };
  //==================================================
// Don't render when modal is closed
//==================================================

if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="flex items-center justify-between border-b px-6 py-4">

        <h2 className="text-2xl font-semibold">
          {isEdit
            ? "Edit Goods Receipt Note"
            : "Create Goods Receipt Note"}
        </h2>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-600 text-3xl"
        >
          &times;
        </button>

      </div>

      {/* ==========================================
          Body
      ========================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

        {/* ======================================
            Left Side
        ====================================== */}

        <div className="space-y-4">

          {/* GRN Number */}

          <div>
            <label className="font-medium">
              GRN Number
            </label>

            <input
              type="text"
              name="grnNumber"
              value={formData.grnNumber}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 mt-1"
            />

            {errors.grnNumber && (
              <p className="text-red-500 text-sm">
                {errors.grnNumber}
              </p>
            )}
          </div>

          {/* GRN Date */}

          <div>
            <label className="font-medium">
              GRN Date
            </label>

            <input
              type="date"
              name="grnDate"
              value={formData.grnDate}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          {/* Purchase Order */}

          <div>
            <label className="font-medium">
              Purchase Order
            </label>

            <select
              name="purchaseOrder"
              value={formData.purchaseOrder}
              onChange={handlePurchaseOrderChange}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="">
                Select Purchase Order
              </option>

              {purchaseOrders.map((po) => (
                <option key={po._id} value={po._id}>
                  {po.poNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}

          <div>
            <label className="font-medium">
              Supplier
            </label>

            <input
              type="text"
              value={
                purchaseOrders.find(
                  (po) =>
                    po._id === formData.purchaseOrder
                )?.supplier?.name || ""
              }
              readOnly
              className="w-full border rounded-lg p-2 mt-1 bg-gray-100"
            />
          </div>

          {/* Invoice Number */}

          <div>
            <label className="font-medium">
              Invoice Number
            </label>

            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          {/* Warehouse */}

          <div>
            <label className="font-medium">
              Warehouse
            </label>

            <select
              name="warehouse"
              value={formData.warehouse}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="">
                Select Warehouse
              </option>

              {warehouses.map((warehouse) => (
                <option
                  key={warehouse._id}
                  value={warehouse._id}
                >
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          {/* Received By */}

          <div>
            <label className="font-medium">
              Received By
            </label>

            <select
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="">
                Select User
              </option>

              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                >
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 mt-1"
            >
              <option value="Pending">
                Pending
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>
          </div>

        </div>

        {/* ======================================
            Right Side
        ====================================== */}

        <div className="lg:col-span-2 overflow-x-auto">

          <table className="min-w-full border">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-2">
                  Material
                </th>

                <th className="border p-2">
                  Ordered Qty
                </th>

                <th className="border p-2">
                  Received Qty
                </th>

                <th className="border p-2">
                  Accepted Qty
                </th>

                <th className="border p-2">
                  Rejected Qty
                </th>

                <th className="border p-2">
                  Remarks
                </th>

              </tr>

            </thead>

            <tbody>

              {formData.items.map((item, index) => (

                <tr key={index}>

                  <td className="border p-2">
                    {item.materialName}
                  </td>

                  <td className="border p-2 text-center">
                    {item.orderedQty}
                  </td>

                  <td className="border p-2">

                    <input
                      type="number"
                      value={item.receivedQty}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "receivedQty",
                          e.target.value
                        )
                      }
                      className="w-24 border rounded p-1"
                    />

                  </td>

                  <td className="border p-2">

                    <input
                      type="number"
                      value={item.acceptedQty}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "acceptedQty",
                          e.target.value
                        )
                      }
                      className="w-24 border rounded p-1"
                    />

                  </td>

                  <td className="border p-2 text-center">
                    {item.rejectedQty}
                  </td>

                  <td className="border p-2">

                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "remarks",
                          e.target.value
                        )
                      }
                      className="w-full border rounded p-1"
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
            {/* ==========================================
          Error Message
      ========================================== */}

      {errors.general && (
        <div className="px-6 pb-2">
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
            {errors.general}
          </div>
        </div>
      )}

      {/* ==========================================
          Footer
      ========================================== */}

      <div className="border-t px-6 py-4">

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          {/* Cancel */}

          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            disabled={loading}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-5 py-2 font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Reset */}

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="w-full sm:w-auto rounded-lg border border-yellow-500 px-5 py-2 font-medium text-yellow-700 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          {/* Save / Update */}

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading
              ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Processing...
                </span>
              )
              : (
                isEdit
                  ? "Update GRN"
                  : "Save GRN"
              )}
          </button>

        </div>

      </div>

    </div>
  </div>
);

};

export default GoodsReceiptNoteModal;