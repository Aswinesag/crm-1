import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RiTruckLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";

const DeliveryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const lead = useSelector((state) =>
    state.leads.leads.find((l) => l._id === id)
  );

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-red-500 text-xl font-semibold">
          Lead not found
        </h2>
        <Link to="/delivery" className="text-blue-500 underline mt-3 block">
          Back to Delivery
        </Link>
      </div>
    );
  }

  const product = lead.products?.[0];

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        
        <div className="flex items-center gap-3">
          <RiTruckLine
            className="text-orange-500 bg-orange-100 p-2 rounded"
            size={40}
          />
          <h1 className="text-2xl font-bold text-gray-700">
            Delivery Details
          </h1>
        </div>

        {/* ✅ EDIT BUTTON */}
        <button
          onClick={() => navigate(`/delivery/edit/${lead._id}`)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          <FiEdit />
          Edit Delivery
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white shadow-lg rounded-xl p-6 grid md:grid-cols-2 gap-6">

        {/* CUSTOMER INFO */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-600 mb-3">
            Customer Info
          </h2>

          <p className="mb-2"><span className="font-medium">Name:</span> {lead.name}</p>
          <p className="mb-2"><span className="font-medium">Company:</span> {lead.company}</p>
          <p><span className="font-medium">Phone:</span> {lead.phone}</p>
        </div>

        {/* DELIVERY INFO */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-600 mb-3">
            Delivery Info
          </h2>

          <p className="mb-2">
            <span className="font-medium">Dispatch No:</span>{" "}
            {lead.dispatchNo || "Not Added"}
          </p>

          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded text-white text-sm ${
                lead.deliveryStatus === "Delivered"
                  ? "bg-green-500"
                  : lead.deliveryStatus === "Shipped"
                  ? "bg-blue-500"
                  : lead.deliveryStatus === "Packed"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              }`}
            >
              {lead.deliveryStatus}
            </span>
          </p>
        </div>

        {/* PRODUCT INFO */}
        <div className="border rounded-lg p-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-600 mb-3">
            Product Details
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Product</p>
              <p className="font-medium">{product?.productName || "N/A"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Serial No</p>
              <p className="font-medium">{product?.serialNumbers || "N/A"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Quantity</p>
              <p className="font-medium">{product?.qty || "N/A"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Invoice</p>
              <p className="font-medium">{product?.invoiceNo || "N/A"}</p>
            </div>
          </div>
        </div>

      </div>

      {/* BACK BUTTON */}
      <div className="mt-6">
        <Link
          to="/delivery"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          ← Back to Delivery
        </Link>
      </div>
    </div>
  );
};

export default DeliveryView;