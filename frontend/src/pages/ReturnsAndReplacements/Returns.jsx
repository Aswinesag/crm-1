import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const Returns = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const returnReasons = [
    "Damaged Product",
    "Wrong Product",
    "Transport Damage",
    "Manufacturing Defect"
  ];

  // Sample return data
  const [returns, setReturns] = useState([
    {
      id: "RET-001",
      returnNumber: "RET-2024-001",
      customerName: "ABC Corporation",
      customerCode: "CUST-001",
      invoiceNumber: "INV-2024-001",
      invoiceDate: "2024-01-10",
      productCode: "PROD-001",
      productName: "Industrial Pump",
      quantity: 5,
      unit: "Nos",
      returnReason: "Damaged Product",
      returnDate: "2024-01-15",
      returnStatus: "Approved",
      remarks: "Product arrived with cracks",
      contactPerson: "John Doe",
      contactNumber: "9876543210"
    },
    {
      id: "RET-002",
      returnNumber: "RET-2024-002",
      customerName: "XYZ Industries",
      customerCode: "CUST-002",
      invoiceNumber: "INV-2024-002",
      invoiceDate: "2024-01-12",
      productCode: "PROD-002",
      productName: "Motor Assembly",
      quantity: 3,
      unit: "Nos",
      returnReason: "Wrong Product",
      returnDate: "2024-01-18",
      returnStatus: "Pending",
      remarks: "Different model received",
      contactPerson: "Jane Smith",
      contactNumber: "8765432109"
    },
    {
      id: "RET-003",
      returnNumber: "RET-2024-003",
      customerName: "Global Tech Solutions",
      customerCode: "CUST-003",
      invoiceNumber: "INV-2024-003",
      invoiceDate: "2024-01-18",
      productCode: "PROD-003",
      productName: "Control Panel",
      quantity: 2,
      unit: "Nos",
      returnReason: "Transport Damage",
      returnDate: "2024-01-22",
      returnStatus: "Rejected",
      remarks: "Damage occurred during customer handling",
      contactPerson: "Mike Johnson",
      contactNumber: "7654321098"
    },
    {
      id: "RET-004",
      returnNumber: "RET-2024-004",
      customerName: "Tech Supplies Ltd",
      customerCode: "CUST-004",
      invoiceNumber: "INV-2024-004",
      invoiceDate: "2024-01-20",
      productCode: "PROD-004",
      productName: "Sensors Kit",
      quantity: 10,
      unit: "Nos",
      returnReason: "Manufacturing Defect",
      returnDate: "2024-01-25",
      returnStatus: "Pending",
      remarks: "Sensors not functioning properly",
      contactPerson: "David Wilson",
      contactNumber: "6543210987"
    }
  ]);

  const [formData, setFormData] = useState({
    returnNumber: "",
    customerName: "",
    customerCode: "",
    invoiceNumber: "",
    invoiceDate: "",
    productCode: "",
    productName: "",
    quantity: 0,
    unit: "Nos",
    returnReason: "Damaged Product",
    returnDate: "",
    remarks: "",
    contactPerson: "",
    contactNumber: ""
  });

  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      ret.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? ret.returnStatus === statusFilter : true;
    const matchesReason = reasonFilter ? ret.returnReason === reasonFilter : true;
    return matchesSearch && matchesStatus && matchesReason;
  });

  const totalReturns = returns.length;
  const approvedReturns = returns.filter((r) => r.returnStatus === "Approved").length;
  const pendingReturns = returns.filter((r) => r.returnStatus === "Pending").length;
  const rejectedReturns = returns.filter((r) => r.returnStatus === "Rejected").length;
  const totalQuantity = returns.reduce((sum, r) => sum + r.quantity, 0);

  const handleCreateReturn = (e) => {
    e.preventDefault();
    const newReturn = {
      ...formData,
      id: `RET-${String(returns.length + 1).padStart(3, '0')}`,
      returnStatus: "Pending"
    };
    setReturns([...returns, newReturn]);
    setShowCreateModal(false);
    setFormData({
      returnNumber: "",
      customerName: "",
      customerCode: "",
      invoiceNumber: "",
      invoiceDate: "",
      productCode: "",
      productName: "",
      quantity: 0,
      unit: "Nos",
      returnReason: "Damaged Product",
      returnDate: "",
      remarks: "",
      contactPerson: "",
      contactNumber: ""
    });
    toast.success("Return request created successfully!");
  };

  const handleViewReturn = (ret) => {
    setSelectedReturn(ret);
    setShowViewModal(true);
  };

  const handleDeleteReturn = (id) => {
    if (window.confirm("Are you sure you want to delete this return request?")) {
      setReturns(returns.filter((r) => r.id !== id));
      toast.success("Return request deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setReturns(returns.map((r) => 
      r.id === id ? { ...r, returnStatus: newStatus } : r
    ));
    toast.success(`Return status updated to ${newStatus}`);
  };

  return (
    <div className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Returns & Replacements </span> /{" "}
        <span className="text-[#C2410C]"> Returns </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Returns"
          count={totalReturns}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Approved"
          count={approvedReturns}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingReturns}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Rejected"
          count={rejectedReturns}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Quantity"
          count={totalQuantity}
          bg="#ECFDF5"
          color="#059669"
        />
      </div>

      {/* Search + Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-6 mt-6">
        <div className="relative w-full max-w-md cursor-pointer">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search returns..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-col xl:flex-row items-center">
          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="">All Reasons</option>
            {returnReasons.map((reason) => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Return</button>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Return No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Invoice No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Quantity
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Return Reason
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Return Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Status
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {ret.returnNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{ret.customerName}</p>
                      <p className="text-xs text-gray-500">{ret.customerCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {ret.invoiceNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{ret.productName}</p>
                      <p className="text-xs text-gray-500">{ret.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {ret.quantity} {ret.unit}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className={`px-2 py-1 rounded text-xs ${
                      ret.returnReason === "Damaged Product" ? "bg-red-100 text-red-700" :
                      ret.returnReason === "Wrong Product" ? "bg-orange-100 text-orange-700" :
                      ret.returnReason === "Transport Damage" ? "bg-yellow-100 text-yellow-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {ret.returnReason}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {ret.returnDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={ret.returnStatus}
                      onChange={(e) => handleStatusChange(ret.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        ret.returnStatus === "Approved"
                          ? "bg-green-100 text-green-700"
                          : ret.returnStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewReturn(ret)}
                      />
                      <FiEdit
                        className="text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Edit functionality coming soon")}
                      />
                      <FiPrinter
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Print functionality coming soon")}
                      />
                      <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeleteReturn(ret.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={9}
                >
                  No Return Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Return Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Return Request</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn}>
              {/* Return Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Return Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Return Number</label>
                    <input
                      type="text"
                      name="returnNumber"
                      value={formData.returnNumber}
                      onChange={(e) => setFormData({ ...formData, returnNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="RET-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Return Date</label>
                    <input
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Return Reason</label>
                    <select
                      name="returnReason"
                      value={formData.returnReason}
                      onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      {returnReasons.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Customer Code</label>
                    <input
                      type="text"
                      name="customerCode"
                      value={formData.customerCode}
                      onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="CUST-001"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter contact person"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Contact Number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Invoice Number</label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="INV-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Invoice Date</label>
                    <input
                      type="date"
                      name="invoiceDate"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Product Code</label>
                    <input
                      type="text"
                      name="productCode"
                      value={formData.productCode}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="PROD-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Product Name</label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      <option value="Nos">Nos</option>
                      <option value="Kg">Kg</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Mtr">Mtr</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  rows="3"
                  placeholder="Enter any additional remarks"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Create Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Return Modal */}
      {showViewModal && selectedReturn && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Return Request Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Return Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Return Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Return Number</p>
                    <p className="font-medium">{selectedReturn.returnNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return Date</p>
                    <p className="font-medium">{selectedReturn.returnDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return Reason</p>
                    <p className="font-medium">{selectedReturn.returnReason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReturn.returnStatus === "Approved"
                        ? "bg-green-100 text-green-700"
                        : selectedReturn.returnStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedReturn.returnStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{selectedReturn.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-medium">{selectedReturn.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{selectedReturn.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedReturn.contactNumber}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Invoice Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium">{selectedReturn.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Date</p>
                    <p className="font-medium">{selectedReturn.invoiceDate}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedReturn.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Name</p>
                    <p className="font-medium">{selectedReturn.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-bold text-lg">{selectedReturn.quantity} {selectedReturn.unit}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedReturn.remarks || '-'}</p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => toast.info("Print functionality coming soon")}
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Print Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
