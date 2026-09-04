import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { IoIosSearch } from "react-icons/io";
import Card from "../components/Card.jsx";
import { useDispatch, useSelector } from "react-redux";
import { updateLead } from "../redux/leadSlice.jsx";
import { updateLeadStatus } from "../api/fetchdata.jsx"; // ✅ import API
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Opportunities = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Select leads from redux store
  const leads = useSelector((state) => state.leads.leads);
  console.log(leads);
  const currentUser = useSelector((state) => state.users.currentUser);

  const openDeleteModal = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };
  // Local state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showNotQualifiedModal, setShowNotQualifiedModal] = useState(false);
  const [notQualifiedLead, setNotQualifiedLead] = useState(null);
  const [failedReason, setFailedReason] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [failedDate, setFailedDate] = useState(new Date().toISOString().slice(0, 10));

    // Dynamic Products State
  const [products, setProducts] = useState([
    {
      productName: "",
      quantity: 1,
    },
  ]);

  // Add Product Row
const handleAddProduct = () => {
  setProducts([
    ...products,
    {
      productName: "",
      quantity: 1,
    },
  ]);
};

// Remove Product Row
const handleRemoveProduct = (index) => {
  const updatedProducts = products.filter((_, i) => i !== index);
  setProducts(updatedProducts);
};

// Handle Product Field Change
const handleProductChange = (index, field, value) => {
  const updatedProducts = [...products];

  updatedProducts[index][field] = value;

  setProducts(updatedProducts);
};

  // Filter: consider these statuses as opportunities
  const opportunities = leads.filter((lead) =>
    [
      "Opportunity",
      "Enquiry",
      "Quotation",
      "Follow-up",
      "Converted",
      "Lost",
    ].includes(lead.status)
  );
  //lead delete functionality
  const closeDeleteModal = () => {
    setLeadToDelete(null);
    setShowDeleteModal(false);
  };

  // Confirm delete: change status to "Deleted"
  const confirmDelete = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      const updated = await updateLeadStatus(leadToDelete._id, {
        status: "deleted",
      });
      dispatch(updateLead({ id: leadToDelete._id, changes: updated }));
      toast.success(`Lead "${leadToDelete.name}"  as Deleted`);
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  // Filter + search
  const filteredOpportunities = opportunities.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.company.toLowerCase().includes(searchQuery);

    const matchesFilter = statusFilter ? lead.status === statusFilter : true;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOpportunities.length / rowsPerPage);

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };
  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const sortedLeads = [...filteredOpportunities].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // Paginate
  const paginatedLeads = sortedLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Summary cards
  const totalOpps = opportunities.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayOpps = opportunities.filter(
    (l) => l.createdAt?.split("T")[0] === today
  ).length;
  const totalEnquiry = opportunities.filter(
    (l) => l.status === "Enquiry"
  ).length;
  const totalQuotation = opportunities.filter(
    (l) => l.status === "Quotation"
  ).length;
  const totalConverted = opportunities.filter(
    (l) => l.status === "Converted"
  ).length;
  const totalFollowUps = opportunities.filter(
    (l) => l.status === "Follow-up"
  ).length;


  const handleChange = (lead) => async (e) => {
    try {
      const newStatus = e.target.value;

      if (newStatus === "Lost") {
        // Open your popup modal here for this lead
        setNotQualifiedLead(lead);
        setFailedReason("");
        setFailedMessage("");
        setFailedDate(new Date().toISOString().slice(0, 10));
        setShowNotQualifiedModal(true);
        // Don't update status directly here, wait for modal submit
        return;
      }

      if (newStatus === "Opportunity" && !lead.assignedTo) {
        toast('Please assign an engineer before changing status to Qualified.', {
          icon: '⚠️',
          style: {
            color: 'black',
          },
        });
        return;
      }

      if(lead.status === "Opportunity" && (newStatus === "Quotation" || newStatus === "Converted")){
        toast('Please select enquiry first', {
          icon: '⚠️',
          style: {
            color: 'black',
          },
        });
        return;
      }

      if(lead.status === "Enquiry" && (newStatus === "Converted")){
        toast('Please select quotation first', {
          icon: '⚠️',
          style: {
            color: 'black',
          },
        });
        return;
      }

      if(lead.status === "Quotation" && (newStatus === "Converted")){
        toast('Please send quotation to lead mail', {
          icon: '⚠️',
          style: {
            color: 'black',
          },
        });
        return;
      }

      // Normal status update
      const updated = await updateLeadStatus(lead._id, { status: newStatus });
      dispatch(updateLead({ id: lead._id, changes: { status: updated.status } }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("Not authorized to update this lead.");
      } else {
        toast.error("Failed to update lead.");
      }
    }
  }
  return (
    <div className="mt-4" id="table-width-fixed">
      <Toaster />
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Opportunities </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-1 mt-4">
        <Card
          title="Total Opportunities"
          count={totalOpps}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Today Opportunities"
          count={todayOpps}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Total Enquiry"
          count={totalEnquiry}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Total Quotation"
          count={totalQuotation}
          bg="#F0FDF4"
          color="#15803D"
        />
        <Card
          title="Total Converted"
          count={totalConverted}
          bg="#EEF2FF"
          color="#4338CA"
        />
        <Card
          title="Total Follow-ups"
          count={totalFollowUps}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
      </div>

      {/* Search + Filter */}
      {/* Dynamic Products Section */}
      
      <div className="mt-5 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="relative w-full max-w-md cursor-pointer">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 focus:border-orange-500 rounded-lg focus:outline-none cursor-pointer"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="w-73 bg-white rounded-md">
          <select
            name="statusFilter"
            id="statusFilter"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:border-orange-500 focus:outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            {/* <option value="Yet to Start">Yet to Start</option> */}
            {/* <option value="Work In Progress">Work In Progress</option> */}
            <option value="Opportunity">Opportunity</option>
            <option value="Enquiry">Enquiry</option>
            <option value="Quotation">Quotation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
            {/* <option value="Not Qualified">Not Qualified</option> */}
          </select>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="mt-7 overflow-x-auto w-auto rounded-md bg-white shadow-md">
        <table className="w-full border-b border-gray-300 rounded-md text-sm text-left">
          <thead className="bg-white text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="p-3 border-b border-gray-300 text-start">Opportunity Name</th>
              <th className="p-3 border-b border-gray-300 text-start">Email</th>
              <th className="p-3 border-b border-gray-300 text-start">Phone</th>
              <th className="p-3 border-b border-gray-300 text-start">Company Name</th>
              <th className="p-3 border-b border-gray-300 text-start">Priority</th>
              <th className="p-3 border-b border-gray-300 text-start">Status</th>
              <th className="p-3 border-b border-gray-300 text-start">Assigned To</th>
              <th className="p-3 border-b border-gray-300 text-start">Date</th>
              {currentUser.role === "Super Admin" && (
                <th className="p-3 border-b border-gray-300 text-start">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b text-blue-700 border-gray-300">
                    <Link
                      to={`/view/opportunity/${lead._id}`}
                      state={{ fromSection: "opportunities" }}
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="p-3 border-b border-gray-300"><a href={`mailto:${lead.email}`} className="outline-none w-full hover:text-blue-600 hover:underline">{lead.email}</a></td>
                  <td className="p-3 border-b border-gray-300"><a href={`tel:${lead.phone}`} className="outline-none w-full hover:text-blue-600 hover:underline">{lead.phone}</a></td>
                  <td className="p-3 border-b border-gray-300">{lead.company}</td>
                  <td className="p-3 border-b border-gray-300">{lead.priority}</td>

                  {/* ✅ Status Update with DB call */}
                  <td className="p-3 border-b border-gray-300">
                    <select
                      className="bg-blue-100 border-2 border-blue-300 rounded-md px-2 py-1 focus:outline-none"
                      value={lead.status}
                      onChange={handleChange(lead)}
                    >
                      {/* <option value="Yet to Start">Yet to Start</option> */}
                      {/* <option value="Work In Progress">Work In Progress</option> */}
                      <option value="Opportunity">Opportunity</option>
                      <option value="Enquiry">Enquiry</option>
                      <option value="Quotation">Quotation</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Converted">Converted</option>
                      <option value="Lost">Lost</option>
                      {/* <option value="Not Qualified">Not Qualified</option> */}
                    </select>
                  </td>

                  <td className="p-3 border-b border-gray-300">{lead.assignedTo}</td>
                  <td className="p-3 border-b border-gray-300">
                    {lead.createdAt?.split("T")[0]}
                  </td>
                 {/* Actions */}
{currentUser.role === "Super Admin" && (
  <td className="p-3 border-b border-gray-300">
    <div className="flex justify-center gap-3 text-lg">

      {/* VIEW ICON */}
      <Link
        to={`/view/opportunity/${lead._id}`}
        state={{ fromSection: "opportunities" }}
        className="text-blue-500 hover:text-blue-700 transition"
      >
        <FaEye />
      </Link>

      {/* DELETE ICON */}
      <button
        className="text-red-500 hover:text-red-700 transition"
        onClick={() => openDeleteModal(lead)}
      >
        <FiTrash2 />
      </button>

    </div>
  </td>
)}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 border-b text-gray-700 text-center"
                  colSpan={9}
                >
                  No Opportunities Available
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

      {showNotQualifiedModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4 text-center">Not Qualified Details</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Lost Reason</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                  type="text"
                  className="outline-none w-full"
                  value={failedReason} onChange={e => setFailedReason(e.target.value)}
                  placeholder="Lost Reason"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Lost Message</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                  type="text"
                  className="outline-none w-full"
                  value={failedMessage} onChange={e => setFailedMessage(e.target.value)}
                  placeholder="Lost Message"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Date</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                  type="date"
                  className="outline-none w-full"
                  value={failedDate} onChange={e => setFailedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setShowNotQualifiedModal(false)} className="px-4 py-2 border border-gray-400 rounded cursor-pointer">Cancel</button>
              <button
                onClick={async () => {
                  if (!failedReason || !failedDate) {
                    toast.error("Please enter required fields.");
                    return;
                  }
                  try {
                    const updated = await updateLeadStatus(notQualifiedLead._id, {
                      status: "Lost",
                      failedReason,
                      failedMessage,
                      failedDate,
                    });
                    dispatch(updateLead({ id: notQualifiedLead._id, changes: updated }));
                    setShowNotQualifiedModal(false);
                    toast.success("Lead marked as Not Qualified.");
                  } catch (err) {
                    toast.error("Lost to update lead.");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete lead "{leadToDelete?.name}"? This
              will mark the lead as Deleted.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-60 cursor-pointer"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
