import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTickets } from "../api/fetchTickets";
import { FiArrowLeft, FiUser, FiCalendar, FiInfo } from "react-icons/fi";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const data = await fetchTickets();
        const found = data.find((t) => t._id === id);
        setTicket(found);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    loadTicket();
  }, [id]);

  // Category Style
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

  // Status Style
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-600";
      case "Pending":
        return "bg-yellow-100 text-yellow-600";
      case "Closed":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-green-100 text-green-600";
    }
  };

  if (!ticket) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading ticket details...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-6"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header Section */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800">
              {ticket.title}
            </h1>

            {/* Category Badge */}
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${getCategoryStyle(
                ticket.category
              )}`}
            >
              {ticket.category || "N/A"}
            </span>

          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Image */}
          {ticket.image && (
            <div className="rounded-xl overflow-hidden border shadow-sm">
              <img
                src={ticket.image}
                alt="ticket"
                className="w-full h-64 object-cover hover:scale-105 transition duration-300"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
              <FiInfo /> Description
            </h2>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border">
              {ticket.description || "No description provided"}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* User */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FiUser /> User
              </h3>
              <p className="text-gray-800 font-medium">
                {ticket.user?.name || "Unknown"}
              </p>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-xs text-gray-500 mb-1">
                Status
              </h3>
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                  ticket.status || "Active"
                )}`}
              >
                {ticket.status || "Active"}
              </span>
            </div>

            {/* Date */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FiCalendar /> Date
              </h3>
              <p className="text-gray-700 text-sm">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TicketDetails;