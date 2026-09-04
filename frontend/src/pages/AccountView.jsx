import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { FaBuilding, FaMapMarkerAlt, FaUsers, FaDollarSign } from "react-icons/fa";

const AccountView = () => {
  const { id } = useParams();

  // Get lead data from Redux store
  const lead = useSelector(
    (state) => state.leads.leads.find((lead) => lead._id === id) || null
  );
  const leads = useSelector((state) => state.leads.leads);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get all leads from the same company (including converted and other statuses)
  const companyName = lead?.company || "";
  const companyLeads = leads.filter(
    (leadItem) => leadItem.company.trim().toLowerCase() === companyName.trim().toLowerCase()
  );

  // Separate converted and other leads
  const convertedLeads = companyLeads.filter(lead => lead.status === "Converted");
  const otherLeads = companyLeads.filter(lead => lead.status !== "Converted");

  const totalPages = Math.ceil(companyLeads.length / rowsPerPage);

  const sortedLeads = [...companyLeads].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  const paginatedLeads = sortedLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (!lead) {
    return <div className="p-8">Loading company account data...</div>;
  }

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Converted': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      case 'Work In Progress': return 'bg-blue-100 text-blue-800';
      case 'Opportunity': return 'bg-purple-100 text-purple-800';
      case 'Enquiry': return 'bg-yellow-100 text-yellow-800';
      case 'Quotation': return 'bg-orange-100 text-orange-800';
      case 'Follow-up': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (lead.price || 0), 0);

  return (
    <div className="mt-4 max-w-7xl mx-auto px-4">
      <Toaster />
      
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Link to="/" className="hover:text-[#C2410C]">Dashboard</Link>
        {" "} / {" "}
        <Link to="/account" className="hover:text-[#C2410C]">Accounts</Link>
        {" "} / <span className="text-[#C2410C]">{lead.company}</span>
      </div>

      {/* Company Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <FaBuilding className="text-orange-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lead.company}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <FaMapMarkerAlt className="text-sm" />
                <span>{lead.city}, {lead.state}, {lead.country}</span>
              </div>
              <p className="text-gray-700 mt-1">{lead.address}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{companyLeads.length}</div>
              <div className="text-xs text-blue-700">Total Leads</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{convertedLeads.length}</div>
              <div className="text-xs text-green-700">Converted</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{otherLeads.length}</div>
              <div className="text-xs text-orange-700">In Pipeline</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-purple-700">Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaUsers className="text-orange-500 text-xl" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Company Leads</h2>
              <p className="text-sm text-gray-600">Complete history of interactions with {lead.company}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((leadItem) => (
                  <tr key={leadItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link 
                        to={leadItem.status === 'Converted' ? '/leadsHistoryView' : `/leadsView/${leadItem._id}`}
                        state={leadItem.status === 'Converted' ? {historyObj: leadItem} : undefined}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {leadItem.name}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {leadItem.firstName} {leadItem.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`mailto:${leadItem.email}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {leadItem.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`tel:${leadItem.phone}`} 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {leadItem.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        leadItem.priority === 'High' ? 'bg-red-100 text-red-800' :
                        leadItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {leadItem.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leadItem.status)}`}>
                        {leadItem.status === "Converted" ? "Account Closed" : leadItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {leadItem.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      {leadItem.price ? (
                        <span className="font-medium text-green-600">
                          ₹{leadItem.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {leadItem.createdAt?.split("T")[0]}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {leadItem.updatedAt?.split("T")[0]}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={9}>
                    No leads found for this company
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-200 gap-3 md:gap-0">
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
              <option value="20">20</option>
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
  );
};

export default AccountView;
