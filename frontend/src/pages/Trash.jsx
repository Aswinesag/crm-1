import React, { useState, useEffect, useMemo } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoTrashBinSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DeletedUserTable from "../components/DeletedUserTable.jsx";
import axiosInstance from "../api/axiosInstance.jsx";
import { getAllDeletedUser } from "../redux/userSlice.jsx";

const Trash = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const deletedUsers = useSelector((state) => state.users.deletedUser)
  

  // Leads state from Redux
  const leads = useSelector((state) => state.leads.leads);
  const deletedLeads = leads.filter(lead => lead.status === 'deleted');
  const [searchLead, setSearchLead] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Leads pagination (same pattern as DeletedUserTable)
  const [leadPage, setLeadPage] = useState(1);
  const [leadRowsPerPage, setLeadRowsPerPage] = useState(5);

  // Filtered deleted users
  const filteredUsers = (deletedUsers || []).filter((u) =>
    (u?.name || "").toLowerCase().includes(searchUser.toLowerCase()) ||
    (u?.email || "").toLowerCase().includes(searchUser.toLowerCase()) ||
    (u?.phoneNum || "").toLowerCase().includes(searchUser.toLowerCase())
  );

  // Filtered leads
  const filteredLeads = (deletedLeads || []).filter((lead) =>
    (lead?.name || "").toLowerCase().includes(searchLead.toLowerCase()) ||
    (lead?.email || "").toLowerCase().includes(searchLead.toLowerCase()) ||
    (lead?.phone || "").toLowerCase().includes(searchLead.toLowerCase()) ||
    (lead?.company || "").toLowerCase().includes(searchLead.toLowerCase())
  )
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  

  // Leads pagination calculations
  const totalLeads = filteredLeads.length;
  const leadTotalPages = Math.ceil(totalLeads / leadRowsPerPage);
  const leadStartIndex = totalLeads > 0 ? (leadPage - 1) * leadRowsPerPage + 1 : 0;
  const leadEndIndex = Math.min(leadPage * leadRowsPerPage, totalLeads);

  const paginatedLeads = useMemo(() => {
    const start = (leadPage - 1) * leadRowsPerPage;
    const end = start + leadRowsPerPage;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, leadRowsPerPage, leadPage]);

  const handleLeadRowsChange = (e) => {
    setLeadRowsPerPage(Number(e.target.value));
    setLeadPage(1);
  };

  const handleLeadPrev = () => {
    if (leadPage > 1) setLeadPage((p) => p - 1);
  };

  const handleLeadNext = () => {
    if (leadPage < leadTotalPages) setLeadPage((p) => p + 1);
  };

  // Reset leads page when search changes
  useEffect(() => {
    setLeadPage(1);
  }, [searchLead]);

  useEffect(() => {
    // Fetch deleted users
    const fetchGetAllDeletedUsers = async () => {
      try {
        const { data } = await axiosInstance.get("/users/trash");
        dispatch(getAllDeletedUser(data));
      } catch (err) {
        console.log(`fetching get all deleted users error : ${err.message} `);
      } finally {
        setLoading(false);
      }
    };

    // Fetch deleted leads
    const fetchDeletedLeads = async () => {
      setLoadingLeads(true);
      try {
        const { data } = await axiosInstance.get("leads/deleted-leads");
        // Dispatch to your leads slice; keep this action type as per your setup
        dispatch({ type: "leads/getAllDeletedLeads", payload: data?.data || [] });
      } catch (err) {
        console.log(`fetching deleted leads error : ${err.message} `);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchGetAllDeletedUsers();
    fetchDeletedLeads();
  }, [dispatch]);

  if (loading || loadingLeads) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-500">Loading deleted users and leads...</span>
      </div>
    );
  }

  return (
    <div id="table-width-fixed">
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Deleted Leads & Users </span>
      </div>

      {/* Deleted Leads Section */}
      <div className="mt-10">
        <div className="flex flex-row gap-4 items-center mt-4">
          <IoTrashBinSharp size={40} className="bg-red-100 text-red-500 rounded p-2" />
          <p className="text-gray-700 font-extrabold text-lg">Deleted Leads (Trash)</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center mt-3">
          <p className="text-gray-600 ml-1">
            View all leads marked as deleted and manage them if necessary
          </p>
          <div className="text-sm text-gray-500">
            {(leads || []).length} deleted lead{(leads || []).length !== 1 && "s"}
          </div>
        </div>

        {/* Leads search */}
        <div className="mt-5 flex flex-col lg:flex-row justify-between items-center gap-2">
          <div className="relative w-full max-w-md cursor-pointer">
            <IoIosSearch
              size={22}
              className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchLead}
              onChange={(e) => setSearchLead(e.target.value)}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:border-red-500 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Leads Table with rows-per-page pagination (same UX as DeletedUserTable) */}
        <div className="rounded-md w-auto bg-white shadow-md mt-6 overflow-x-auto">
          <table className="w-full border-b border-gray-300 rounded-md text-sm text-left">
            <thead className="bg-red-100 text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Lead Name</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Email</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Phone</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Company</th>
                <th className="p-3 border-b border-gray-300 text-center md:text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <tr key={lead._id || lead.id} className="hover:bg-gray-50">
                    <td className="p-4 border-b border-gray-300 text-blue-700"><Link
                      // className="text-blue-600 hover:underline text-left"
                      to='/leadsHistoryView'
                      state={{historyObj: lead}}
                    >
                      {lead?.name}
                    </Link></td>
                    <td className="p-3 border-b border-gray-300"><a href={`mailto:${lead?.email}`} className="outline-none w-full hover:text-blue-600 hover:underline">{lead?.email}</a></td>
                    <td className="p-3 border-b border-gray-300"><a href={`tel:${lead?.phone}`} className="outline-none w-full hover:text-blue-600 hover:underline">{lead?.phone}</a></td>
                    <td className="p-4 border-b border-gray-300">{lead?.company}</td>
                    <td className="p-4 border-b border-gray-300"><span className="bg-red-100 text-red-800 px-2 py-1 rounded-xl">{lead?.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 border-b border-gray-300 text-gray-700 text-center" colSpan={4}>
                    No Leads Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Leads pagination controls */}
          <div className="flex flex-col md:flex-row justify-between items-center p-3 gap-3 md:gap-0">
            <div className="flex gap-2 items-center">
              <p className="text-gray-600">Rows per page:</p>
              <select
                value={leadRowsPerPage}
                onChange={handleLeadRowsChange}
                className="text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleLeadPrev}
                disabled={leadPage === 1}
                className={`px-3 py-1 rounded-md border ${
                  leadPage === 1
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                Previous
              </button>
              <span className="text-gray-600">{leadPage} / {Math.max(leadTotalPages, 1)}</span>
              <button
                onClick={handleLeadNext}
                disabled={leadPage === leadTotalPages || leadTotalPages === 0}
                className={`px-3 py-1 rounded-md border ${
                  leadPage === leadTotalPages || leadTotalPages === 0
                    ? "text-gray-300 border-gray-200 cursor-not-allowed"
                    : "text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="text-gray-600 text-end mt-3">
          {totalLeads > 0 ? `${leadStartIndex}–${leadEndIndex} of ${totalLeads} leads` : "No leads available"}
        </div>
      </div>

      {/* users */}

      <div className="flex flex-row gap-4 items-center mt-4">
        <IoTrashBinSharp size={40} className="bg-red-100 text-red-500 rounded p-2" />
        <p className="text-gray-700 font-extrabold text-lg">Deleted Users (Trash)</p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center">
        <p className="text-gray-600 mt-3 ml-1">
          View all deleted users from the last three (3) months and restore them if necessary
        </p>
        <div className="text-sm text-gray-500">
          {(deletedUsers || []).length} deleted user{(deletedUsers || []).length !== 1 && "s"}
        </div>
      </div>

      <div className="mt-5 flex flex-col lg:flex-row justify-between items-center gap-2">
        <div className="relative w-full max-w-md cursor-pointer">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <DeletedUserTable users={filteredUsers} />
    </div>
  );
};

export default Trash;
