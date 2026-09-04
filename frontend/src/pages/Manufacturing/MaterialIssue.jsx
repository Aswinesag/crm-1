import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const MaterialIssue = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Sample material issue data
  const [issues, setIssues] = useState([
    {
      id: "MI-001",
      issueNumber: "MI-2024-001",
      productionOrderNo: "PO-2024-001",
      issueDate: "2024-07-01",
      warehouse: "Main Warehouse",
      status: "Completed",
      remarks: "Full material issue",
      materials: [
        {
          id: "MAT-001",
          material: "Cast Iron Body",
          materialCode: "MAT-001",
          requiredQty: 100,
          issuedQty: 100,
          unit: "Nos"
        },
        {
          id: "MAT-002",
          material: "Impeller",
          materialCode: "MAT-002",
          requiredQty: 100,
          issuedQty: 100,
          unit: "Nos"
        },
        {
          id: "MAT-003",
          material: "Copper Wire",
          materialCode: "MAT-003",
          requiredQty: 200,
          issuedQty: 200,
          unit: "Kg"
        }
      ]
    },
    {
      id: "MI-002",
      issueNumber: "MI-2024-002",
      productionOrderNo: "PO-2024-002",
      issueDate: "2024-07-15",
      warehouse: "Main Warehouse",
      status: "Partial",
      remarks: "Partial material issue",
      materials: [
        {
          id: "MAT-006",
          material: "Cast Iron Body",
          materialCode: "MAT-006",
          requiredQty: 50,
          issuedQty: 50,
          unit: "Nos"
        },
        {
          id: "MAT-007",
          material: "Impeller",
          materialCode: "MAT-007",
          requiredQty: 50,
          issuedQty: 25,
          unit: "Nos"
        }
      ]
    },
    {
      id: "MI-003",
      issueNumber: "MI-2024-003",
      productionOrderNo: "PO-2024-003",
      issueDate: "2024-07-20",
      warehouse: "Secondary Warehouse",
      status: "Pending",
      remarks: "Awaiting stock",
      materials: [
        {
          id: "MAT-011",
          material: "Stainless Steel Body",
          materialCode: "MAT-011",
          requiredQty: 200,
          issuedQty: 0,
          unit: "Nos"
        }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    issueNumber: "",
    productionOrderNo: "",
    issueDate: "",
    warehouse: "",
    status: "Pending",
    remarks: "",
    materials: [
      {
        material: "",
        materialCode: "",
        requiredQty: 0,
        issuedQty: 0,
        unit: "Nos"
      }
    ]
  });

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.issueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.productionOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? issue.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalIssues = issues.length;
  const completedIssues = issues.filter((i) => i.status === "Completed").length;
  const partialIssues = issues.filter((i) => i.status === "Partial").length;
  const pendingIssues = issues.filter((i) => i.status === "Pending").length;
  const totalMaterials = issues.reduce((sum, issue) => sum + issue.materials.length, 0);

  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      materials: [
        ...formData.materials,
        {
          material: "",
          materialCode: "",
          requiredQty: 0,
          issuedQty: 0,
          unit: "Nos"
        }
      ]
    });
  };

  const handleRemoveMaterial = (index) => {
    if (formData.materials.length > 1) {
      const newMaterials = formData.materials.filter((_, i) => i !== index);
      setFormData({ ...formData, materials: newMaterials });
    } else {
      toast.error("At least one material is required");
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...formData.materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setFormData({ ...formData, materials: newMaterials });
  };

  const handleCreateIssue = (e) => {
    e.preventDefault();
    const newIssue = {
      ...formData,
      id: `MI-${String(issues.length + 1).padStart(3, '0')}`
    };
    setIssues([...issues, newIssue]);
    setShowCreateModal(false);
    setFormData({
      issueNumber: "",
      productionOrderNo: "",
      issueDate: "",
      warehouse: "",
      status: "Pending",
      remarks: "",
      materials: [
        {
          material: "",
          materialCode: "",
          requiredQty: 0,
          issuedQty: 0,
          unit: "Nos"
        }
      ]
    });
    toast.success("Material issue created successfully!");
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowViewModal(true);
  };

  const handleDeleteIssue = (id) => {
    if (window.confirm("Are you sure you want to delete this material issue?")) {
      setIssues(issues.filter((i) => i.id !== id));
      toast.success("Material issue deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setIssues(issues.map((i) => 
      i.id === id ? { ...i, status: newStatus } : i
    ));
    toast.success(`Issue status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Material Issue </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Issues"
          count={totalIssues}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Completed"
          count={completedIssues}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Partial"
          count={partialIssues}
          bg="#FEF3C7"
          color="#D97706"
        />
        <Card
          title="Pending"
          count={pendingIssues}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Total Materials"
          count={totalMaterials}
          bg="#EAF1FA"
          color="#1C4CD2"
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
            placeholder="Search material issues..."
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
            <option value="Partial">Partial</option>
            <option value="Completed">Completed</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Issue</button>
          </div>
        </div>
      </div>

      {/* Material Issues Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Issue Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Production Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Warehouse
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Issue Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Materials
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
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {issue.issueNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {issue.productionOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {issue.warehouse}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {issue.issueDate}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {issue.materials.length}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        issue.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : issue.status === "Partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewIssue(issue)}
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
                        onClick={() => handleDeleteIssue(issue.id)}
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
                  No Material Issue Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Material Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Material Issue</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue}>
              {/* Issue Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Issue Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Issue Number</label>
                    <input
                      type="text"
                      name="issueNumber"
                      value={formData.issueNumber}
                      onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="MI-2024-001"
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
                    <label className="block mb-1 font-medium text-sm">Issue Date</label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Warehouse</label>
                    <input
                      type="text"
                      name="warehouse"
                      value={formData.warehouse}
                      onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Main Warehouse"
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
                      <option value="Partial">Partial</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Materials</h3>
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer text-sm"
                  >
                    <FiPlus />
                    Add Material
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Material</th>
                        <th className="p-2 text-left">Material Code</th>
                        <th className="p-2 text-right">Required Qty</th>
                        <th className="p-2 text-right">Issued Qty</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.materials.map((material, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <input
                              type="text"
                              value={material.material}
                              onChange={(e) => handleMaterialChange(index, 'material', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Copper Wire"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={material.materialCode}
                              onChange={(e) => handleMaterialChange(index, 'materialCode', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="MAT-001"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={material.requiredQty}
                              onChange={(e) => handleMaterialChange(index, 'requiredQty', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={material.issuedQty}
                              onChange={(e) => handleMaterialChange(index, 'issuedQty', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={material.unit}
                              onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="Nos">Nos</option>
                              <option value="Kg">Kg</option>
                              <option value="Ltr">Ltr</option>
                              <option value="Mtr">Mtr</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
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
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Material Issue Modal */}
      {showViewModal && selectedIssue && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Material Issue Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Issue Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Issue Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Issue Number</p>
                    <p className="font-medium">{selectedIssue.issueNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Production Order No</p>
                    <p className="font-medium">{selectedIssue.productionOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="font-medium">{selectedIssue.warehouse}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">{selectedIssue.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedIssue.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedIssue.status === "Partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {selectedIssue.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h3 className="font-semibold mb-3">Materials</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Material</th>
                        <th className="p-2 text-left">Material Code</th>
                        <th className="p-2 text-right">Required Qty</th>
                        <th className="p-2 text-right">Issued Qty</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIssue.materials.map((material, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{material.material}</td>
                          <td className="p-2">{material.materialCode}</td>
                          <td className="p-2 text-right">{material.requiredQty}</td>
                          <td className="p-2 text-right">{material.issuedQty}</td>
                          <td className="p-2">{material.unit}</td>
                          <td className="p-2 text-right font-medium">
                            {material.requiredQty - material.issuedQty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedIssue.remarks || '-'}</p>
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
                  Print Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssue;
