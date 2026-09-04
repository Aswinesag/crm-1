import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const AssemblyProcess = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const stages = ["Body Assembly", "Motor Winding", "Impeller Fitting", "Testing", "Packing"];

  // Sample assembly process data
  const [processes, setProcesses] = useState([
    {
      id: "ASP-001",
      assemblyNumber: "ASP-2024-001",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      stage: "Body Assembly",
      operator: "Ramesh Kumar",
      startTime: "2024-07-01T09:00",
      endTime: "2024-07-01T11:30",
      status: "Completed",
      remarks: "Body assembly completed successfully"
    },
    {
      id: "ASP-002",
      assemblyNumber: "ASP-2024-002",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      stage: "Motor Winding",
      operator: "Suresh Reddy",
      startTime: "2024-07-01T12:00",
      endTime: "2024-07-01T15:00",
      status: "Completed",
      remarks: "Motor winding completed"
    },
    {
      id: "ASP-003",
      assemblyNumber: "ASP-2024-003",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      stage: "Impeller Fitting",
      operator: "Venkat Rao",
      startTime: "2024-07-02T09:00",
      endTime: "",
      status: "In Progress",
      remarks: "Currently in progress"
    },
    {
      id: "ASP-004",
      assemblyNumber: "ASP-2024-004",
      product: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      stage: "Testing",
      operator: "David Wilson",
      startTime: "2024-07-15T10:00",
      endTime: "",
      status: "Pending",
      remarks: "Awaiting previous stage completion"
    },
    {
      id: "ASP-005",
      assemblyNumber: "ASP-2024-005",
      product: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      stage: "Packing",
      operator: "Sarah Johnson",
      startTime: "2024-07-20T14:00",
      endTime: "2024-07-20T16:00",
      status: "Completed",
      remarks: "Packing completed for delivery"
    }
  ]);

  const [formData, setFormData] = useState({
    assemblyNumber: "",
    product: "",
    productCode: "",
    stage: "Body Assembly",
    operator: "",
    startTime: "",
    endTime: "",
    status: "Pending",
    remarks: ""
  });

  const filteredProcesses = processes.filter((process) => {
    const matchesSearch =
      process.assemblyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      process.operator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? process.status === statusFilter : true;
    const matchesStage = stageFilter ? process.stage === stageFilter : true;
    return matchesSearch && matchesStatus && matchesStage;
  });

  const totalProcesses = processes.length;
  const pendingProcesses = processes.filter((p) => p.status === "Pending").length;
  const inProgressProcesses = processes.filter((p) => p.status === "In Progress").length;
  const completedProcesses = processes.filter((p) => p.status === "Completed").length;

  const handleCreateProcess = (e) => {
    e.preventDefault();
    const newProcess = {
      ...formData,
      id: `ASP-${String(processes.length + 1).padStart(3, '0')}`
    };
    setProcesses([...processes, newProcess]);
    setShowCreateModal(false);
    setFormData({
      assemblyNumber: "",
      product: "",
      productCode: "",
      stage: "Body Assembly",
      operator: "",
      startTime: "",
      endTime: "",
      status: "Pending",
      remarks: ""
    });
    toast.success("Assembly process created successfully!");
  };

  const handleViewProcess = (process) => {
    setSelectedProcess(process);
    setShowViewModal(true);
  };

  const handleDeleteProcess = (id) => {
    if (window.confirm("Are you sure you want to delete this assembly process?")) {
      setProcesses(processes.filter((p) => p.id !== id));
      toast.success("Assembly process deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setProcesses(processes.map((p) => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    toast.success(`Process status updated to ${newStatus}`);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Manufacturing </span> /{" "}
        <span className="text-[#C2410C]"> Assembly Process </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Processes"
          count={totalProcesses}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Pending"
          count={pendingProcesses}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="In Progress"
          count={inProgressProcesses}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Completed"
          count={completedProcesses}
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
            placeholder="Search assembly processes..."
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
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Process</button>
          </div>
        </div>
      </div>

      {/* Assembly Processes Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Assembly Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Stage
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Operator
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Start Time
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                End Time
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
            {filteredProcesses.length > 0 ? (
              filteredProcesses.map((process) => (
                <tr key={process.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {process.assemblyNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{process.product}</p>
                      <p className="text-xs text-gray-500">{process.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {process.stage}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {process.operator}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {formatDateTime(process.startTime)}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {formatDateTime(process.endTime)}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={process.status}
                      onChange={(e) => handleStatusChange(process.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        process.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : process.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewProcess(process)}
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
                        onClick={() => handleDeleteProcess(process.id)}
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
                  No Assembly Process Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Assembly Process Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Assembly Process</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProcess}>
              {/* Process Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Process Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Assembly Number</label>
                    <input
                      type="text"
                      name="assemblyNumber"
                      value={formData.assemblyNumber}
                      onChange={(e) => setFormData({ ...formData, assemblyNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="ASP-2024-001"
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
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Product</label>
                    <input
                      type="text"
                      name="product"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="1 HP Centrifugal Pump"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Product Code</label>
                    <input
                      type="text"
                      name="productCode"
                      value={formData.productCode}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="PUMP-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Stage</label>
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      {stages.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Assignment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Operator</label>
                    <input
                      type="text"
                      name="operator"
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter operator name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Start Time</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">End Time</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
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
                  Create Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Assembly Process Modal */}
      {showViewModal && selectedProcess && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Assembly Process Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Process Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Process Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Assembly Number</p>
                    <p className="font-medium">{selectedProcess.assemblyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProcess.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedProcess.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {selectedProcess.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-medium">{selectedProcess.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedProcess.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stage</p>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {selectedProcess.stage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Assignment Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Operator</p>
                    <p className="font-medium">{selectedProcess.operator}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="font-medium">{formatDateTime(selectedProcess.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p className="font-medium">{formatDateTime(selectedProcess.endTime)}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedProcess.remarks || '-'}</p>
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
                  Print Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssemblyProcess;
