import React, {
  useEffect,
  useState,
} from "react";

import {
  createPurchaseOrder,
  updatePurchaseOrder,
} from "../services/purchaseOrderService";

import {
  getAllVendors,
} from "../services/vendorService";

import {
  getAllMaterials,
} from "../services/materialService";

const PurchaseOrderModal = ({
  isOpen,
  onClose,
  onSuccess,
  purchaseOrder,
}) => {

  // ==========================================
  // Initial Form
  // ==========================================

  const initialForm = {
    vendor: "",
    poNumber: "",
    poDate: "",
    expectedDeliveryDate: "",

    paymentTerms: "",
    deliveryAddress: "",
    remarks: "",

    status: "Pending",

    items: [
      {
        material: "",
        quantity: 1,
        unitPrice: 0,
        gst: 18,
        amount: 0,
      },
    ],

    subTotal: 0,
    gstAmount: 0,
    grandTotal: 0,
  };

  // ==========================================
  // States
  // ==========================================

  const [formData, setFormData] =
    useState(initialForm);

  const [vendors, setVendors] =
    useState([]);

  const [materials, setMaterials] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  // ==========================================
  // Fetch Vendors
  // ==========================================

 const fetchVendors = async () => {

  try {

    const response = await getAllVendors();

    console.log("Vendor Response :", response);

    const vendorList =
      response?.data || [];

    console.log("Vendor List :", vendorList);

    setVendors(vendorList);

  } catch (error) {

    console.error(
      "Error fetching vendors:",
      error
    );

    setVendors([]);

  }

};

  // ==========================================
  // Fetch Materials
  // ==========================================

  const fetchMaterials = async () => {

  try {

    const response = await getAllMaterials();

    console.log("Material Response:", response);

    const materialList =
    response?.materials || [];

    console.log("Material List:", materialList);

    setMaterials(materialList);

  } catch (error) {

    console.error(
      "Error fetching materials:",
      error
    );

    setMaterials([]);

  }

};

  // ==========================================
  // Load Vendors & Materials
  // ==========================================

  useEffect(() => {

    if (!isOpen) return;

    fetchVendors();
    fetchMaterials();

  }, [isOpen]);

  // ==========================================
  // Reset Form
  // ==========================================

  useEffect(() => {

    if (!isOpen) {

      setFormData(initialForm);
      setErrors({});

    }

  }, [isOpen]);

  // ==========================================
  // Edit Mode
  // ==========================================

  useEffect(() => {

    if (!purchaseOrder) return;

    setFormData({
      vendor:
        purchaseOrder.vendor?._id ||
        purchaseOrder.vendor ||
        "",

      poNumber:
        purchaseOrder.poNumber || "",

      poDate:
        purchaseOrder.poDate
          ? purchaseOrder.poDate.substring(0, 10)
          : "",

      expectedDeliveryDate:
        purchaseOrder.expectedDeliveryDate
          ? purchaseOrder.expectedDeliveryDate.substring(
              0,
              10
            )
          : "",

      paymentTerms:
        purchaseOrder.paymentTerms || "",

      deliveryAddress:
        purchaseOrder.deliveryAddress || "",

      remarks:
        purchaseOrder.remarks || "",

      status:
        purchaseOrder.status || "Pending",

      items:
        purchaseOrder.items?.length > 0
          ? purchaseOrder.items
          : [
              {
                material: "",
                quantity: 1,
                unitPrice: 0,
                gst: 18,
                amount: 0,
              },
            ],

      subTotal:
        purchaseOrder.subTotal || 0,

      gstAmount:
        purchaseOrder.gstAmount || 0,

      grandTotal:
        purchaseOrder.grandTotal || 0,
    });

  }, [purchaseOrder]);

  // ==========================================
  // Temporary Return
  // Replace with JSX in Step 5
  // ==========================================
    // ==========================================
  // Handle Normal Input Change
  // ==========================================

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove validation error while typing
    if (errors[name]) {

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));

    }

  };

  // ==========================================
  // Handle Item Change
  // ==========================================

  const handleItemChange = (
    index,
    field,
    value
  ) => {

    const updatedItems = [...formData.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "material"
          ? value
          : Number(value),
    };

    // Calculate Item Amount
    const quantity =
      Number(updatedItems[index].quantity) || 0;

    const unitPrice =
      Number(updatedItems[index].unitPrice) || 0;

    updatedItems[index].amount =
      quantity * unitPrice;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

  };

  // ==========================================
  // Add New Item
  // ==========================================

  const addItem = () => {

    setFormData((prev) => ({

      ...prev,

      items: [

        ...prev.items,

        {
          material: "",
          quantity: 1,
          unitPrice: 0,
          gst: 18,
          amount: 0,
        },

      ],

    }));

  };

  // ==========================================
  // Remove Item
  // ==========================================

  const removeItem = (index) => {

    if (formData.items.length === 1) {
      return;
    }

    const updatedItems =
      formData.items.filter(
        (_, i) => i !== index
      );

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

  };

    // ==========================================
  // Calculate Single Item Amount
  // ==========================================

  const calculateItemAmount = (item) => {

    const quantity =
      Number(item.quantity) || 0;

    const unitPrice =
      Number(item.unitPrice) || 0;

    return quantity * unitPrice;

  };

  // ==========================================
  // Calculate Purchase Order Totals
  // ==========================================

  const calculateTotals = () => {

    let subTotal = 0;
    let gstAmount = 0;

    formData.items.forEach((item) => {

      const amount =
        calculateItemAmount(item);

      const gst =
        Number(item.gst) || 0;

      subTotal += amount;

      gstAmount +=
        (amount * gst) / 100;

    });

    const grandTotal =
      subTotal + gstAmount;

   setFormData((prev) => ({

  ...prev,

  subTotal: Number(subTotal.toFixed(2)),
  gstAmount: Number(gstAmount.toFixed(2)),
  grandTotal: Number(grandTotal.toFixed(2))

}));

  };

  // ==========================================
  // Auto Calculate Totals
  // ==========================================

  useEffect(() => {

    calculateTotals();

  }, [formData.items]);

    // ==========================================
  // Form Validation
  // ==========================================

  const validateForm = () => {

    const newErrors = {};

    // Vendor
    if (!formData.vendor) {
      newErrors.vendor = "Vendor is required.";
    }

    // PO Number
    if (!formData.poNumber.trim()) {
      newErrors.poNumber =
        "Purchase Order Number is required.";
    }

    // PO Date
    if (!formData.poDate) {
      newErrors.poDate =
        "Purchase Order Date is required.";
    }

    // Expected Delivery Date
    if (!formData.expectedDeliveryDate) {
      newErrors.expectedDeliveryDate =
        "Expected Delivery Date is required.";
    }

    // Delivery Address
    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Delivery Address is required.";
    }

    // Items Validation
    if (formData.items.length === 0) {

      newErrors.items =
        "Please add at least one item.";

    } else {

      formData.items.forEach((item, index) => {

        if (!item.material) {

          newErrors[`material${index}`] =
            "Material is required.";

        }

        if (
          !item.quantity ||
          Number(item.quantity) <= 0
        ) {

          newErrors[`quantity${index}`] =
            "Quantity must be greater than zero.";

        }

        if (
          !item.unitPrice ||
          Number(item.unitPrice) <= 0
        ) {

          newErrors[`unitPrice${index}`] =
            "Unit Price must be greater than zero.";

        }

      });

    }

    console.log("New Errors : ",newErrors);

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  // ==========================================
  // Handle Submit
  // ==========================================

  const handleSubmit = async () => {

    console.log("Submit button clicked");

    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    console.log("Validation passed");

    try {

      setLoading(true);

      console.log("Selected Vendor:", formData.vendor);

      const payload = {

        supplier: formData.vendor,

        poNumber: formData.poNumber,

        poDate: formData.poDate,

        deliveryDate: formData.expectedDeliveryDate,

        paymentTerms:
          formData.paymentTerms,

        deliveryAddress:
          formData.deliveryAddress,

        remarks:
          formData.remarks,

        status:
          formData.status,

        items: formData.items.map((item) => ({

          material: item.material,

          quantity:
            Number(item.quantity),

          unitPrice:
            Number(item.unitPrice),

          gst:
            Number(item.gst),

          amount:
            Number(item.amount),

        })),

        subTotal:
          Number(formData.subTotal),

        gstAmount:
          Number(formData.gstAmount),

        grandTotal:
          Number(formData.grandTotal),

      };

      if (purchaseOrder) {
        console.log("Purchase Order Payload:", payload);
        await updatePurchaseOrder(
          purchaseOrder._id,
          payload
        );

      } else {

        await createPurchaseOrder(
          payload
        );

      }

      // Reset Form
      setFormData(initialForm);

      // Close Modal
      onClose();

      // Refresh List
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {

      console.error(
        "Purchase Order Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Failed to save Purchase Order."
      );

    } finally {

      setLoading(false);

    }

  };

    // ==========================================
  // JSX - Part A
  // ==========================================

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6">

        {/* ===================================== */}
        {/* Header */}
        {/* ===================================== */}

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-semibold">

            {
              purchaseOrder
                ? "Edit Purchase Order"
                : "Create Purchase Order"
            }

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-3xl"
          >
            ×
          </button>

        </div>

        {/* ===================================== */}
        {/* Vendor Details */}
        {/* ===================================== */}

        <div className="grid grid-cols-2 gap-5 mb-6">

          {/* Vendor */}

          <div>

            <label className="block mb-2 font-medium">
              Vendor
            </label>

            <p className="text-blue-600 mb-2">
              Total Vendors : {vendors.length}
            </p>

            <select
              name="vendor"
              value={formData.vendor}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            >

              <option value="">
                Select Vendor
              </option>

              {
                vendors.map((vendor) => (

                  <option
                    key={vendor._id}
                    value={vendor._id}
                  >
                    {vendor.vendorName}
                  </option>

                ))
              }

            </select>

            {
              errors.vendor && (

                <p className="text-red-500 text-sm mt-1">
                  {errors.vendor}
                </p>

              )
            }

          </div>

          {/* PO Number */}

          <div>

            <label className="block mb-2 font-medium">
              Purchase Order Number
            </label>

            <input
              type="text"
              name="poNumber"
              value={formData.poNumber}
              onChange={handleInputChange}
              placeholder="Enter PO Number"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            />

            {
              errors.poNumber && (

                <p className="text-red-500 text-sm mt-1">
                  {errors.poNumber}
                </p>

              )
            }

          </div>

        </div>

        {/* ===================================== */}
        {/* Purchase Order Details */}
        {/* ===================================== */}

        <div className="grid grid-cols-2 gap-5 mb-6">

          {/* PO Date */}

          <div>

            <label className="block mb-2 font-medium">
              Purchase Order Date
            </label>

            <input
              type="date"
              name="poDate"
              value={formData.poDate}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            />

            {
              errors.poDate && (

                <p className="text-red-500 text-sm mt-1">
                  {errors.poDate}
                </p>

              )
            }

          </div>

          {/* Expected Delivery Date */}

          <div>

            <label className="block mb-2 font-medium">
              Expected Delivery Date
            </label>

            <input
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            />

            {
              errors.expectedDeliveryDate && (

                <p className="text-red-500 text-sm mt-1">
                  {errors.expectedDeliveryDate}
                </p>

              )
            }

          </div>

        </div>

        {/* ===================================== */}
        {/* Payment Details */}
        {/* ===================================== */}

        <div className="grid grid-cols-2 gap-5 mb-6">

          {/* Payment Terms */}

          <div>

            <label className="block mb-2 font-medium">
              Payment Terms
            </label>

            <input
              type="text"
              name="paymentTerms"
              placeholder="Net 30 Days"
              value={formData.paymentTerms}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            />

          </div>

          {/* Status */}

          <div>

            <label className="block mb-2 font-medium">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
            >

            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Sent">Sent</option>
            <option value="Partially Received">
                Partially Received
            </option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>

            </select>

          </div>

        </div>

        {/* ===================================== */}
        {/* Delivery Address */}
        {/* ===================================== */}

        <div className="mb-6">

          <label className="block mb-2 font-medium">
            Delivery Address
          </label>

          <textarea
            rows="4"
            name="deliveryAddress"
            placeholder="Enter Delivery Address"
            value={formData.deliveryAddress}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-orange-400 outline-none"
          />

          {
            errors.deliveryAddress && (

              <p className="text-red-500 text-sm mt-1">
                {errors.deliveryAddress}
              </p>

            )
          }

        </div>

        {/* ===================================== */}
        {/* Remarks */}
        {/* ===================================== */}

        <div className="mb-6">

          <label className="block mb-2 font-medium">
            Remarks
          </label>

          <textarea
            rows="3"
            name="remarks"
            placeholder="Enter Remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            className="w-full border rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-orange-400 outline-none"
          />

        </div>
                {/* ===================================== */}
        {/* Purchase Order Items */}
        {/* ===================================== */}

        <div className="mb-6">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-semibold">
              Purchase Order Items
            </h3>

            <button
              type="button"
              onClick={addItem}
              className="bg-[#FB6514] text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              + Add Item
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full border border-gray-300">

              <thead className="bg-gray-100">

                <tr>

                  <th className="border px-3 py-2">
                    Material
                  </th>

                  <th className="border px-3 py-2">
                    Quantity
                  </th>

                  <th className="border px-3 py-2">
                    Unit Price
                  </th>

                  <th className="border px-3 py-2">
                    GST %
                  </th>

                  <th className="border px-3 py-2">
                    Amount
                  </th>

                  <th className="border px-3 py-2">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {formData.items.map((item, index) => (

                  <tr key={index}>

                    {/* Material */}

                    <td className="border p-2">

                    <p className="text-blue-600 mb-2">
                      Total Materials: {materials.length}
                    </p>
                      <select
                        value={item.material}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "material",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1"
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
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1"
                      />

                    </td>

                    {/* Unit Price */}

                    <td className="border p-2">

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitPrice",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1"
                      />

                    </td>

                    {/* GST */}

                    <td className="border p-2">

                      <select
                        value={item.gst}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "gst",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1"
                      >

                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>

                      </select>

                    </td>

                    {/* Amount */}

                    <td className="border p-2 text-right font-medium">

                      ₹ {Number(item.amount).toFixed(2)}

                    </td>

                    {/* Remove */}

                    <td className="border p-2 text-center">

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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

        {/* ===================================== */}
        {/* Totals */}
        {/* ===================================== */}

        <div className="flex justify-end mb-6">

          <div className="w-full max-w-sm">

            <div className="flex justify-between border-b py-2">

              <span className="font-medium">
                Sub Total
              </span>

              <span>
                ₹ {Number(formData.subTotal).toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between border-b py-2">

              <span className="font-medium">
                GST
              </span>

              <span>
                ₹ {Number(formData.gstAmount).toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between py-3 text-lg font-bold">

              <span>
                Grand Total
              </span>

              <span className="text-[#FB6514]">

                ₹ {Number(formData.grandTotal).toFixed(2)}

              </span>

            </div>

          </div>

        </div>

        {/* ===================================== */}
        {/* Footer */}
        {/* ===================================== */}

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >

            {loading
              ? "Saving..."
              : purchaseOrder
              ? "Update Purchase Order"
              : "Save Purchase Order"}

          </button>

        </div>

      </div>

    </div>

  );

};

export default PurchaseOrderModal;
