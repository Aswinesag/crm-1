import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const GSTManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [gstTypeFilter, setGstTypeFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGst, setSelectedGst] = useState(null);

  // Sample GST configuration data
  const [gstConfigs, setGstConfigs] = useState([
    {
      id: "GST-001",
      gstType: "CGST",
      rate: 9,
      description: "Central Goods and Services Tax",
      effectiveFrom: "2024-01-01",
      status: "Active"
    },
    {
      id: "GST-002",
      gstType: "SGST",
      rate: 9,
      description: "State Goods and Services Tax",
      effectiveFrom: "2024-01-01",
      status: "Active"
    },
    {
      id: "GST-003",
      gstType: "IGST",
      rate: 18,
      description: "Integrated Goods and Services Tax",
      effectiveFrom: "2024-01-01",
      status: "Active"
    },
    {
      id: "GST-004",
      gstType: "CGST",
      rate: 2.5,
      description: "Central GST for essential goods",
      effectiveFrom: "2024-01-01",
      status: "Active"
    },
    {
      id: "GST-005",
      gstType: "SGST",
      rate: 2.5,
      description: "State GST for essential goods",
      effectiveFrom: "2024-01-01",
      status: "Active"
    },
    {
      id: "GST-006",
      gstType: "IGST",
      rate: 5,
      description: "Integrated GST for essential goods",
      effectiveFrom: "2024-01-01",
      status: "Active"
    }
  ]);

  // Sample GST returns data
  const [gstReturns, setGstReturns] = useState([
    {
      id: "RET-001",
      returnPeriod: "January 2024",
      returnType: "GSTR-1",
      filingDate: "2024-02-11",
      status: "Filed",
      totalTax: 45000,
      totalIgst: 0,
      totalCgst: 22500,
      totalSgst: 22500
    },
    {
      id: "RET-002",
      returnPeriod: "February 2024",
      returnType: "GSTR-1",
      filingDate: "2024-03-11",
      status: "Pending",
      totalTax: 52000,
      totalIgst: 0,
      totalCgst: 26000,
      totalSgst: 26000
    },
    {
      id: "RET-003",
      returnPeriod: "January 2024",
      returnType: "GSTR-3B",
      filingDate: "2024-02-20",
      status: "Filed",
      totalTax: 45000,
      totalIgst: 0,
      totalCgst: 22500,
      totalSgst: 22500
    }
  ]);

  const [formData, setFormData] = useState({
    gstType: "CGST",
    rate: 0,
    description: "",
    effectiveFrom: ""
  });

  const [activeTab, setActiveTab] = useState("config");

  const filteredGstConfigs = gstConfigs.filter((config) => {
    const matchesSearch =
      config.gstType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = gstTypeFilter ? config.gstType === gstTypeFilter : true;
    return matchesSearch && matchesType;
  });

  const totalConfigs = gstConfigs.length;
  const activeConfigs = gstConfigs.filter((c) => c.status === "Active").length;
  const totalReturns = gstReturns.length;
  const filedReturns = gstReturns.filter((r) => r.status === "Filed").length;
  const pendingReturns = gstReturns.filter((r) => r.status === "Pending").length;

  const handleCreateGstConfig = (e) => {
    e.preventDefault();
    const newConfig = {
      ...formData,
      id: `GST-${String(gstConfigs.length + 1).padStart(3, '0')}`,
      status: "Active"
    };
    setGstConfigs([...gstConfigs, newConfig]);
    setShowCreateModal(false);
    setFormData({
      gstType: "CGST",
      rate: 0,
      description: "",
      effectiveFrom: ""
    });
    toast.success("GST configuration added successfully!");
  };

  const handleViewGst = (gst) => {
    setSelectedGst(gst);
    setShowViewModal(true);
  };

  const handleDeleteGst = (id) => {
    if (window.confirm("Are you sure you want to delete this GST configuration?")) {
      setGstConfigs(gstConfigs.filter((g) => g.id !== id));
      toast.success("GST configuration deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setGstConfigs(gstConfigs.map((g) => 
      g.id === id ? { ...g, status: newStatus } : g
    ));
    toast.success(`GST status updated to ${newStatus}`);
  };

  return (
    <div className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Billing & Finance </span> /{" "}
        <span className="text-[#C2410C]"> GST Management </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="GST Configs"
          count={totalConfigs}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Active"
          count={activeConfigs}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Total Returns"
          count={totalReturns}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Filed"
          count={filedReturns}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Pending"
          count={pendingReturns}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mt-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === "config" ? "text-[#FB6514] border-b-2 border-[#FB6514]" : "text-gray-500"}`}
          onClick={() => setActiveTab("config")}
        >
          GST Configuration
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === "returns" ? "text-[#FB6514] border-b-2 border-[#FB6514]" : "text-gray-500"}`}
          onClick={() => setActiveTab("returns")}
        >
          GST Returns
        </button>
      </div>

      {/* GST Configuration Tab */}
      {activeTab === "config" && (
        <>
          {/* Search + Filter Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-6 mt-6">
            <div className="relative w-full max-w-md cursor-pointer">
              <IoIosSearch
                size={22}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search GST configs..."
                className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-col xl:flex-row items-center">
              <select
                className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
                value={gstTypeFilter}
                onChange={(e) => setGstTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="IGST">IGST</option>
              </select>

              <div
                className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
                onClick={() => setShowCreateModal(true)}
              >
                <FiPlus />
                <button className="cursor-pointer">Add GST Config</button>
              </div>
            </div>
          </div>

          {/* GST Config Table */}
          <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
            <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
              <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
                <tr>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                    GST Type
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    Rate (%)
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    Description
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    Effective From
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
                {filteredGstConfigs.length > 0 ? (
                  filteredGstConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50 bg-white">
                      <td className="p-3 border-b border-gray-300 font-medium text-blue-700">
                        {config.gstType}
                      </td>
                      <td className="p-3 border-b border-gray-300 font-medium">
                        {config.rate}%
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        {config.description}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        {config.effectiveFrom}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        <select
                          value={config.status}
                          onChange={(e) => handleStatusChange(config.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                            config.status === "Active"
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
                            onClick={() => handleViewGst(config)}
                          />
                          <FiEdit
                            className="text-green-500 cursor-pointer hover:scale-110 transition"
                            onClick={() => toast.info("Edit functionality coming soon")}
                          />
                          <FiTrash2
                            className="text-red-500 cursor-pointer hover:scale-110 transition"
                            onClick={() => handleDeleteGst(config.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                      colSpan={6}
                    >
                      No GST Configuration Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* GST Returns Tab */}
      {activeTab === "returns" && (
        <div className="mt-6">
          <div className="overflow-x-auto w-auto rounded-t-md border-b border-gray-300 shadow-md">
            <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
              <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
                <tr>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                    Return Period
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    Return Type
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    Filing Date
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    Total Tax
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    CGST
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    SGST
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start">
                    IGST
                  </th>
                  <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {gstReturns.length > 0 ? (
                  gstReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-gray-50 bg-white">
                      <td className="p-3 border-b border-gray-300 font-medium text-blue-700">
                        {ret.returnPeriod}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {ret.returnType}
                        </span>
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        {ret.filingDate}
                      </td>
                      <td className="p-3 border-b border-gray-300 font-medium">
                        ₹{ret.totalTax.toLocaleString()}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        ₹{ret.totalCgst.toLocaleString()}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        ₹{ret.totalSgst.toLocaleString()}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        ₹{ret.totalIgst.toLocaleString()}
                      </td>
                      <td className="p-3 border-b border-gray-300">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ret.status === "Filed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ret.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                      colSpan={8}
                    >
                      No GST Return Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create GST Config Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add GST Configuration</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGstConfig}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">GST Type</label>
                  <select
                    name="gstType"
                    value={formData.gstType}
                    onChange={(e) => setFormData({ ...formData, gstType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  >
                    <option value="CGST">CGST</option>
                    <option value="SGST">SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Rate (%)</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="0.00"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  rows="3"
                  placeholder="Enter GST description"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Effective From</label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  required
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
                  Add Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View GST Config Modal */}
      {showViewModal && selectedGst && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">GST Configuration Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">GST Type</p>
                  <p className="font-medium">{selectedGst.gstType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rate</p>
                  <p className="font-medium text-lg">{selectedGst.rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Effective From</p>
                  <p className="font-medium">{selectedGst.effectiveFrom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedGst.status}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-800">{selectedGst.description}</p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTManagement;
