import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const EditDelivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const lead = useSelector((state) =>
    state.leads.leads.find((l) => l._id === id)
  );

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    dispatchNo: "",
    deliveryStatus: "",
    productName: "",
    serialNumbers: "",
    qty: "",
    invoiceNo: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Prefill form
  useEffect(() => {
    if (lead) {
      const product = lead.products?.[0] || {};

      setForm({
        name: lead.name || "",
        company: lead.company || "",
        phone: lead.phone || "",
        dispatchNo: lead.dispatchNo || "",
        deliveryStatus: lead.deliveryStatus || "",
        productName: product.productName || "",
        serialNumbers: product.serialNumbers || "",
        qty: product.qty || "",
        invoiceNo: product.invoiceNo || "",
      });
    }
  }, [lead]);

  // ❌ No lead found
  if (!lead) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-red-500 text-xl font-semibold">
          Lead not found
        </h2>
      </div>
    );
  }

  // ✅ Handle change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.deliveryStatus) {
      return toast.error("Status is required");
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        company: form.company,
        phone: form.phone,
        dispatchNo: form.dispatchNo,
        deliveryStatus: form.deliveryStatus,
        products: [
          {
            productName: form.productName,
            serialNumbers: form.serialNumbers,
            qty: form.qty,
            invoiceNo: form.invoiceNo,
          },
        ],
      };

      await axiosInstance.put(`/leads/${id}/delivery`, payload);

      toast.success("Delivery updated successfully ✅");

      navigate(`/deliveryView/${id}`);
    } catch (err) {
      toast.error("Failed to update delivery ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-xl font-semibold text-gray-700 mb-5">
          Edit Delivery
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* CUSTOMER INFO */}
          <div>
            <h3 className="text-md font-semibold mb-2 text-gray-600">
              Customer Info
            </h3>

            <div className="grid md:grid-cols-3 gap-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="border p-2 rounded"
                disabled
              />
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company"
                className="border p-2 rounded"
                disabled
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="border p-2 rounded"
                disabled
              />
            </div>
          </div>

          {/* DELIVERY INFO */}
          <div>
            <h3 className="text-md font-semibold mb-2 text-gray-600">
              Delivery Info
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                name="dispatchNo"
                value={form.dispatchNo}
                onChange={handleChange}
                placeholder="Dispatch No"
                className="border p-2 rounded"
              />

              <select
                name="deliveryStatus"
                value={form.deliveryStatus}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="">Select Status</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div>
            <h3 className="text-md font-semibold mb-2 text-gray-600">
              Product Info
            </h3>

            <div className="grid md:grid-cols-4 gap-3">
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="Product"
                className="border p-2 rounded"
              />
              <input
                name="serialNumbers"
                value={form.serialNumbers}
                onChange={handleChange}
                placeholder="Serial No"
                className="border p-2 rounded"
              />
              <input
                name="qty"
                value={form.qty}
                onChange={handleChange}
                placeholder="Quantity"
                className="border p-2 rounded"
              />
              <input
                name="invoiceNo"
                value={form.invoiceNo}
                onChange={handleChange}
                placeholder="Invoice"
                className="border p-2 rounded"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 rounded-lg text-white ${
                loading
                  ? "bg-orange-300"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Updating..." : "Update"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditDelivery;