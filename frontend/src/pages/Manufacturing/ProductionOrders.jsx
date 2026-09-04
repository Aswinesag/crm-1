import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const ProductionOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample production order data
  const [orders, setOrders] = useState([
    {
      id: "PO-001",
      productionOrderNo: "PO-2024-001",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      bomNumber: "BOM-2024-001",
      quantity: 100,
      unit: "Units",
      startDate: "2024-07-01",
      dueDate: "2024-07-05",
      status: "In Progress",
      remarks: "Urgent order for client"
    },
    {
      id: "PO-002",
      productionOrderNo: "PO-2024-002",
      product: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      bomNumber: "BOM-2024-002",
      quantity: 50,
      unit: "Units",
      startDate: "2024-07-15",
      dueDate: "2024-07-20",
      status: "Released",
      remarks: "Regular production"
    },
    {
      id: "PO-003",
      productionOrderNo: "PO-2024-003",
      product: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      bomNumber: "BOM-2024-003",
      quantity: 200,
      unit: "Units",
      startDate: "2024-07-20",
      dueDate: "2024-07-25",
      status: "Completed",
      remarks: "Stock replenishment"
    },
    {
      id: "PO-004",
      productionOrderNo: "PO-2024-004",
      product: "3 HP Industrial Pump",
      productCode: "PUMP-004",
      bomNumber: "BOM-2024-004",
      quantity: 25,
      unit: "Units",
      startDate: "2024-07-25",
      dueDate: "2024-07-30",
      status: "Draft",
      remarks: "Special order"
    },
    {
      id: "PO-005",
      productionOrderNo: "PO-2024-005",
      product: "1.5 HP Centrifugal Pump",
      productCode: "PUMP-005",
      bomNumber: "BOM-2024-005",
      quantity: 75,
      unit: "Units",
      startDate: "2024-06-15",
      dueDate: "2024-06-20",
      status: "Closed",
      remarks: "Completed and delivered"
    }
  ]);

  const [formData, setFormData] = useState({
    productionOrderNo: "",
    product: "",
    productCode: "",
    bomNumber: "",
    quantity: 0,
    unit: "Units",
    startDate: "",
    dueDate: "",
    status: "Draft",
    remarks: ""
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.productionOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.bomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const draftOrders = orders.filter((o) => o.status === "Draft").length;
  const releasedOrders = orders.filter((o) => o.status === "Released").length;
  const inProgressOrders = orders.filter((o) => o.status === "In Progress").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;
  const closedOrders = orders.filter((o) => o.status === "Closed").length;
  const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      ...formData,
      id: `PO-${String(orders.length + 1).padStart(3, '0')}`
    };
    setOrders([...orders, newOrder]);
    setShowCreateModal(false);
    setFormData({
      productionOrderNo: "",
      product: "",
      productCode: "",
      bomNumber: "",
      quantity: 0,
      unit: "Units",
      startDate: "",
      dueDate: "",
      status: "Draft",
      remarks: ""
    });
    toast.success("Production order created successfully!");
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDeleteOrder = (id) => {
    if (window.confirm("Are you sure you want to delete this production order?")) {
      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Production order deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map((o) => 
      o.id === id ? { ...o, status: newStatus } : o
    ));
    toast.success(`Order status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Production Orders </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Orders"
          count={totalOrders}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Draft"
          count={draftOrders}
          bg="#F3F4F6"
          color="#6B7280"
        />
        <Card
          title="Released"
          count={releasedOrders}
          bg="#DBEAFE"
          color="#2563EB"
        />
        <Card
          title="In Progress"
          count={inProgressOrders}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Completed"
          count={completedOrders}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Closed"
          count={closedOrders}
          bg="#FEF3C7"
          color="#D97706"
        />
        <Card
          title="Total Quantity"
          count={totalQuantity}
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
            placeholder="Search production orders..."
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
            <option value="Draft">Draft</option>
            <option value="Released">Released</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Order</button>
          </div>
        </div>
      </div>

      {/* Production Orders Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Production Order No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                BOM Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Quantity
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Start Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Due Date
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {order.productionOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{order.product}</p>
                      <p className="text-xs text-gray-500">{order.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.bomNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {order.quantity} {order.unit}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.startDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.dueDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Released"
                          ? "bg-indigo-100 text-indigo-700"
                          : order.status === "Closed"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Released">Released</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewOrder(order)}
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
                        onClick={() => handleDeleteOrder(order.id)}
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
                  No Production Order Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Production Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Production Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              {/* Order Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Order Details</h3>
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
                    <label className="block mb-1 font-medium text-sm">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      <option value="Draft">Draft</option>
                      <option value="Released">Released</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
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
              </div>

              {/* Schedule Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Schedule Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
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
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Production Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Production Order Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Production Order No</p>
                    <p className="font-medium">{selectedOrder.productionOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedOrder.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : selectedOrder.status === "Released"
                        ? "bg-indigo-100 text-indigo-700"
                        : selectedOrder.status === "Closed"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedOrder.status}
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
                    <p className="font-medium">{selectedOrder.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedOrder.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BOM Number</p>
                    <p className="font-medium">{selectedOrder.bomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-bold text-lg">{selectedOrder.quantity} {selectedOrder.unit}</p>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Schedule Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{selectedOrder.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{selectedOrder.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedOrder.remarks || '-'}</p>
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
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionOrders;
