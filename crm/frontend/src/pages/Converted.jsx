import React, { useState, useEffect } from "react";
import "../css/scrollbar.css";
import { IoIosSearch } from "react-icons/io";
import { SiTicktick } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import { setLeads } from "../redux/leadSlice.jsx";
import { DummyLeads } from "../data/context.jsx";
import { Link } from "react-router-dom";

const Converted = () => {
  const dispatch = useDispatch();

  
  const leads = useSelector((state) => state.leads.leads);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter leads with status "Converted"
  const convertedLeads = leads.filter((lead) => lead.status === "Converted");

  // Search filter
  const filteredLeads = convertedLeads.filter((lead) => {
    const lowerSearch = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(lowerSearch) ||
      lead.email.toLowerCase().includes(lowerSearch) ||
      lead.phone.includes(searchQuery) ||
      lead.company.toLowerCase().includes(lowerSearch)
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
  const handlePrevious = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div id="table-width-fixed" className="mt-4">
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Converted </span>
      </div>

      <div className="mt-4">
        <div className="flex flex-row gap-4 items-center">
          <SiTicktick
            size={40}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />
          <p className="text-gray-700 font-extrabold text-2xl">Converted Leads</p>
        </div>

        <p className="text-gray-600 mt-3 ml-1">
          Successfully closed deals and converted clients
        </p>

        <div className="mt-2 w-full max-w-md cursor-pointer relative">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search converteds..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 focus:border-orange-500 rounded-lg focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Converted Table */}
        <div className="mt-7 overflow-x-auto w-auto rounded-md bg-white shadow-md">
          <table className="w-full border-b border-gray-300 rounded-md text-sm text-left">
            <thead className="bg-white text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Name</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Email</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Phone</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Company</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Priority</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Status</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Assigned To</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b border-gray-300 text-blue-700">
                       <Link to={`/convertedView/${lead._id}`}>{lead.name}</Link>
                    </td>
                    <td className="p-3 border-b border-gray-300"><a href={`mailto:${lead.email}`} className="outline-none w-full hover:text-blue-600 hover:underline">{lead.email}</a></td>
                    <td className="p-3 border-b border-gray-300"><a href={`tel:${lead.phone}`} className="outline-none w-full hover:text-blue-600 hover:underline">{lead.phone}</a></td>
                    <td className="p-3 border-b border-gray-300">{lead.company}</td>
                    <td className="p-3 border-b border-gray-300">{lead.priority}</td>
                    <td className="p-3 border-b border-gray-300"> <span className="bg-green-200 rounded-2xl px-2 py-1 w-30 text-green-900">{lead.status === "Converted" ? "Sales Closed" :""}</span></td>
                    <td className="p-3 border-b border-gray-300">{lead.assignedTo}</td>
                    <td className="p-3 border-b border-gray-300">
                      {lead.createdAt?.split("T")[0]}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="p-4 border-b border-gray-300 text-gray-700 text-center"
                    colSpan={8}
                  >
                    No Converted Leads Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-3 gap-3 md:gap-0">
          <div className="flex gap-2 items-center">
            <p className="text-gray-600">Rows per page:</p>
            <select
              value={rowsPerPage}
              onChange={handleRowsChange}
              className="text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border ${
                page === 1
                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                  : 'text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border ${
                page === totalPages
                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                  : 'text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer'
              }`}
            >
              Next
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Converted;
