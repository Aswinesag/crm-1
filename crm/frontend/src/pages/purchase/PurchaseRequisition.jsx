import React, { useEffect, useState } from "react";

import Card from "../../components/Card";
import PurchaseRequisitionModal from "../../components/PurchaseRequisitionModal";

import { IoIosSearch } from "react-icons/io";
import { PencilIcon } from "@heroicons/react/24/outline";
import { MdDelete } from "react-icons/md";

import {
  getPurchaseRequisitions,
} from "../../services/PurchaseRequisitionService";

const PurchaseRequisition = () => {
  // ============================================
  // STATES
  // ============================================

  const [purchaseRequisitions, setPurchaseRequisitions] =
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

  const [selectedPR, setSelectedPR] =
    useState(null);

  // ============================================
  // FETCH PURCHASE REQUISITIONS
  // ============================================

  const fetchPurchaseRequisitions =
    async () => {
      try {
        setLoading(true);

        const response =
          await getPurchaseRequisitions(
            page,
            10,
            search
          );

       const data = response.data;

        console.log(data);

        setPurchaseRequisitions(data.data || []);

        setTotalPages(data.totalPages || 1);

        setTotalRecords(data.count || 0);
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
    fetchPurchaseRequisitions();
  }, [page]);

  // ============================================
  // ADD PURCHASE REQUISITION
  // ============================================

  const handleAdd = () => {
    setSelectedPR(null);

    setShowModal(true);
  };

  // ============================================
  // EDIT PURCHASE REQUISITION
  // ============================================

  const handleEdit = (pr) => {
    setSelectedPR(pr);

    setShowModal(true);
  };

  // ============================================
  // DELETE PURCHASE REQUISITION
  // (Backend API can be added later)
  // ============================================

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Delete this Purchase Requisition?"
    );

    if (!confirmDelete) return;

    console.log(
      "Delete API Pending for ID:",
      id
    );

    // Later:
    // await deletePurchaseRequisition(id);
    // fetchPurchaseRequisitions();
  };

  // ============================================
  // DASHBOARD CARDS
  // ============================================

  const totalPR =
    purchaseRequisitions.length;

  const pendingPR =
    purchaseRequisitions.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const approvedPR =
    purchaseRequisitions.filter(
      (item) =>
        item.status === "Approved"
    ).length;

  const rejectedPR =
    purchaseRequisitions.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

  // ============================================
  // SEARCH
  // ============================================

  const filteredPurchaseRequisitions =
    purchaseRequisitions.filter((item) => {
      return (
        item.requisitionNo
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        item.department
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        item.requestedBy
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        item.priority
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        item.status
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    });

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
  // (Part 2)
  // ============================================

  return (
    <>      {/* ===========================
          DASHBOARD CARDS
      ============================ */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total Requisitions"
          count={totalPR}
          bg="#EFF6FF"
          color="#2563EB"
        />

        <Card
          title="Pending"
          count={pendingPR}
          bg="#FEFCE8"
          color="#CA8A04"
        />

        <Card
          title="Approved"
          count={approvedPR}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Rejected"
          count={rejectedPR}
          bg="#FEF2F2"
          color="#DC2626"
        />

      </div>

      {/* ===========================
          SEARCH BAR
      ============================ */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Purchase Requisition"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchPurchaseRequisitions}
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add Purchase Requisition
          </button>

        </div>

      </div>

      {/* ===========================
          TABLE
      ============================ */}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Requisition No
              </th>

              <th className="p-3 text-left">
                Request Date
              </th>

              <th className="p-3 text-left">
                Department
              </th>

              <th className="p-3 text-left">
                Requested By
              </th>

              <th className="p-3 text-left">
                Priority
              </th>

              <th className="p-3 text-left">
                Required Date
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

            {filteredPurchaseRequisitions.map(
              (pr, index) => (

                <tr
                  key={pr._id}
                  className="border-t"
                >

                  <td className="p-3">
                    {(page - 1) * 10 + index + 1}
                  </td>

                  <td className="p-3 font-medium">
                    {pr.requisitionNo}
                  </td>

                  <td className="p-3">
                    {new Date(
                      pr.requestDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    {pr.department}
                  </td>

                  <td className="p-3">
                    {pr.requestedBy}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium
                      ${
                        pr.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : pr.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {pr.priority}
                    </span>
                  </td>

                  <td className="p-3">
                    {new Date(
                      pr.requiredDate
                    ).toLocaleDateString()}
                  </td>
                                    {/* ===========================
                      STATUS
                  ============================ */}

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded text-sm font-medium
                      ${
                        pr.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : pr.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : pr.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pr.status}
                    </span>

                  </td>

                  {/* ===========================
                      ACTIONS
                  ============================ */}

                  <td className="p-3">

                    <div className="flex gap-3">

                      <PencilIcon
                        className="h-5 w-5 text-yellow-500 cursor-pointer"
                        onClick={() =>
                          handleEdit(pr)
                        }
                      />

                      <MdDelete
                        className="text-red-500 text-xl cursor-pointer"
                        onClick={() =>
                          handleDelete(pr._id)
                        }
                      />

                    </div>

                  </td>

                </tr>

              )
            )}

            {filteredPurchaseRequisitions.length === 0 && (

              <tr>

                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-500"
                >
                  No Purchase Requisitions Found
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
          PURCHASE REQUISITION MODAL
      ============================ */}

      <PurchaseRequisitionModal
        isOpen={showModal}
        purchaseRequisition={selectedPR}
        onClose={() => {
          setShowModal(false);
          setSelectedPR(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setSelectedPR(null);
          fetchPurchaseRequisitions();
        }}
      />

    </>
  );

};

export default PurchaseRequisition;