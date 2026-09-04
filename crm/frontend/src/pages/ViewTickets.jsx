import React, { useEffect, useState } from "react";
import { fetchTickets } from "../api/fetchTickets";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import { Link } from "react-router-dom";
import { updateTicketStatus } from "../api/updateTicketStatus";

const ViewTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTicket, setSearchTicket] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchTickets();
        setTickets(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    loadTickets();
  }, []);

  // ✅ Filter tickets
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTicket.toLowerCase())
  );

  // ✅ Stats Count
  const totalTickets = tickets.length;

  const activeTickets = tickets.filter(
    (t) => t.status?.toLowerCase() === "active"
  ).length;

  const pendingTickets = tickets.filter(
    (t) => t.status?.toLowerCase() === "pending"
  ).length;

  const closedTickets = tickets.filter(
    (t) => t.status?.toLowerCase() === "closed"
  ).length;

  // ✅ Category Badge Style
  const getCategoryStyle = (category) => {
    switch (category) {
      case "bug":
        return "bg-red-100 text-red-600";

      case "feature":
        return "bg-blue-100 text-blue-600";

      case "support":
        return "bg-green-100 text-green-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ✅ Handle Status Change
  const handleStatusChange = async (id, newStatus) => {
    try {
      // ✅ Update backend
      await updateTicketStatus(id, newStatus);

      // ✅ Update frontend UI
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === id
            ? { ...ticket, status: newStatus }
            : ticket
        )
      );
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ✅ Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          🎫 All Raised Tickets
        </h1>

        <p className="text-gray-500 text-sm">
          Manage all support tickets
        </p>
      </div>

      {/* ✅ Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-l-4 border-orange-500 rounded-lg p-4 shadow">
          <p className="text-gray-500 text-sm">Total Tickets</p>

          <h2 className="text-2xl font-bold text-orange-600">
            {totalTickets}
          </h2>
        </div>

        <div className="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow">
          <p className="text-gray-500 text-sm">Active</p>

          <h2 className="text-2xl font-bold text-blue-600">
            {activeTickets}
          </h2>
        </div>

        <div className="bg-white border-l-4 border-yellow-500 rounded-lg p-4 shadow">
          <p className="text-gray-500 text-sm">Pending</p>

          <h2 className="text-2xl font-bold text-yellow-600">
            {pendingTickets}
          </h2>
        </div>

        <div className="bg-white border-l-4 border-green-500 rounded-lg p-4 shadow">
          <p className="text-gray-500 text-sm">Closed</p>

          <h2 className="text-2xl font-bold text-green-600">
            {closedTickets}
          </h2>
        </div>
      </div>

      {/* ✅ Controls Section */}
      <div className="mt-5 flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* ✅ LEFT SIDE SEARCH */}
        <div className="relative w-full lg:w-96">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchTicket}
            onChange={(e) => setSearchTicket(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* ✅ RIGHT SIDE CREATE BUTTON */}
        <Link
          to="/ticket"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
        >
          + Create Ticket
        </Link>
      </div>

      {/* ✅ Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto mt-5">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3">Category</th>
              <th className="p-3">Title</th>
              <th className="p-3">Image</th>
              <th className="p-3">Description</th>
              <th className="p-3">User</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-10 text-gray-400"
                >
                  No tickets found
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="border-b border-gray-200 hover:bg-orange-50 transition"
                >
                  {/* ✅ Category */}
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryStyle(
                        ticket.category
                      )}`}
                    >
                      {ticket.category || "N/A"}
                    </span>
                  </td>

                  {/* ✅ Title */}
                  <td className="p-3 font-medium text-gray-800">
                    {ticket.title}
                  </td>

                  {/* ✅ Image */}
                  <td className="p-3">
                    {ticket.image ? (
                      <img
                        src={ticket.image}
                        alt="ticket"
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No Image
                      </span>
                    )}
                  </td>

                  {/* ✅ Description */}
                  <td className="p-3 text-gray-600 max-w-xs truncate">
                    {ticket.description}
                  </td>

                  {/* ✅ User */}
                  <td className="p-3 text-gray-700">
                    {ticket.user?.name || "Unknown"}
                  </td>

                  {/* ✅ Status */}
                  <td className="p-3">
                    <select
                      className="border rounded-md px-2 py-1 text-xs"
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(
                          ticket._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>

                  {/* ✅ Date */}
                  <td className="p-3 text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>

                  {/* ✅ Actions */}
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3 text-lg">
                      <Link to={`/tickets/${ticket._id}`}>
                        <button className="text-blue-500 hover:text-blue-700">
                          <FiEye />
                        </button>
                      </Link>

                      <button className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewTickets;