import React, {
  useEffect,
  useState,
} from "react";

import RFQTable from
  "../../components/procurement/RFQTable";

import {
  getAllRFQs,
} from "../../services/rfqService";

import {
  Link
}
from "react-router-dom";

const RFQList = () => {

  const [rfqs, setRfqs] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [totalPages,
    setTotalPages] =
    useState(1);

  const [search,
    setSearch] =
    useState("");

  const [status,
    setStatus] =
    useState("");

  useEffect(() => {
    fetchRFQs();
  }, [page, search, status]);

  const fetchRFQs =
    async () => {

      try {

        setLoading(true);

        const data =
          await getAllRFQs(
            page,
            search,
            status
          );

        setRfqs(
          data?.data || []
        );

        setTotalPages(
          data?.totalPages || 1
        );

      } catch (error) {

        console.error(
          "Error fetching RFQs:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

  const draftCount =
    rfqs.filter(
      (rfq) =>
        rfq.status === "DRAFT"
    ).length;

  const sentCount =
    rfqs.filter(
      (rfq) =>
        rfq.status === "SENT"
    ).length;

  const closedCount =
    rfqs.filter(
      (rfq) =>
        rfq.status === "CLOSED"
    ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Page Header */}

      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            RFQ Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage and track all Request For Quotations
          </p>
        </div>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Total RFQs
          </p>

          <h2 className="text-3xl font-bold text-orange-600 mt-2">
            {rfqs.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Draft RFQs
          </p>

          <h2 className="text-3xl font-bold text-yellow-500 mt-2">
            {draftCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Sent RFQs
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {sentCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">
            Closed RFQs
          </p>

          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {closedCount}
          </h2>
        </div>

      </div>

      {/* Search & Filters */}

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          <input
            type="text"
            placeholder="Search RFQ Number..."
            className="
              w-full
              md:w-80
              border
              border-gray-300
              rounded-lg
              px-4
              py-2
              focus:outline-none
              focus:ring-2
              focus:ring-orange-400
            "
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <select
            className="
              border
              border-gray-300
              rounded-lg
              px-4
              py-2
              focus:outline-none
              focus:ring-2
              focus:ring-orange-400
            "
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >
            <option value="">
              All Status
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="SENT">
              Sent
            </option>

            <option value="CLOSED">
              Closed
            </option>

          </select>

        </div>

      </div>

      {/* Table Section */}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

        {loading ? (

          <div className="flex justify-center items-center py-20">

            <div
              className="
                animate-spin
                rounded-full
                h-12
                w-12
                border-4
                border-orange-500
                border-t-transparent
              "
            />

          </div>

        ) : (

          <RFQTable
            rfqs={rfqs}
          />

        )}

      </div>

      {/* Pagination */}

      <div className="flex justify-center items-center gap-5 mt-8">

        <button
          className="
            px-5
            py-2
            rounded-lg
            bg-orange-500
            text-white
            font-medium
            hover:bg-orange-600
            disabled:bg-gray-300
            disabled:cursor-not-allowed
          "
          disabled={page === 1}
          onClick={() =>
            setPage(
              page - 1
            )
          }
        >
          Previous
        </button>

        <span className="font-medium text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          className="
            px-5
            py-2
            rounded-lg
            bg-orange-500
            text-white
            font-medium
            hover:bg-orange-600
            disabled:bg-gray-300
            disabled:cursor-not-allowed
          "
          disabled={
            page === totalPages
          }
          onClick={() =>
            setPage(
              page + 1
            )
          }
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default RFQList;