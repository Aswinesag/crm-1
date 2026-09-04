import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const ProductionCosting = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCosting, setSelectedCosting] = useState(null);

  // Sample production costing data
  const [costings, setCostings] = useState([
    {
      id: "PC-001",
      productionOrderNo: "PO-2024-001",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      quantity: 100,
      materialCost: 100000,
      laborCost: 15000,
      machineCost: 5000,
      overheadCost: 5000,
      totalCost: 125000,
      costPerUnit: 1250,
      currency: "₹",
      remarks: "Standard production cost"
    },
    {
      id: "PC-002",
      productionOrderNo: "PO-2024-002",
      product: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      quantity: 50,
      materialCost: 75000,
      laborCost: 10000,
      machineCost: 4000,
      overheadCost: 4000,
      totalCost: 93000,
      costPerUnit: 1860,
      currency: "₹",
      remarks: "Higher material cost for 2 HP model"
    },
    {
      id: "PC-003",
      productionOrderNo: "PO-2024-003",
      product: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      quantity: 200,
      materialCost: 180000,
      laborCost: 20000,
      machineCost: 8000,
      overheadCost: 6000,
      totalCost: 214000,
      costPerUnit: 1070,
      currency: "₹",
      remarks: "Stainless steel body increased cost"
    },
    {
      id: "PC-004",
      productionOrderNo: "PO-2024-004",
      product: "3 HP Industrial Pump",
      productCode: "PUMP-004",
      quantity: 25,
      materialCost: 60000,
      laborCost: 8000,
      machineCost: 3000,
      overheadCost: 3000,
      totalCost: 74000,
      costPerUnit: 2960,
      currency: "₹",
      remarks: "Industrial grade components"
    }
  ]);

  const [formData, setFormData] = useState({
    productionOrderNo: "",
    product: "",
    productCode: "",
    quantity: 0,
    materialCost: 0,
    laborCost: 0,
    machineCost: 0,
    overheadCost: 0,
    currency: "₹",
    remarks: ""
  });

  const filteredCostings = costings.filter((costing) => {
    const matchesSearch =
      costing.productionOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      costing.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      costing.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalCostings = costings.length;
  const totalMaterialCost = costings.reduce((sum, c) => sum + c.materialCost, 0);
  const totalLaborCost = costings.reduce((sum, c) => sum + c.laborCost, 0);
  const totalProductionCost = costings.reduce((sum, c) => sum + c.totalCost, 0);

  const calculateTotalCost = () => {
    return formData.materialCost + formData.laborCost + formData.machineCost + formData.overheadCost;
  };

  const calculateCostPerUnit = () => {
    const total = calculateTotalCost();
    return formData.quantity > 0 ? total / formData.quantity : 0;
  };

  const handleCreateCosting = (e) => {
    e.preventDefault();
    const totalCost = calculateTotalCost();
    const costPerUnit = calculateCostPerUnit();
    const newCosting = {
      ...formData,
      totalCost,
      costPerUnit,
      id: `PC-${String(costings.length + 1).padStart(3, '0')}`
    };
    setCostings([...costings, newCosting]);
    setShowCreateModal(false);
    setFormData({
      productionOrderNo: "",
      product: "",
      productCode: "",
      quantity: 0,
      materialCost: 0,
      laborCost: 0,
      machineCost: 0,
      overheadCost: 0,
      currency: "₹",
      remarks: ""
    });
    toast.success("Production costing created successfully!");
  };

  const handleViewCosting = (costing) => {
    setSelectedCosting(costing);
    setShowViewModal(true);
  };

  const handleDeleteCosting = (id) => {
    if (window.confirm("Are you sure you want to delete this production costing?")) {
      setCostings(costings.filter((c) => c.id !== id));
      toast.success("Production costing deleted successfully!");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
        <span className="text-[#C2410C]"> Production Costing </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Costings"
          count={totalCostings}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Total Material Cost"
          count={formatCurrency(totalMaterialCost)}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Total Labor Cost"
          count={formatCurrency(totalLaborCost)}
          bg="#FEF3C7"
          color="#D97706"
        />
        <Card
          title="Total Production Cost"
          count={formatCurrency(totalProductionCost)}
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
            placeholder="Search production costings..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div
          className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus />
          <button className="cursor-pointer">Create Costing</button>
        </div>
      </div>

      {/* Production Costings Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Production Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Quantity
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Material Cost
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Labor Cost
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Machine Cost
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Overhead Cost
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Total Cost
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Cost Per Unit
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCostings.length > 0 ? (
              filteredCostings.map((costing) => (
                <tr key={costing.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {costing.productionOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{costing.product}</p>
                      <p className="text-xs text-gray-500">{costing.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {costing.quantity}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {formatCurrency(costing.materialCost)}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {formatCurrency(costing.laborCost)}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {formatCurrency(costing.machineCost)}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {formatCurrency(costing.overheadCost)}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-bold text-blue-700">
                    {formatCurrency(costing.totalCost)}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-bold text-green-700">
                    {formatCurrency(costing.costPerUnit)}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewCosting(costing)}
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
                        onClick={() => handleDeleteCosting(costing.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={10}
                >
                  No Production Costing Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Production Costing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Production Costing</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCosting}>
              {/* Product Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block mb-1 font-medium text-sm">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cost Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Cost Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Material Cost (₹)</label>
                    <input
                      type="number"
                      name="materialCost"
                      value={formData.materialCost}
                      onChange={(e) => setFormData({ ...formData, materialCost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Labor Cost (₹)</label>
                    <input
                      type="number"
                      name="laborCost"
                      value={formData.laborCost}
                      onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Machine Cost (₹)</label>
                    <input
                      type="number"
                      name="machineCost"
                      value={formData.machineCost}
                      onChange={(e) => setFormData({ ...formData, machineCost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Overhead Cost (₹)</label>
                    <input
                      type="number"
                      name="overheadCost"
                      value={formData.overheadCost}
                      onChange={(e) => setFormData({ ...formData, overheadCost: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Costs */}
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Total Cost:</span> {formatCurrency(calculateTotalCost())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Cost Per Unit:</span> {formatCurrency(calculateCostPerUnit())}
                    </p>
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
                  Create Costing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Production Costing Modal */}
      {showViewModal && selectedCosting && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Production Costing Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Production Order No</p>
                    <p className="font-medium">{selectedCosting.productionOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-medium">{selectedCosting.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedCosting.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-bold text-lg">{selectedCosting.quantity}</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Cost Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Material Cost</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedCosting.materialCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Labor Cost</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedCosting.laborCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Machine Cost</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedCosting.machineCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Overhead Cost</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedCosting.overheadCost)}</p>
                  </div>
                </div>
              </div>

              {/* Total Costs */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Total Costs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="font-bold text-2xl text-blue-700">{formatCurrency(selectedCosting.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cost Per Unit</p>
                    <p className="font-bold text-2xl text-green-700">{formatCurrency(selectedCosting.costPerUnit)}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedCosting.remarks || '-'}</p>
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
                  Print Costing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionCosting;
