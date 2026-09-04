import React, { useState } from "react";
import "../css/scrollbar.css";
import { IoIosSearch } from "react-icons/io";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateLead } from "../redux/leadSlice.jsx";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { updateLeadStatus } from "../api/fetchdata.jsx";

const Quotation = () => {
  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter quotation leads
  const quotationLeads = leads.filter(
    (lead) =>
      lead.status === "Quotation" ||
      lead.status === "Quotation Sent"
  );

  // Search filter
  const filteredLeads = quotationLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();

    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.company.toLowerCase().includes(q)
    );
  });

  // Sort latest updated first
  const sortedLeads = [...filteredLeads].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const paginatedLeads = sortedLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Rows change
  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  // Pagination buttons
  const handlePrevious = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  };

  // Status update
  const handleChange = (lead) => async (e) => {
    try {
      const updated = await updateLeadStatus(lead._id, {
        status: e.target.value,
      });

      dispatch(
        updateLead({
          id: lead._id,
          changes: { status: updated.status },
        })
      );

      toast.success("Lead status updated");
    } catch {
      toast.error("Failed to update lead.");
    }
  };

  return (
    <div id="table-width-fixed" className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]">Quotations</span>
      </div>

      {/* Header */}
      <div className="mt-4">

        <div className="flex gap-4 items-center">
          <RiMoneyRupeeCircleFill
            size={40}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />

          <p className="text-gray-700 font-extrabold text-2xl">
            Quotation Leads
          </p>
        </div>

        <p className="text-gray-600 mt-3 ml-1">
          Monitor quotations and customer responses
        </p>

        {/* Search */}
        <div className="mt-3 max-w-md relative">
          <IoIosSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search quotations..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto bg-white shadow-md rounded-md">
          <table className="w-full text-sm">

            {/* Table Head */}
            <thead className="text-gray-500 uppercase border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Company</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Assigned</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >

                    {/* Name */}
                    <td className="px-4 py-4 text-blue-600">
                      <Link
                        to={`/view/quotation/${lead._id}`}
                        state={{ fromSection: "quotation" }}
                        className="hover:underline"
                      >
                        {lead.name}
                      </Link>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4">
                      {lead.email}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4">
                      {lead.phone}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-4">
                      {lead.company}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">
                      {lead.priority}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <select
                        value={lead.status}
                        onChange={handleChange(lead)}
                        className="bg-blue-100 px-2 py-1 rounded"
                      >
                        {[lead.status, "Quotation Sent", "Converted"]
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                      </select>
                    </td>

                    {/* Assigned */}
                    <td className="px-4 py-4">
                      {lead.assignedTo}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      {lead.createdAt?.split("T")[0]}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-3 text-lg">

                        {/* VIEW */}
                        <Link
                          to={`/view/quotation/${lead._id}`}
                          state={{ fromSection: "quotation" }}
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <FaEye />
                        </Link>

                        {/* DELETE */}
                        <button
                          className="text-red-500 hover:text-red-700 transition"
                          onClick={() =>
                            toast("Delete not implemented", {
                              icon: "⚠️",
                            })
                          }
                        >
                          <FiTrash2 />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-6 text-center text-gray-500"
                  >
                    No Quotation Leads Available
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-3">

          {/* Rows */}
          <div className="flex gap-2 items-center">
            <span>Rows:</span>

            <select
              value={rowsPerPage}
              onChange={handleRowsChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>

          {/* Prev Next */}
          <div className="flex gap-2">
            <button onClick={handlePrevious}>
              Prev
            </button>

            <span>
              {page} / {totalPages || 1}
            </span>

            <button onClick={handleNext}>
              Next
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Quotation;