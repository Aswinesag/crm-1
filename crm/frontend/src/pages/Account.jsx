import React, { useMemo, useState } from "react";
import "../css/scrollbar.css";
import { IoIosSearch } from "react-icons/io";
import { SiTicktick } from "react-icons/si";
import {
  FaBuilding,
  FaUsers,
  FaCalendar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Account = () => {
  const leads = useSelector((state) => state.leads.leads);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(12);

  // ===============================
  // Converted Leads
  // ===============================
  const convertedLeads = useMemo(() => {
    return leads.filter((lead) => lead.status === "Converted");
  }, [leads]);

  // ===============================
  // Group by Company
  // ===============================
  const companyAccounts = useMemo(() => {
    const groupedCompanies = convertedLeads.reduce((acc, lead) => {
      const companyName = lead.company?.trim() || "Unknown Company";

      if (!acc[companyName]) {
        acc[companyName] = [];
      }

      acc[companyName].push(lead);

      return acc;
    }, {});

    return Object.entries(groupedCompanies).map(
      ([companyName, companyLeads]) => {
        const latestLead = [...companyLeads].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )[0];

        return {
          company: companyName,
          leadCount: companyLeads.length,
          latestLead,
          primaryContact: latestLead?.name || "N/A",
          email: latestLead?.email || "N/A",
          phone: latestLead?.phone || "N/A",
          assignedTo: latestLead?.assignedTo || "",
          lastActivity: latestLead?.updatedAt,
          location: `${latestLead?.city || ""}, ${
            latestLead?.state || ""
          }`,
          priority: latestLead?.priority || "Low",
        };
      }
    );
  }, [convertedLeads]);

  // ===============================
  // Search Filter
  // ===============================
  const filteredAccounts = companyAccounts.filter((account) => {
    const lowerSearch = searchQuery.toLowerCase();

    return (
      account.company.toLowerCase().includes(lowerSearch) ||
      account.primaryContact.toLowerCase().includes(lowerSearch) ||
      account.email.toLowerCase().includes(lowerSearch) ||
      account.phone.includes(searchQuery) ||
      account.location.toLowerCase().includes(lowerSearch)
    );
  });

  // ===============================
  // Sort
  // ===============================
  const sortedAccounts = [...filteredAccounts].sort(
    (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
  );

  // ===============================
  // Pagination
  // ===============================
  const totalPages = Math.ceil(
    sortedAccounts.length / cardsPerPage
  );

  const paginatedAccounts = sortedAccounts.slice(
    (page - 1) * cardsPerPage,
    page * cardsPerPage
  );

  // ===============================
  // Pagination Handlers
  // ===============================
  const handleCardsChange = (e) => {
    setCardsPerPage(Number(e.target.value));
    setPage(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  // ===============================
  // Priority Color
  // ===============================
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border border-red-200";

      case "Medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";

      case "Low":
        return "bg-green-100 text-green-700 border border-green-200";

      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 bg-gray-50 min-h-screen">
      {/* ========================================= */}
      {/* Breadcrumb */}
      {/* ========================================= */}
      <div className="text-sm text-gray-600">
        <Link to="/" className="hover:text-orange-600 transition">
          Dashboard
        </Link>

        <span className="mx-2">/</span>

        <span className="text-orange-600 font-medium">
          Accounts
        </span>
      </div>

      {/* ========================================= */}
      {/* Header */}
      {/* ========================================= */}
      <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <SiTicktick className="text-orange-600 text-2xl" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Accounts
            </h1>

            <p className="text-gray-500 mt-1">
              Converted clients grouped company-wise
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-500">
              Total Companies
            </p>

            <h3 className="text-xl font-bold text-orange-600">
              {companyAccounts.length}
            </h3>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border">
            <p className="text-xs text-gray-500">
              Converted Accounts
            </p>

            <h3 className="text-xl font-bold text-green-600">
              {convertedLeads.length}
            </h3>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* Search */}
      {/* ========================================= */}
      <div className="mt-6">
        <div className="relative w-full md:w-[60%]">
          {/* 
            ✅ Company Search Width changed to 60%
          */}

          <IoIosSearch
            size={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search company, contact, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* ========================================= */}
      {/* Company Cards */}
      {/* ========================================= */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedAccounts.length > 0 ? (
          paginatedAccounts.map((account, index) => (
            <Link
              key={index}
              to={`/accountView/${account.latestLead._id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* =============================== */}
                {/* Top */}
                {/* =============================== */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="bg-orange-100 p-3 rounded-xl h-fit">
                      <FaBuilding className="text-orange-600 text-lg" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-gray-900 truncate">
                        {account.company}
                      </h2>

                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <FaMapMarkerAlt className="text-xs" />

                        <span className="truncate">
                          {account.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${getPriorityColor(
                      account.priority
                    )}`}
                  >
                    {account.priority}
                  </span>
                </div>

                {/* =============================== */}
                {/* Account Count */}
                {/* =============================== */}
                <div className="mt-5 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Accounts
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900">
                      {account.leadCount}
                    </h3>
                  </div>

                  <div className="bg-orange-100 p-3 rounded-xl">
                    <FaUsers className="text-orange-600" />
                  </div>
                </div>

                {/* =============================== */}
                {/* Contact Details */}
                {/* =============================== */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <FaUsers className="text-gray-500 text-sm" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Primary Contact
                      </p>

                      <p className="text-sm font-medium text-gray-700 truncate">
                        {account.primaryContact}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <FaEnvelope className="text-gray-500 text-sm" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        Email Address
                      </p>

                      <p className="text-sm text-gray-700 truncate">
                        {account.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <FaPhone className="text-gray-500 text-sm" />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Phone Number
                      </p>

                      <p className="text-sm text-gray-700">
                        {account.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* =============================== */}
                {/* Footer */}
                {/* =============================== */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FaCalendar />

                    <span>
                      {new Date(
                        account.lastActivity
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="bg-orange-100 p-5 rounded-full">
              <FaBuilding className="text-4xl text-orange-500" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-700">
              No Company Accounts Found
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Try changing your search keyword
            </p>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* Pagination */}
      {/* ========================================= */}
      <div className="mt-8 bg-white border rounded-2xl shadow-sm px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Cards Per Page */}
        <div className="flex items-center gap-3">
          <p className="text-gray-600 text-sm">
            Cards per page:
          </p>

          <select
            value={cardsPerPage}
            onChange={handleCardsChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="24">24</option>
          </select>
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              page === 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Previous
          </button>

          <span className="text-sm text-gray-600 font-medium">
            {page} / {totalPages || 1}
          </span>

          <button
            onClick={handleNext}
            disabled={page === totalPages || totalPages === 0}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              page === totalPages || totalPages === 0
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;