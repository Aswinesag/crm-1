import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const TransportersMaster = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransporter, setSelectedTransporter] = useState(null);

  // Sample transporter data
  const [transporters, setTransporters] = useState([
    {
      id: "TRANS-001",
      transporterName: "Fast Logistics",
      transporterCode: "TRANS-001",
      contactPerson: "Rajesh Kumar",
      contactNumber: "9876543210",
      email: "rajesh@fastlogistics.com",
      address: "123 Logistics Hub, Chennai - 600001",
      gstin: "29ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      serviceArea: "South India",
      vehicleCount: 15,
      status: "Active",
      remarks: "Premium logistics partner"
    },
    {
      id: "TRANS-002",
      transporterName: "Safe Transport",
      transporterCode: "TRANS-002",
      contactPerson: "Suresh Reddy",
      contactNumber: "8765432109",
      email: "suresh@safetransport.com",
      address: "456 Transport Zone, Coimbatore - 641001",
      gstin: "29FGHIJ5678K2L6",
      panNumber: "FGHIJ5678K",
      serviceArea: "All India",
      vehicleCount: 25,
      status: "Active",
      remarks: "Pan India service provider"
    },
    {
      id: "TRANS-003",
      transporterName: "Express Delivery",
      transporterCode: "TRANS-003",
      contactPerson: "Venkat Rao",
      contactNumber: "7654321098",
      email: "venkat@expressdelivery.com",
      address: "789 Express Lane, Bangalore - 560001",
      gstin: "29KLMNO3456M3N7",
      panNumber: "KLMNO3456M",
      serviceArea: "South India",
      vehicleCount: 10,
      status: "Active",
      remarks: "Express delivery specialist"
    },
    {
      id: "TRANS-004",
      transporterName: "National Carriers",
      transporterCode: "TRANS-004",
      contactPerson: "David Wilson",
      contactNumber: "6543210987",
      email: "david@nationalcarriers.com",
      address: "321 National Highway, Hyderabad - 500001",
      gstin: "29PQRST7890N4O8",
      panNumber: "PQRST7890N",
      serviceArea: "North India",
      vehicleCount: 20,
      status: "Inactive",
      remarks: "Contract under review"
    }
  ]);

  const [formData, setFormData] = useState({
    transporterName: "",
    transporterCode: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    address: "",
    gstin: "",
    panNumber: "",
    serviceArea: "",
    vehicleCount: 0,
    status: "Active",
    remarks: ""
  });

  const filteredTransporters = transporters.filter((transporter) => {
    const matchesSearch =
      transporter.transporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transporter.transporterCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transporter.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transporter.contactNumber.includes(searchQuery) ||
      transporter.gstin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? transporter.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalTransporters = transporters.length;
  const activeTransporters = transporters.filter((t) => t.status === "Active").length;
  const inactiveTransporters = transporters.filter((t) => t.status === "Inactive").length;
  const totalVehicles = transporters.reduce((sum, t) => sum + t.vehicleCount, 0);

  const handleCreateTransporter = (e) => {
    e.preventDefault();
    const newTransporter = {
      ...formData,
      id: `TRANS-${String(transporters.length + 1).padStart(3, '0')}`
    };
    setTransporters([...transporters, newTransporter]);
    setShowCreateModal(false);
    setFormData({
      transporterName: "",
      transporterCode: "",
      contactPerson: "",
      contactNumber: "",
      email: "",
      address: "",
      gstin: "",
      panNumber: "",
      serviceArea: "",
      vehicleCount: 0,
      status: "Active",
      remarks: ""
    });
    toast.success("Transporter added successfully!");
  };

  const handleViewTransporter = (transporter) => {
    setSelectedTransporter(transporter);
    setShowViewModal(true);
  };

  const handleDeleteTransporter = (id) => {
    if (window.confirm("Are you sure you want to delete this transporter?")) {
      setTransporters(transporters.filter((t) => t.id !== id));
      toast.success("Transporter deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTransporters(transporters.map((t) => 
      t.id === id ? { ...t, status: newStatus } : t
    ));
    toast.success(`Transporter status updated to ${newStatus}`);
  };

  return (
    <div className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Delivery & Dispatch </span> /{" "}
        <span className="text-[#C2410C]"> Transporters Master </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Transporters"
          count={totalTransporters}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Active"
          count={activeTransporters}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Inactive"
          count={inactiveTransporters}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Vehicles"
          count={totalVehicles}
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
            placeholder="Search transporters..."
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
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Add Transporter</button>
          </div>
        </div>
      </div>

      {/* Transporters Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Transporter Name
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Code
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Contact Person
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Contact Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Service Area
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Vehicles
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
            {filteredTransporters.length > 0 ? (
              filteredTransporters.map((transporter) => (
                <tr key={transporter.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {transporter.transporterName}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {transporter.transporterCode}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {transporter.contactPerson}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {transporter.contactNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {transporter.serviceArea}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {transporter.vehicleCount}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={transporter.status}
                      onChange={(e) => handleStatusChange(transporter.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        transporter.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewTransporter(transporter)}
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
                        onClick={() => handleDeleteTransporter(transporter.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={8}
                >
                  No Transporter Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Transporter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Transporter</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransporter}>
              {/* Transporter Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Transporter Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Transporter Name</label>
                    <input
                      type="text"
                      name="transporterName"
                      value={formData.transporterName}
                      onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter transporter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Transporter Code</label>
                    <input
                      type="text"
                      name="transporterCode"
                      value={formData.transporterCode}
                      onChange={(e) => setFormData({ ...formData, transporterCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="TRANS-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Service Area</label>
                    <input
                      type="text"
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="e.g., South India"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Vehicle Count</label>
                    <input
                      type="number"
                      name="vehicleCount"
                      value={formData.vehicleCount}
                      onChange={(e) => setFormData({ ...formData, vehicleCount: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter contact person"
                      required
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
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block mb-1 font-medium text-sm">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tax Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Tax Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">GSTIN</label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">PAN Number</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="ABCDE1234F"
                    />
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
                  Add Transporter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Transporter Modal */}
      {showViewModal && selectedTransporter && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Transporter Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Transporter Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Transporter Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transporter Name</p>
                    <p className="font-medium">{selectedTransporter.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transporter Code</p>
                    <p className="font-medium">{selectedTransporter.transporterCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Area</p>
                    <p className="font-medium">{selectedTransporter.serviceArea}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Count</p>
                    <p className="font-bold text-lg">{selectedTransporter.vehicleCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTransporter.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedTransporter.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{selectedTransporter.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedTransporter.contactNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedTransporter.email}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{selectedTransporter.address}</p>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Tax Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">GSTIN</p>
                    <p className="font-medium">{selectedTransporter.gstin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="font-medium">{selectedTransporter.panNumber}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedTransporter.remarks || '-'}</p>
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
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportersMaster;
