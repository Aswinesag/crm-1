import React, {
  useEffect,
  useState,
} from "react";

import Card from "../../components/Card";

import RequestForQuotationModal from "../../components/RequestForQuotationModal";

import { IoIosSearch } from "react-icons/io";

import { MdDelete } from "react-icons/md";

import {
  PencilIcon,
} from "@heroicons/react/24/outline";

import {
  getRFQs,
  createRFQ,
  updateRFQ,
  deleteRFQ,
  approveRFQ,
  rejectRFQ,
  closeRFQ,
} from "../../services/requestForQuotationService";

const RequestForQuotation = () => {
  // =====================================
  // States
  // =====================================

  const [rfqs, setRFQs] = useState([]);

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
    useState({
      purchaseRequisition: "",
      vendorIds: [],
      remarks: "",
      requiredDate: "",
    });

  // =====================================
  // Fetch RFQs
  // =====================================

  const fetchRFQs = async () => {
    try {
      setLoading(true);

      const response =
        await getRFQs(
          page,
          10,
          search
        );

      console.log(response.data.rfqs);

      setRFQs(
        response.data.rfqs || []
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

  // =====================================
  // Load Data
  // =====================================

  useEffect(() => {
    fetchRFQs();
  }, [page]);

  // =====================================
  // Add RFQ
  // =====================================

  const handleAdd = () => {
    setFormData({
      purchaseRequisition: "",
      vendorIds: [],
      remarks: "",
      requiredDate: "",
    });

    setIsEdit(false);

    setSelectedId(null);

    setShowModal(true);
  };

  // =====================================
  // Edit RFQ
  // =====================================

  const handleEdit = (rfq) => {
    setSelectedId(rfq._id);

    setFormData({
      purchaseRequisition:
        rfq.purchaseRequisition?._id || "",

      vendorIds:
        rfq.vendorIds?.map(
          (vendor) =>
            vendor._id || vendor
        ) || [],

      remarks:
        rfq.remarks || "",

      requiredDate:
        rfq.requiredDate
          ?.substring(0, 10) || "",
    });

    setIsEdit(true);

    setShowModal(true);
  };
    // =====================================
  // Submit RFQ
  // =====================================

  const handleSubmit = async () => {
    try {
      if (!formData.purchaseRequisition) {
        return alert(
          "Please Select Purchase Requisition"
        );
      }

      if (
        formData.vendorIds.length === 0
      ) {
        return alert(
          "Please Select At Least One Vendor"
        );
      }

      if (!formData.requiredDate) {
        return alert(
          "Required Date is Required"
        );
      }

      if (isEdit) {
        await updateRFQ(
          selectedId,
          formData
        );
      } else {
        console.log("Purchase Requisition:", formData.purchaseRequisition);
        console.log("Vendor IDs:", formData.vendorIds);
        console.log("Required Date:", formData.requiredDate);
        console.log("Remarks:", formData.remarks);
        await createRFQ(
          formData
        );
      }

      setShowModal(false);

      fetchRFQs();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =====================================
  // Delete RFQ
  // =====================================

  const handleDelete = async (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete Request For Quotation ?"
      );

    if (!confirmDelete) return;

    try {
      await deleteRFQ(id);

      fetchRFQs();
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================
  // Approve RFQ
  // =====================================

  const handleApprove = async (
    id
  ) => {
    try {
      await approveRFQ(id);

      fetchRFQs();
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================
  // Reject RFQ
  // =====================================

  const handleReject = async (
    id
  ) => {
    try {
      await rejectRFQ(id);

      fetchRFQs();
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================
  // Close RFQ
  // =====================================

  const handleCloseRFQ = async (
    id
  ) => {
    try {
      await closeRFQ(id);

      fetchRFQs();
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================
  // Dashboard Cards
  // =====================================

  const totalRFQs =
    rfqs.length;

  const pendingRFQs =
    rfqs.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const approvedRFQs =
    rfqs.filter(
      (item) =>
        item.status === "Approved"
    ).length;

  const rejectedRFQs =
    rfqs.filter(
      (item) =>
        item.status === "Rejected"
    ).length;

  const closedRFQs =
    rfqs.filter(
      (item) =>
        item.status === "Closed"
    ).length;

  // =====================================
  // Search Filter
  // =====================================

  const filteredRFQs =
    rfqs.filter((item) =>
      item.rfqNumber
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // =====================================
  // Loading
  // =====================================

  if (loading) {
    return (
      <div className="p-5">
        Loading...
      </div>
    );
  }
    return (
    <>
      {/* Dashboard Cards */}

      <div className="flex flex-wrap gap-3 mt-4">
        <Card
          title="Total RFQs"
          count={totalRFQs}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Pending"
          count={pendingRFQs}
          bg="#FEFCE8"
          color="#CA8A04"
        />

        <Card
          title="Approved"
          count={approvedRFQs}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Rejected"
          count={rejectedRFQs}
          bg="#FEF2F2"
          color="#DC2626"
        />

        <Card
          title="Closed"
          count={closedRFQs}
          bg="#EFF6FF"
          color="#2563EB"
        />
      </div>

      {/* Search & Buttons */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search RFQ Number"
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
            onClick={fetchRFQs}
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add RFQ
          </button>

        </div>

      </div>

      {/* RFQ Table */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                RFQ No
              </th>

              <th className="p-3 text-left">
                Purchase Requisition
              </th>

              <th className="p-3 text-left">
                Vendors
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

            {filteredRFQs.map(
              (rfq, index) => (

                <tr
                  key={rfq._id}
                  className="border-t"
                >

                  <td className="p-3">
                    {(page - 1) * 10 +
                      index +
                      1}
                  </td>

                  <td className="p-3 font-medium">
                    {rfq.rfqNumber}
                  </td>

                  <td className="p-3">
                    {rfq.purchaseRequisition
                      ?.requisitionNo || "-"}
                  </td>

                  <td className="p-3">
                    {rfq.vendors
                        ?.map(
                            (vendor) =>
                                vendor.vendorName || vendor.email
                        )
                        .join(", ") || "-"}
                  </td>

                 <td className="p-3">
                  {rfq.purchaseRequisition?.requiredDate
                      ? new Date(
                          rfq.purchaseRequisition.requiredDate
                        ).toLocaleDateString("en-GB")
                      : "-"}
                </td>

                  <td className="p-3">                    <span
                      className={
                        rfq.status === "Approved"
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                          : rfq.status === "Rejected"
                          ? "bg-red-100 text-red-700 px-3 py-1 rounded"
                          : rfq.status === "Closed"
                          ? "bg-blue-100 text-blue-700 px-3 py-1 rounded"
                          : "bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                      }
                    >
                      {rfq.status}
                    </span>
                  </td>

                  <td className="p-3">

                    <div className="flex items-center gap-3 flex-wrap">

                      {/* Edit */}

                      <PencilIcon
                        className="h-5 w-5 text-yellow-500 cursor-pointer"
                        onClick={() =>
                          handleEdit(rfq)
                        }
                      />

                      {/* Delete */}

                      <MdDelete
                        className="text-red-500 text-xl cursor-pointer"
                        onClick={() =>
                          handleDelete(rfq._id)
                        }
                      />

                      {/* Approve */}

                      {rfq.status ===
                        "Pending" && (
                        <button
                          onClick={() =>
                            handleApprove(
                              rfq._id
                            )
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Approve
                        </button>
                      )}

                      {/* Reject */}

                      {rfq.status ===
                        "Pending" && (
                        <button
                          onClick={() =>
                            handleReject(
                              rfq._id
                            )
                          }
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Reject
                        </button>
                      )}

                      {/* Close */}

                      {rfq.status ===
                        "Approved" && (
                        <button
                          onClick={() =>
                            handleCloseRFQ(
                              rfq._id
                            )
                          }
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Close
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              )
            )}

            {filteredRFQs.length ===
              0 && (
              <tr>

                <td
                  colSpan="7"
                  className="text-center py-5 text-gray-500"
                >
                  No RFQs Found
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

      <RequestForQuotationModal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEdit}
      />
    </>
  );
};

export default RequestForQuotation;