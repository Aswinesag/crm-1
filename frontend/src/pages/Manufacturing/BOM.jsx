import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const BOM = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState(null);

  // Sample BOM data
  const [boms, setBoms] = useState([
    {
      id: "BOM-001",
      bomNumber: "BOM-2024-001",
      pumpModel: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      revisionNumber: "1.0",
      effectiveDate: "2024-01-01",
      status: "Active",
      remarks: "Standard model",
      materials: [
        {
          id: "MAT-001",
          materialCode: "MAT-001",
          materialName: "Cast Iron Body",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 1500
        },
        {
          id: "MAT-002",
          materialCode: "MAT-002",
          materialName: "Impeller",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 800
        },
        {
          id: "MAT-003",
          materialCode: "MAT-003",
          materialName: "Copper Wire",
          requiredQuantity: 2,
          unit: "Kg",
          cost: 500
        },
        {
          id: "MAT-004",
          materialCode: "MAT-004",
          materialName: "Bearings",
          requiredQuantity: 2,
          unit: "Nos",
          cost: 400
        },
        {
          id: "MAT-005",
          materialCode: "MAT-005",
          materialName: "Mechanical Seal",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 300
        }
      ]
    },
    {
      id: "BOM-002",
      bomNumber: "BOM-2024-002",
      pumpModel: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      revisionNumber: "1.0",
      effectiveDate: "2024-01-15",
      status: "Active",
      remarks: "High capacity model",
      materials: [
        {
          id: "MAT-006",
          materialCode: "MAT-006",
          materialName: "Cast Iron Body",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 2000
        },
        {
          id: "MAT-007",
          materialCode: "MAT-007",
          materialName: "Impeller",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 1200
        },
        {
          id: "MAT-008",
          materialCode: "MAT-008",
          materialName: "Copper Wire",
          requiredQuantity: 3,
          unit: "Kg",
          cost: 750
        },
        {
          id: "MAT-009",
          materialCode: "MAT-009",
          materialName: "Bearings",
          requiredQuantity: 2,
          unit: "Nos",
          cost: 500
        },
        {
          id: "MAT-010",
          materialCode: "MAT-010",
          materialName: "Mechanical Seal",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 400
        }
      ]
    },
    {
      id: "BOM-003",
      bomNumber: "BOM-2024-003",
      pumpModel: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      revisionNumber: "2.0",
      effectiveDate: "2024-02-01",
      status: "Active",
      remarks: "Updated design",
      materials: [
        {
          id: "MAT-011",
          materialCode: "MAT-011",
          materialName: "Stainless Steel Body",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 1800
        },
        {
          id: "MAT-012",
          materialCode: "MAT-012",
          materialName: "Impeller",
          requiredQuantity: 1,
          unit: "Nos",
          cost: 600
        },
        {
          id: "MAT-013",
          materialCode: "MAT-013",
          materialName: "Copper Wire",
          requiredQuantity: 1.5,
          unit: "Kg",
          cost: 375
        },
        {
          id: "MAT-014",
          materialCode: "MAT-014",
          materialName: "Bearings",
          requiredQuantity: 2,
          unit: "Nos",
          cost: 350
        }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    bomNumber: "",
    pumpModel: "",
    productCode: "",
    revisionNumber: "",
    effectiveDate: "",
    status: "Active",
    remarks: "",
    materials: [
      {
        materialCode: "",
        materialName: "",
        requiredQuantity: 0,
        unit: "Nos",
        cost: 0
      }
    ]
  });

  const filteredBOMs = boms.filter((bom) => {
    const matchesSearch =
      bom.bomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.pumpModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? bom.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalBOMs = boms.length;
  const activeBOMs = boms.filter((b) => b.status === "Active").length;
  const inactiveBOMs = boms.filter((b) => b.status === "Inactive").length;
  const totalMaterials = boms.reduce((sum, bom) => sum + bom.materials.length, 0);

  const calculateTotalCost = (materials) => {
    return materials.reduce((sum, mat) => sum + (mat.requiredQuantity * mat.cost), 0);
  };

  const handleAddMaterial = () => {
    setFormData({
      ...formData,
      materials: [
        ...formData.materials,
        {
          materialCode: "",
          materialName: "",
          requiredQuantity: 0,
          unit: "Nos",
          cost: 0
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

  const handleCreateBOM = (e) => {
    e.preventDefault();
    const newBOM = {
      ...formData,
      id: `BOM-${String(boms.length + 1).padStart(3, '0')}`
    };
    setBoms([...boms, newBOM]);
    setShowCreateModal(false);
    setFormData({
      bomNumber: "",
      pumpModel: "",
      productCode: "",
      revisionNumber: "",
      effectiveDate: "",
      status: "Active",
      remarks: "",
      materials: [
        {
          materialCode: "",
          materialName: "",
          requiredQuantity: 0,
          unit: "Nos",
          cost: 0
        }
      ]
    });
    toast.success("BOM created successfully!");
  };

  const handleViewBOM = (bom) => {
    setSelectedBOM(bom);
    setShowViewModal(true);
  };

  const handleDeleteBOM = (id) => {
    if (window.confirm("Are you sure you want to delete this BOM?")) {
      setBoms(boms.filter((b) => b.id !== id));
      toast.success("BOM deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setBoms(boms.map((b) => 
      b.id === id ? { ...b, status: newStatus } : b
    ));
    toast.success(`BOM status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> BOM </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total BOMs"
          count={totalBOMs}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Active"
          count={activeBOMs}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Inactive"
          count={inactiveBOMs}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Materials"
          count={totalMaterials}
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
            placeholder="Search BOMs..."
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
            <button className="cursor-pointer">Create BOM</button>
          </div>
        </div>
      </div>

      {/* BOMs Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                BOM Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Pump Model
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product Code
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Revision
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Effective Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Materials
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Total Cost
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
            {filteredBOMs.length > 0 ? (
              filteredBOMs.map((bom) => (
                <tr key={bom.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {bom.bomNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {bom.pumpModel}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {bom.productCode}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {bom.revisionNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {bom.effectiveDate}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {bom.materials.length}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    ₹{calculateTotalCost(bom.materials).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={bom.status}
                      onChange={(e) => handleStatusChange(bom.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        bom.status === "Active"
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
                        onClick={() => handleViewBOM(bom)}
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
                        onClick={() => handleDeleteBOM(bom.id)}
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
                  No BOM Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create BOM Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Bill of Materials</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBOM}>
              {/* BOM Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">BOM Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">BOM Number</label>
                    <input
                      type="text"
                      name="bomNumber"
                      value={formData.bomNumber}
                      onChange={(e) => setFormData({ ...formData, bomNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="BOM-2024-001"
                      required
                    />
                  </div>
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
                    <label className="block mb-1 font-medium text-sm">Revision Number</label>
                    <input
                      type="text"
                      name="revisionNumber"
                      value={formData.revisionNumber}
                      onChange={(e) => setFormData({ ...formData, revisionNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="1.0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Effective Date</label>
                    <input
                      type="date"
                      name="effectiveDate"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
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
                        <th className="p-2 text-left">Material Code</th>
                        <th className="p-2 text-left">Material Name</th>
                        <th className="p-2 text-right">Required Qty</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.materials.map((material, index) => (
                        <tr key={index} className="border-b">
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
                              type="text"
                              value={material.materialName}
                              onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Material name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={material.requiredQuantity}
                              onChange={(e) => handleMaterialChange(index, 'requiredQuantity', parseFloat(e.target.value) || 0)}
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
                            <input
                              type="number"
                              value={material.cost}
                              onChange={(e) => handleMaterialChange(index, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            ₹{((material.requiredQuantity || 0) * (material.cost || 0)).toLocaleString('en-IN')}
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
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan={5} className="p-2 text-right font-semibold">
                          Total Cost:
                        </td>
                        <td className="p-2 text-right font-bold">
                          ₹{calculateTotalCost(formData.materials).toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
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
                  Create BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View BOM Modal */}
      {showViewModal && selectedBOM && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Bill of Materials Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* BOM Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">BOM Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">BOM Number</p>
                    <p className="font-medium">{selectedBOM.bomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pump Model</p>
                    <p className="font-medium">{selectedBOM.pumpModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedBOM.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revision Number</p>
                    <p className="font-medium">{selectedBOM.revisionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Effective Date</p>
                    <p className="font-medium">{selectedBOM.effectiveDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBOM.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedBOM.status}
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
                        <th className="p-2 text-left">Material Code</th>
                        <th className="p-2 text-left">Material Name</th>
                        <th className="p-2 text-right">Required Qty</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBOM.materials.map((material, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{material.materialCode}</td>
                          <td className="p-2 font-medium">{material.materialName}</td>
                          <td className="p-2 text-right">{material.requiredQuantity}</td>
                          <td className="p-2">{material.unit}</td>
                          <td className="p-2 text-right">₹{material.cost.toLocaleString('en-IN')}</td>
                          <td className="p-2 text-right font-medium">₹{(material.requiredQuantity * material.cost).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan={5} className="p-2 text-right font-semibold">
                          Total Cost:
                        </td>
                        <td className="p-2 text-right font-bold">
                          ₹{calculateTotalCost(selectedBOM.materials).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedBOM.remarks || '-'}</p>
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
                  Print BOM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOM;
