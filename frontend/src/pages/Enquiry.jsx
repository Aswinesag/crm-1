import React, { useState } from "react";
import "../css/scrollbar.css";
import { IoIosSearch } from "react-icons/io";
import { BsQuestionCircleFill } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa"; // ✅ added
import { useDispatch, useSelector } from "react-redux";
import { updateLead } from "../redux/leadSlice.jsx";
import { Link } from "react-router-dom"; // ✅ navigate not needed now
import toast, { Toaster } from "react-hot-toast";
import { updateLeadStatus } from "../api/fetchdata.jsx";

const Enquiry = () => {
  const dispatch = useDispatch();
  const leads = useSelector((state) => state.leads.leads);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter only Enquiry
  const enquiryLeads = leads.filter((lead) => lead.status === "Enquiry");

  // Search filter
  const filteredLeads = enquiryLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.company.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const sortedLeads = [...filteredLeads].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  const paginatedLeads = sortedLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  const handlePrevious = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  // Status update
  const handleChange = (lead) => async (e) => {
    try {
      const newStatus = e.target.value;

      if (newStatus === "Opportunity" && !lead.assignedTo) {
        toast.error("Please assign an engineer before changing status.");
        return;
      }

      const updated = await updateLeadStatus(lead._id, {
        status: newStatus,
      });

      dispatch(
        updateLead({
          id: lead._id,
          changes: { status: updated.status },
        })
      );
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
        / <span className="text-[#C2410C]">Enquiries</span>
      </div>

      {/* Header */}
      <div className="mt-4">
        <div className="flex gap-4 items-center">
          <BsQuestionCircleFill
            size={40}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />
          <p className="text-gray-700 font-extrabold text-2xl">
            Enquiry Leads
          </p>
        </div>

        <p className="text-gray-600 mt-3 ml-1">
          Monitor incoming leads and their requirements
        </p>

        {/* Search */}
        <div className="mt-3 max-w-md relative">
          <IoIosSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search enquiries..."
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

            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    {/* Name (clickable) */}
                    <td className="px-4 py-4 text-blue-600">
                      <Link
                        to={`/view/enquiry/${lead._id}`}
                        state={{ fromSection: "enquiry" }}
                        className="hover:underline"
                      >
                        {lead.name}
                      </Link>
                    </td>

                    <td className="px-4 py-4">{lead.email}</td>
                    <td className="px-4 py-4">{lead.phone}</td>
                    <td className="px-4 py-4">{lead.company}</td>
                    <td className="px-4 py-4">{lead.priority}</td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <select
                        value={lead.status}
                        onChange={handleChange(lead)}
                        className="bg-blue-100 px-2 py-1 rounded"
                      >
                        {[lead.status, "Quotation", "Follow-up", "Lost"]
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                      </select>
                    </td>

                    <td className="px-4 py-4">{lead.assignedTo}</td>

                    <td className="px-4 py-4">
                      {lead.createdAt?.split("T")[0]}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-3 text-lg">

                        {/* ✅ VIEW USING LINK */}
                        <Link
                          to={`/view/enquiry/${lead._id}`}
                          state={{ fromSection: "enquiry" }}
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
                  <td colSpan={9} className="py-6 text-center text-gray-500">
                    No Enquiry Leads Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-2 items-center">
            <span>Rows:</span>
            <select value={rowsPerPage} onChange={handleRowsChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={handlePrevious}>Prev</button>
            <span>
              {page} / {totalPages}
            </span>
            <button onClick={handleNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enquiry;