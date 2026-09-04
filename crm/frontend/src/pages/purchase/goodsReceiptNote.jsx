import React, {
  useEffect,
  useState,
} from "react";

import Card from "../../components/Card";

import GoodsReceiptNoteModal from "../../components/GoodsReceiptNoteModal";

import { IoIosSearch } from "react-icons/io";

import { MdDelete } from "react-icons/md";

import {
  PencilIcon,
} from "@heroicons/react/24/outline";

import {
  getGoodsReceiptNotes,
  createGoodsReceiptNote,
  updateGoodsReceiptNote,
  deleteGoodsReceiptNote,
} from "../../services/goodsReceiptNoteService";

const initialForm = {
  grnNumber: "",
  grnDate: "",
  purchaseOrder: "",
  supplier: "",
  warehouse: "",
  invoiceNumber: "",
  receivedBy: "",
  status: "Pending",
  remarks: "",
  items: [],
};

const GoodsReceiptNote = () => {

  // ===============================
  // STATES
  // ===============================

  const [grns, setGrns] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [isEdit, setIsEdit] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState(null);

  const [formData, setFormData] =
    useState(initialForm);

  // ===============================
  // FETCH ALL GRNS
  // ===============================

  console.log("GRNs State:", grns);

  const fetchGRNs = async () => {

    try {

      setLoading(true);

      const response =
        await getGoodsReceiptNotes(
          page,
          10,
          search
        );
      
      console.log("GRN API Response:", response);
      console.log("Response Data:", response.data);

      setGrns(
        response.data.data || []
      );

      setTotalPages(
        response.data.totalPages || 1
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  // ===============================
  // LOAD DATA
  // ===============================

  useEffect(() => {

    fetchGRNs();

  }, [page]);

  // ===============================
  // ADD NEW GRN
  // ===============================

  const handleAdd = () => {

    setFormData(initialForm);

    setSelectedId(null);

    setIsEdit(false);

    setShowModal(true);

  };

  // ===============================
  // EDIT GRN
  // ===============================

  const handleEdit = (grn) => {

    setSelectedId(
      grn._id
    );

    setFormData(grn);

    setIsEdit(true);

    setShowModal(true);

  };

  const handleClose = () => {

    setShowModal(false);

    setFormData(initialForm);

    setSelectedId(null);

    setIsEdit(false);

};

  // ===============================
  // SAVE / UPDATE
  // ===============================

  const handleSubmit = async () => {

    try {

      if (isEdit) {

        await updateGoodsReceiptNote(
          selectedId,
          formData
        );

      } else {

        await createGoodsReceiptNote(
          formData
        );

      }

      setShowModal(false);

      handleClose();

      await fetchGRNs();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Something went wrong."
      );

    }

  };

  // ===============================
  // DELETE GRN
  // ===============================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete Goods Receipt Note?"
      );

    if (!confirmDelete)
      return;

    try {

      await deleteGoodsReceiptNote(id);

      fetchGRNs();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Unable to delete GRN."
      );

    }

  };

  // ===== Part 2 starts from here =====
    // ===============================
  // STATISTICS
  // ===============================

  const totalGRNs =
    grns.length;

  const pendingGRNs =
    grns.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const receivedGRNs =
    grns.filter(
      (item) =>
        item.status === "Received"
    ).length;

  const partiallyReceivedGRNs =
    grns.filter(
      (item) =>
        item.status ===
        "Partially Received"
    ).length;

  const rejectedGRNs =
    grns.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

  // ===============================
  // SEARCH
  // ===============================

  const filteredGRNs =
    grns.filter((item) =>
      item.grnNumber
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <div className="p-5">
        Loading...
      </div>
    );
  }

  // ===============================
  // JSX
  // ===============================

  return (
    <>

      {/* Cards */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total GRNs"
          count={totalGRNs}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Pending"
          count={pendingGRNs}
          bg="#FEF3C7"
          color="#B45309"
        />

        <Card
          title="Received"
          count={receivedGRNs}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Partially Received"
          count={partiallyReceivedGRNs}
          bg="#EFF6FF"
          color="#2563EB"
        />

        <Card
          title="Rejected"
          count={rejectedGRNs}
          bg="#FEF2F2"
          color="#DC2626"
        />

      </div>

      {/* Search */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search GRN Number"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add GRN
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">#</th>

              <th className="p-3 text-left">
                GRN Number
              </th>

              <th className="p-3 text-left">
                Purchase Order
              </th>

              <th className="p-3 text-left">
                Supplier
              </th>

              <th className="p-3 text-left">
                Warehouse
              </th>

              <th className="p-3 text-left">
                GRN Date
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

            {filteredGRNs.map(
              (grn, index) => (

                <tr
                  key={grn._id}
                  className="border-t"
                >

                  <td className="p-3">
                    {(page - 1) * 10 +
                      index +
                      1}
                  </td>

                  <td className="p-3">
                    {grn.grnNumber}
                  </td>

                  <td className="p-3">
                    {grn.purchaseOrder
                      ?.poNumber}
                  </td>

                  <td className="p-3">
                    {grn.supplier?.vendorName}
                  </td>

                  <td className="p-3">
                    {grn.warehouse?.warehouseName}
                  </td>

                  <td className="p-3">
                    {new Date(
                      grn.grnDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded text-sm font-medium
                      ${
                        grn.status === "Received"
                          ? "bg-green-100 text-green-700"
                          : grn.status ===
                            "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : grn.status ===
                            "Partially Received"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {grn.status}
                    </span>

                  </td>

                  <td className="p-3">

                    <div className="flex gap-3">

                      <PencilIcon
                        className="h-5 w-5 text-yellow-500 cursor-pointer"
                        onClick={() =>
                          handleEdit(grn)
                        }
                      />

                      <MdDelete
                        className="text-red-500 text-xl cursor-pointer"
                        onClick={() =>
                          handleDelete(
                            grn._id
                          )
                        }
                      />

                    </div>

                  </td>

                </tr>

              )
            )}

            {filteredGRNs.length ===
              0 && (

              <tr>

                <td
                  colSpan="8"
                  className="text-center py-5 text-gray-500"
                >
                  No Goods Receipt Notes Found
                </td>

              </tr>

            )}

          </tbody>

        </table>

        {/* Pagination */}

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
              disabled={
                page === totalPages
              }
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

      {/* Modal */}

      <GoodsReceiptNoteModal
        isOpen={showModal}
        onClose={handleClose}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEdit}
      />

    </>
  );

};

export default GoodsReceiptNote;