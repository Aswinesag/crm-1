import React, { useEffect, useState } from "react";

import Card from "../../components/Card";
import PurchaseOrderModal from "../../components/PurchaseOrderModal";

import { IoIosSearch } from "react-icons/io";
import { PencilIcon } from "@heroicons/react/24/outline";
import { MdDelete } from "react-icons/md";

import {
  getPurchaseOrders,
} from "../../services/purchaseOrderService";

const PurchaseOrders = () => {

  // ============================================
  // STATES
  // ============================================

  const [purchaseOrders, setPurchaseOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(0);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedPO, setSelectedPO] =
    useState(null);

  // ============================================
  // FETCH PURCHASE ORDERS
  // ============================================

  const fetchPurchaseOrders =
    async () => {

      try {

        setLoading(true);

        const response =
          await getPurchaseOrders(
            page,
            10,
            search
          );

        const data =
          response.data;

        console.log(data);

        setPurchaseOrders(
          data.data || []
        );

        setTotalPages(
          data.totalPages || 1
        );

        setTotalRecords(
          data.count || 0
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {

    fetchPurchaseOrders();

  }, [page]);

  // ============================================
  // ADD PURCHASE ORDER
  // ============================================

  const handleAdd = () => {

    setSelectedPO(null);

    setShowModal(true);

  };

  // ============================================
  // EDIT PURCHASE ORDER
  // ============================================

  const handleEdit = (po) => {

    setSelectedPO(po);

    setShowModal(true);

  };

  // ============================================
  // DELETE PURCHASE ORDER
  // ============================================

  const handleDelete = (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this Purchase Order?"
      );

    if (!confirmDelete)
      return;

    console.log(
      "Delete API Pending for ID:",
      id
    );

    // Later:
    // await deletePurchaseOrder(id);
    // fetchPurchaseOrders();

  };

  // ============================================
  // DASHBOARD CARDS
  // ============================================

  const totalPO =
    purchaseOrders.length;

  const pendingPO =
    purchaseOrders.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const approvedPO =
    purchaseOrders.filter(
      (item) =>
        item.status === "Approved"
    ).length;

  const completedPO =
    purchaseOrders.filter(
      (item) =>
        item.status === "Completed"
    ).length;

  // ============================================
  // SEARCH
  // ============================================

  const filteredPurchaseOrders =
    purchaseOrders.filter(
      (item) => {

        return (

          item.poNumber
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          item.supplier
            ?.vendorName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          item.status
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          item.paymentTerms
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )

        );

      }
    );

  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (

      <div className="p-5">

        Loading...

      </div>

    );

  }

  // ============================================
  // JSX STARTS HERE
  // (Part 1B)
  // ============================================

  return (
    <>{/* ===========================
    DASHBOARD CARDS
=========================== */}

<div className="flex flex-wrap gap-3 mt-4">

  <Card
    title="Total Purchase Orders"
    count={totalPO}
    bg="#EFF6FF"
    color="#2563EB"
  />

  <Card
    title="Pending"
    count={pendingPO}
    bg="#FEFCE8"
    color="#CA8A04"
  />

  <Card
    title="Approved"
    count={approvedPO}
    bg="#F0FDF4"
    color="#15803D"
  />

  <Card
    title="Completed"
    count={completedPO}
    bg="#ECFDF5"
    color="#059669"
  />

</div>

{/* ===========================
    SEARCH BAR
=========================== */}

<div className="flex justify-between items-center mt-6 mb-5">

  <div className="relative w-full max-w-md">

    <IoIosSearch
      size={22}
      className="absolute left-3 top-3 text-gray-400"
    />

    <input
      type="text"
      placeholder="Search Purchase Order"
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="w-full pl-10 pr-4 py-2 border rounded-lg"
    />

  </div>

  <div className="flex gap-2">

    <button
      onClick={fetchPurchaseOrders}
      className="bg-gray-600 text-white px-6 py-2 rounded-md"
    >
      Search
    </button>

    <button
      onClick={handleAdd}
      className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
    >
      + Add Purchase Order
    </button>

  </div>

</div>
{/* ===========================
    TABLE
=========================== */}

<div className="bg-white rounded-lg shadow-sm overflow-x-auto">

  <table className="w-full">

    <thead className="bg-gray-50">

      <tr>

        <th className="p-3 text-left">
          #
        </th>

        <th className="p-3 text-left">
          PO Number
        </th>

        <th className="p-3 text-left">
          PO Date
        </th>

        <th className="p-3 text-left">
          Supplier
        </th>

        <th className="p-3 text-left">
          Delivery Date
        </th>

        <th className="p-3 text-left">
          Grand Total
        </th>

        <th className="p-3 text-left">
          Status
        </th>

        <th className="p-3 text-left">
          Actions
        </th>

      </tr>

    </thead>

    <tbody>
    {filteredPurchaseOrders.map(
  (po, index) => (

    <tr
      key={po._id}
      className="border-t"
    >

      {/* ===========================
          SR. NO.
      =========================== */}

      <td className="p-3">
        {(page - 1) * 10 + index + 1}
      </td>

      {/* ===========================
          PO NUMBER
      =========================== */}

      <td className="p-3 font-medium">
        {po.poNumber}
      </td>

      {/* ===========================
          PO DATE
      =========================== */}

      <td className="p-3">
        {new Date(
          po.poDate
        ).toLocaleDateString()}
      </td>

      {/* ===========================
          SUPPLIER
      =========================== */}

      <td className="p-3">
        {po.supplier?.vendorName || "-"}
      </td>

      {/* ===========================
          DELIVERY DATE
      =========================== */}

      <td className="p-3">
        {new Date(
          po.deliveryDate
        ).toLocaleDateString()}
      </td>

      {/* ===========================
          GRAND TOTAL
      =========================== */}

      <td className="p-3 font-medium">
        ₹
        {Number(
          po.grandTotal || 0
        ).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>

      {/* ===========================
          STATUS
      =========================== */}

      <td className="p-3">

        <span
          className={`px-3 py-1 rounded text-sm font-medium

          ${
            po.status === "Draft"
              ? "bg-gray-100 text-gray-700"

            : po.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"

            : po.status === "Approved"
              ? "bg-green-100 text-green-700"

            : po.status === "Sent"
              ? "bg-blue-100 text-blue-700"

            : po.status ===
              "Partially Received"
              ? "bg-purple-100 text-purple-700"

            : po.status === "Completed"
              ? "bg-emerald-100 text-emerald-700"

            : po.status === "Cancelled"
              ? "bg-red-100 text-red-700"

            : "bg-gray-100 text-gray-700"
          }

          `}
        >
          {po.status}
        </span>

      </td>

      {/* ===========================
          ACTION BUTTONS
      =========================== */}

      <td className="p-3">

        <div className="flex gap-3">

          <PencilIcon
            className="h-5 w-5 text-yellow-500 cursor-pointer"
            onClick={() =>
              handleEdit(po)
            }
          />

          <MdDelete
            className="text-red-500 text-xl cursor-pointer"
            onClick={() =>
              handleDelete(po._id)
            }
          />

        </div>

      </td>

    </tr>

  )
)}
              {/* ===========================
                NO DATA FOUND
            ============================ */}

            {filteredPurchaseOrders.length === 0 && (

              <tr>

                <td
                  colSpan="8"
                  className="text-center py-6 text-gray-500"
                >
                  No Purchase Orders Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

        {/* ===========================
            PAGINATION
        ============================ */}

        <div className="flex justify-between items-center p-4 border-t">

          <span>
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-3">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage(page - 1)
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage(page + 1)
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* ===========================
          PURCHASE ORDER MODAL
      ============================ */}

      <PurchaseOrderModal
        isOpen={showModal}
        purchaseOrder={selectedPO}
        onClose={() => {

          setShowModal(false);

          setSelectedPO(null);

        }}
        onSuccess={() => {

          setShowModal(false);

          setSelectedPO(null);

          fetchPurchaseOrders();

        }}
      />

    </>

  );

};

export default PurchaseOrders;