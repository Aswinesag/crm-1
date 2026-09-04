import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const QualityControl = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQC, setSelectedQC] = useState(null);

  const inspectionTests = [
    "Voltage Test",
    "Flow Rate Test",
    "Leakage Test",
    "Vibration Test",
    "Noise Test"
  ];

  const testResults = ["Pass", "Fail", "Rework"];

  // Sample QC data
  const [qcs, setQcs] = useState([
    {
      id: "QC-001",
      qcNumber: "QC-2024-001",
      productionOrderNo: "PO-2024-001",
      pumpModel: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      inspector: "Ramesh Kumar",
      inspectionDate: "2024-07-05",
      status: "Pass",
      remarks: "All tests passed successfully",
      checklist: [
        { test: "Voltage Test", result: "Pass" },
        { test: "Flow Rate Test", result: "Pass" },
        { test: "Leakage Test", result: "Pass" },
        { test: "Vibration Test", result: "Pass" },
        { test: "Noise Test", result: "Pass" }
      ]
    },
    {
      id: "QC-002",
      qcNumber: "QC-2024-002",
      productionOrderNo: "PO-2024-002",
      pumpModel: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      inspector: "Suresh Reddy",
      inspectionDate: "2024-07-20",
      status: "Rework",
      remarks: "Noise test failed, needs rework",
      checklist: [
        { test: "Voltage Test", result: "Pass" },
        { test: "Flow Rate Test", result: "Pass" },
        { test: "Leakage Test", result: "Pass" },
        { test: "Vibration Test", result: "Pass" },
        { test: "Noise Test", result: "Fail" }
      ]
    },
    {
      id: "QC-003",
      qcNumber: "QC-2024-003",
      productionOrderNo: "PO-2024-003",
      pumpModel: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      inspector: "Venkat Rao",
      inspectionDate: "2024-07-25",
      status: "Pending",
      remarks: "Inspection in progress",
      checklist: [
        { test: "Voltage Test", result: "Pass" },
        { test: "Flow Rate Test", result: "Pass" },
        { test: "Leakage Test", result: "Pass" },
        { test: "Vibration Test", result: "" },
        { test: "Noise Test", result: "" }
      ]
    },
    {
      id: "QC-004",
      qcNumber: "QC-2024-004",
      productionOrderNo: "PO-2024-004",
      pumpModel: "3 HP Industrial Pump",
      productCode: "PUMP-004",
      inspector: "David Wilson",
      inspectionDate: "2024-07-30",
      status: "Fail",
      remarks: "Multiple tests failed, rejected",
      checklist: [
        { test: "Voltage Test", result: "Fail" },
        { test: "Flow Rate Test", result: "Pass" },
        { test: "Leakage Test", result: "Fail" },
        { test: "Vibration Test", result: "Pass" },
        { test: "Noise Test", result: "Pass" }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    qcNumber: "",
    productionOrderNo: "",
    pumpModel: "",
    productCode: "",
    inspector: "",
    inspectionDate: "",
    status: "Pending",
    remarks: "",
    checklist: inspectionTests.map((test) => ({
      test,
      result: ""
    }))
  });

  const filteredQCs = qcs.filter((qc) => {
    const matchesSearch =
      qc.qcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qc.productionOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qc.pumpModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qc.inspector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? qc.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalQCs = qcs.length;
  const passedQCs = qcs.filter((q) => q.status === "Pass").length;
  const failedQCs = qcs.filter((q) => q.status === "Fail").length;
  const reworkQCs = qcs.filter((q) => q.status === "Rework").length;
  const pendingQCs = qcs.filter((q) => q.status === "Pending").length;

  const handleChecklistChange = (index, result) => {
    const newChecklist = [...formData.checklist];
    newChecklist[index] = { ...newChecklist[index], result };
    setFormData({ ...formData, checklist: newChecklist });
  };

  const calculateOverallStatus = (checklist) => {
    const hasFail = checklist.some((item) => item.result === "Fail");
    const hasEmpty = checklist.some((item) => !item.result);
    
    if (hasEmpty) return "Pending";
    if (hasFail) return "Fail";
    return "Pass";
  };

  const handleCreateQC = (e) => {
    e.preventDefault();
    const overallStatus = calculateOverallStatus(formData.checklist);
    const newQC = {
      ...formData,
      id: `QC-${String(qcs.length + 1).padStart(3, '0')}`,
      status: overallStatus
    };
    setQcs([...qcs, newQC]);
    setShowCreateModal(false);
    setFormData({
      qcNumber: "",
      productionOrderNo: "",
      pumpModel: "",
      productCode: "",
      inspector: "",
      inspectionDate: "",
      status: "Pending",
      remarks: "",
      checklist: inspectionTests.map((test) => ({
        test,
        result: ""
      }))
    });
    toast.success("Quality control record created successfully!");
  };

  const handleViewQC = (qc) => {
    setSelectedQC(qc);
    setShowViewModal(true);
  };

  const handleDeleteQC = (id) => {
    if (window.confirm("Are you sure you want to delete this QC record?")) {
      setQcs(qcs.filter((q) => q.id !== id));
      toast.success("QC record deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setQcs(qcs.map((q) => 
      q.id === id ? { ...q, status: newStatus } : q
    ));
    toast.success(`QC status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Quality Control </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total QC Records"
          count={totalQCs}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Passed"
          count={passedQCs}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Failed"
          count={failedQCs}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Rework"
          count={reworkQCs}
          bg="#FEF3C7"
          color="#D97706"
        />
        <Card
          title="Pending"
          count={pendingQCs}
          bg="#FAF5FF"
          color="#7E22CE"
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
            placeholder="Search QC records..."
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
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
            <option value="Rework">Rework</option>
            <option value="Pending">Pending</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create QC Record</button>
          </div>
        </div>
      </div>

      {/* QC Records Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                QC Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Production Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Pump Model
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Inspector
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Inspection Date
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
            {filteredQCs.length > 0 ? (
              filteredQCs.map((qc) => (
                <tr key={qc.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {qc.qcNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {qc.productionOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{qc.pumpModel}</p>
                      <p className="text-xs text-gray-500">{qc.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {qc.inspector}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {qc.inspectionDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={qc.status}
                      onChange={(e) => handleStatusChange(qc.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        qc.status === "Pass"
                          ? "bg-green-100 text-green-700"
                          : qc.status === "Fail"
                          ? "bg-red-100 text-red-700"
                          : qc.status === "Rework"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="Rework">Rework</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewQC(qc)}
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
                        onClick={() => handleDeleteQC(qc.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={7}
                >
                  No QC Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create QC Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Quality Control Record</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQC}>
              {/* QC Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">QC Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">QC Number</label>
                    <input
                      type="text"
                      name="qcNumber"
                      value={formData.qcNumber}
                      onChange={(e) => setFormData({ ...formData, qcNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="QC-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Production Order No</label>
                    <input
                      type="text"
                      name="productionOrderNo"
                      value={formData.productionOrderNo}
                      onChange={(e) => setFormData({ ...formData, productionOrderNo: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="PO-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Inspection Date</label>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
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
                    <label className="block mb-1 font-medium text-sm">Pump Model</label>
                    <input
                      type="text"
                      name="pumpModel"
                      value={formData.pumpModel}
                      onChange={(e) => setFormData({ ...formData, pumpModel: e.target.value })}
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
                    <label className="block mb-1 font-medium text-sm">Inspector</label>
                    <input
                      type="text"
                      name="inspector"
                      value={formData.inspector}
                      onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter inspector name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Inspection Checklist */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Inspection Checklist</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Test</th>
                        <th className="p-2 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.checklist.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{item.test}</td>
                          <td className="p-2">
                            <select
                              value={item.result}
                              onChange={(e) => handleChecklistChange(index, e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="">Select Result</option>
                              {testResults.map((result) => (
                                <option key={result} value={result}>{result}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  Create QC Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View QC Record Modal */}
      {showViewModal && selectedQC && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quality Control Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* QC Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">QC Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">QC Number</p>
                    <p className="font-medium">{selectedQC.qcNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Production Order No</p>
                    <p className="font-medium">{selectedQC.productionOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Inspection Date</p>
                    <p className="font-medium">{selectedQC.inspectionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedQC.status === "Pass"
                        ? "bg-green-100 text-green-700"
                        : selectedQC.status === "Fail"
                        ? "bg-red-100 text-red-700"
                        : selectedQC.status === "Rework"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {selectedQC.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Pump Model</p>
                    <p className="font-medium">{selectedQC.pumpModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedQC.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Inspector</p>
                    <p className="font-medium">{selectedQC.inspector}</p>
                  </div>
                </div>
              </div>

              {/* Inspection Checklist */}
              <div>
                <h3 className="font-semibold mb-3">Inspection Checklist</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Test</th>
                        <th className="p-2 text-left">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQC.checklist.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{item.test}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.result === "Pass"
                                ? "bg-green-100 text-green-700"
                                : item.result === "Fail"
                                ? "bg-red-100 text-red-700"
                                : item.result === "Rework"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {item.result || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedQC.remarks || '-'}</p>
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
                  Print QC Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityControl;
