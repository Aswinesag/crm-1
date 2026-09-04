import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const FinishedGoodsEntry = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Sample finished goods entry data
  const [entries, setEntries] = useState([
    {
      id: "FG-001",
      fgNumber: "FG-2024-001",
      productionOrderNo: "PO-2024-001",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      quantityProduced: 100,
      quantityRejected: 2,
      quantityAccepted: 98,
      unit: "Units",
      warehouse: "Main Warehouse",
      entryDate: "2024-07-05",
      remarks: "Production completed successfully"
    },
    {
      id: "FG-002",
      fgNumber: "FG-2024-002",
      productionOrderNo: "PO-2024-002",
      product: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      quantityProduced: 50,
      quantityRejected: 0,
      quantityAccepted: 50,
      unit: "Units",
      warehouse: "Main Warehouse",
      entryDate: "2024-07-20",
      remarks: "All units accepted"
    },
    {
      id: "FG-003",
      fgNumber: "FG-2024-003",
      productionOrderNo: "PO-2024-003",
      product: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      quantityProduced: 200,
      quantityRejected: 5,
      quantityAccepted: 195,
      unit: "Units",
      warehouse: "Secondary Warehouse",
      entryDate: "2024-07-25",
      remarks: "Minor quality issues in 5 units"
    },
    {
      id: "FG-004",
      fgNumber: "FG-2024-004",
      productionOrderNo: "PO-2024-004",
      product: "3 HP Industrial Pump",
      productCode: "PUMP-004",
      quantityProduced: 25,
      quantityRejected: 3,
      quantityAccepted: 22,
      unit: "Units",
      warehouse: "Main Warehouse",
      entryDate: "2024-07-30",
      remarks: "3 units failed QC"
    }
  ]);

  const [formData, setFormData] = useState({
    fgNumber: "",
    productionOrderNo: "",
    product: "",
    productCode: "",
    quantityProduced: 0,
    quantityRejected: 0,
    unit: "Units",
    warehouse: "",
    entryDate: "",
    remarks: ""
  });

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.fgNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.productionOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = warehouseFilter ? entry.warehouse === warehouseFilter : true;
    return matchesSearch && matchesWarehouse;
  });

  const totalEntries = entries.length;
  const totalProduced = entries.reduce((sum, e) => sum + e.quantityProduced, 0);
  const totalRejected = entries.reduce((sum, e) => sum + e.quantityRejected, 0);
  const totalAccepted = entries.reduce((sum, e) => sum + e.quantityAccepted, 0);

  const handleCreateEntry = (e) => {
    e.preventDefault();
    const quantityAccepted = formData.quantityProduced - formData.quantityRejected;
    const newEntry = {
      ...formData,
      quantityAccepted,
      id: `FG-${String(entries.length + 1).padStart(3, '0')}`
    };
    setEntries([...entries, newEntry]);
    setShowCreateModal(false);
    setFormData({
      fgNumber: "",
      productionOrderNo: "",
      product: "",
      productCode: "",
      quantityProduced: 0,
      quantityRejected: 0,
      unit: "Units",
      warehouse: "",
      entryDate: "",
      remarks: ""
    });
    toast.success("Finished goods entry created successfully!");
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm("Are you sure you want to delete this finished goods entry?")) {
      setEntries(entries.filter((e) => e.id !== id));
      toast.success("Finished goods entry deleted successfully!");
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
        / <span className="text-[#C2410C]"> Manufacturing </span> /{" "}
        <span className="text-[#C2410C]"> Finished Goods Entry </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Entries"
          count={totalEntries}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Total Produced"
          count={totalProduced}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Total Rejected"
          count={totalRejected}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Accepted"
          count={totalAccepted}
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
            placeholder="Search finished goods entries..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-col xl:flex-row items-center">
          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            <option value="Main Warehouse">Main Warehouse</option>
            <option value="Secondary Warehouse">Secondary Warehouse</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Entry</button>
          </div>
        </div>
      </div>

      {/* Finished Goods Entries Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                FG Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Production Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Produced
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Rejected
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Accepted
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Warehouse
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Entry Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {entry.fgNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {entry.productionOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{entry.product}</p>
                      <p className="text-xs text-gray-500">{entry.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {entry.quantityProduced} {entry.unit}
                  </td>
                  <td className="p-3 border-b border-gray-300 text-red-600 font-medium">
                    {entry.quantityRejected} {entry.unit}
                  </td>
                  <td className="p-3 border-b border-gray-300 text-green-600 font-bold">
                    {entry.quantityAccepted} {entry.unit}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {entry.warehouse}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {entry.entryDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewEntry(entry)}
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
                        onClick={() => handleDeleteEntry(entry.id)}
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
                  No Finished Goods Entry Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Finished Goods Entry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Finished Goods Entry</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry}>
              {/* Entry Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Entry Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">FG Number</label>
                    <input
                      type="text"
                      name="fgNumber"
                      value={formData.fgNumber}
                      onChange={(e) => setFormData({ ...formData, fgNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="FG-2024-001"
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
                    <label className="block mb-1 font-medium text-sm">Entry Date</label>
                    <input
                      type="date"
                      name="entryDate"
                      value={formData.entryDate}
                      onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
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
                </div>
              </div>

              {/* Quantity Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Quantity Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Quantity Produced</label>
                    <input
                      type="number"
                      name="quantityProduced"
                      value={formData.quantityProduced}
                      onChange={(e) => setFormData({ ...formData, quantityProduced: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Quantity Rejected</label>
                    <input
                      type="number"
                      name="quantityRejected"
                      value={formData.quantityRejected}
                      onChange={(e) => setFormData({ ...formData, quantityRejected: parseInt(e.target.value) || 0 })}
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
                      <option value="Units">Units</option>
                      <option value="Nos">Nos</option>
                      <option value="Kg">Kg</option>
                      <option value="Ltr">Ltr</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Quantity Accepted:</span> {formData.quantityProduced - formData.quantityRejected} {formData.unit}
                  </p>
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
                  Create Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Finished Goods Entry Modal */}
      {showViewModal && selectedEntry && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Finished Goods Entry Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Entry Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Entry Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">FG Number</p>
                    <p className="font-medium">{selectedEntry.fgNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Production Order No</p>
                    <p className="font-medium">{selectedEntry.productionOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entry Date</p>
                    <p className="font-medium">{selectedEntry.entryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="font-medium">{selectedEntry.warehouse}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-medium">{selectedEntry.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedEntry.productCode}</p>
                  </div>
                </div>
              </div>

              {/* Quantity Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Quantity Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantity Produced</p>
                    <p className="font-bold text-lg">{selectedEntry.quantityProduced} {selectedEntry.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity Rejected</p>
                    <p className="font-bold text-lg text-red-600">{selectedEntry.quantityRejected} {selectedEntry.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity Accepted</p>
                    <p className="font-bold text-lg text-green-600">{selectedEntry.quantityAccepted} {selectedEntry.unit}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedEntry.remarks || '-'}</p>
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
                  Print Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishedGoodsEntry;
