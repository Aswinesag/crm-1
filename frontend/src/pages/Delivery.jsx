import React, { useState } from "react";
import "../css/scrollbar.css";
import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { RiTruckLine } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateLead } from "../redux/leadSlice.jsx";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { updateLeadStatus } from "../api/fetchdata.jsx";
import { FiEye, FiTrash2 } from "react-icons/fi";

const Delivery = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const leads = useSelector((state) => state.leads.leads);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Only Converted Leads
  const deliveryLeads = leads.filter(
    (lead) => lead.status === "Converted"
  );

  // ✅ Search
  const filteredLeads = deliveryLeads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.company.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

  const paginatedLeads = filteredLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // ✅ Delivery Status Change
  const handleChange = (lead) => async (e) => {
    try {
      const newStatus = e.target.value;

      const updated = await updateLeadStatus(lead._id, {
        deliveryStatus: newStatus,
      });

      dispatch(
        updateLead({
          id: lead._id,
          changes: { deliveryStatus: updated.deliveryStatus },
        })
      );

      toast.success("Delivery status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update delivery status");
    }
  };

  return (
    <div className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]">Delivery</span>
      </div>

      {/* Header */}
      <div className="mt-4">
        <div className="flex gap-4 items-center">
          <RiTruckLine
            size={40}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />
          <p className="text-2xl font-extrabold text-gray-700">
            Delivery Management
          </p>
        </div>

        <p className="text-gray-600 mt-2">
          Manage dispatch and delivery status
        </p>

        {/* Search */}
        <div className="mt-3 max-w-md relative">
          <IoIosSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search deliveries..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-auto mt-6 rounded-t-md border-b border-gray-300 shadow-md">
          <table className="w-full bg-white text-sm text-left border-separate border-spacing-0">
            <thead className="bg-white text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 border-b border-gray-300">Name</th>
                <th className="p-3 border-b border-gray-300">Company</th>
                <th className="p-3 border-b border-gray-300">Phone</th>
                <th className="p-3 border-b border-gray-300">Product</th>
                <th className="p-3 border-b border-gray-300">Serial No</th>
                <th className="p-3 border-b border-gray-300">Qty</th>
                <th className="p-3 border-b border-gray-300">Invoice</th>
                <th className="p-3 border-b border-gray-300">Dispatch No</th>
                <th className="p-3 border-b border-gray-300">Status</th>
                <th className="p-3 border-b border-gray-300">Date</th>
                <th className="p-3 border-b border-gray-300">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => {
                  const product = lead.products?.[0];

                  return (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-300 text-blue-600">
                        <Link to={`/view/delivery/${lead._id}`}>
                          {lead.name}
                        </Link>
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {lead.company}
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {lead.phone}
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {product?.productName || "N/A"}
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {product?.serialNumbers || "N/A"}
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {product?.qty || "N/A"}
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {product?.invoiceNo || "N/A"}
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {lead.dispatchNo || "Not Added"}
                      </td>

                      {/* STATUS */}
                      <td className="p-3 border-b border-gray-300">
                        <select
                          value={lead.deliveryStatus || "Pending"}
                          onChange={handleChange(lead)}
                          className="bg-green-100 border px-2 py-1 rounded"
                        >
                          {["Pending", "Packed", "Shipped", "Delivered"].map(
                            (s) => (
                              <option key={s}>{s}</option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="p-3 border-b border-gray-300">
                        {lead.createdAt?.split("T")[0]}
                      </td>

                      {/* ACTION */}
                     {/* ACTION */}
                   {/* Actions */}
                   <td className="p-3 border-b border-gray-300 text-center">
  <div className="flex justify-center gap-3 text-lg">

    <button
      className="text-blue-500 hover:text-blue-700 transition"
      onClick={() => navigate(`/view/delivery/${lead._id}`)}
    >
      <FaEye />
    </button>

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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="text-center p-4">
                    No Deliveries Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center p-3 gap-3 bg-white rounded-b-md shadow-md border-gray-300">
          <div className="flex gap-2 items-center">
            <p>Rows per page:</p>
            <select
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
              className="border px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;