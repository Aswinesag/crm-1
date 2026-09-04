import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const WorkOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [workCenterFilter, setWorkCenterFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const workCenters = ["Winding", "Machining", "Assembly", "Testing", "Packing"];

  // Sample work order data
  const [orders, setOrders] = useState([
    {
      id: "WO-001",
      workOrderNo: "WO-2024-001",
      productionOrderNo: "PO-2024-001",
      workCenter: "Winding",
      supervisor: "Rajesh Kumar",
      assignedDate: "2024-07-01",
      status: "In Progress",
      remarks: "Copper wire winding for pump motors"
    },
    {
      id: "WO-002",
      workOrderNo: "WO-2024-002",
      productionOrderNo: "PO-2024-001",
      workCenter: "Machining",
      supervisor: "Suresh Reddy",
      assignedDate: "2024-07-02",
      status: "Completed",
      remarks: "Cast iron body machining completed"
    },
    {
      id: "WO-003",
      workOrderNo: "WO-2024-003",
      productionOrderNo: "PO-2024-002",
      workCenter: "Assembly",
      supervisor: "Venkat Rao",
      assignedDate: "2024-07-15",
      status: "Pending",
      remarks: "Assembly of 2 HP pumps"
    },
    {
      id: "WO-004",
      workOrderNo: "WO-2024-004",
      productionOrderNo: "PO-2024-003",
      workCenter: "Testing",
      supervisor: "David Wilson",
      assignedDate: "2024-07-20",
      status: "In Progress",
      remarks: "Quality testing for submersible pumps"
    },
    {
      id: "WO-005",
      workOrderNo: "WO-2024-005",
      productionOrderNo: "PO-2024-001",
      workCenter: "Packing",
      supervisor: "Sarah Johnson",
      assignedDate: "2024-07-04",
      status: "Completed",
      remarks: "Packing completed for delivery"
    }
  ]);

  const [formData, setFormData] = useState({
    workOrderNo: "",
    productionOrderNo: "",
    workCenter: "Assembly",
    supervisor: "",
    assignedDate: "",
    status: "Pending",
    remarks: ""
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.workOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productionOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supervisor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesWorkCenter = workCenterFilter ? order.workCenter === workCenterFilter : true;
    return matchesSearch && matchesStatus && matchesWorkCenter;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const inProgressOrders = orders.filter((o) => o.status === "In Progress").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      ...formData,
      id: `WO-${String(orders.length + 1).padStart(3, '0')}`
    };
    setOrders([...orders, newOrder]);
    setShowCreateModal(false);
    setFormData({
      workOrderNo: "",
      productionOrderNo: "",
      workCenter: "Assembly",
      supervisor: "",
      assignedDate: "",
      status: "Pending",
      remarks: ""
    });
    toast.success("Work order created successfully!");
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDeleteOrder = (id) => {
    if (window.confirm("Are you sure you want to delete this work order?")) {
      setOrders(orders.filter((o) => o.id !== id));
      toast.success("Work order deleted successfully!");
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
        <span className="text-[#C2410C]"> Work Orders </span>
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
          title="Pending"
          count={pendingOrders}
          bg="#FAF5FF"
          color="#7E22CE"
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
            placeholder="Search work orders..."
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
            value={workCenterFilter}
            onChange={(e) => setWorkCenterFilter(e.target.value)}
          >
            <option value="">All Work Centers</option>
            {workCenters.map((center) => (
              <option key={center} value={center}>{center}</option>
            ))}
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Work Order</button>
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Work Order No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Production Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Work Center
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Supervisor
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Assigned Date
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
                    {order.workOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.productionOrderNo}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {order.workCenter}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.supervisor}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.assignedDate}
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
                  colSpan={7}
                >
                  No Work Order Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Work Order</h2>
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
                    <label className="block mb-1 font-medium text-sm">Work Order No</label>
                    <input
                      type="text"
                      name="workOrderNo"
                      value={formData.workOrderNo}
                      onChange={(e) => setFormData({ ...formData, workOrderNo: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="WO-2024-001"
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
                    <label className="block mb-1 font-medium text-sm">Assigned Date</label>
                    <input
                      type="date"
                      name="assignedDate"
                      value={formData.assignedDate}
                      onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Assignment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Work Center</label>
                    <select
                      name="workCenter"
                      value={formData.workCenter}
                      onChange={(e) => setFormData({ ...formData, workCenter: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      {workCenters.map((center) => (
                        <option key={center} value={center}>{center}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Supervisor</label>
                    <input
                      type="text"
                      name="supervisor"
                      value={formData.supervisor}
                      onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter supervisor name"
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
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Work Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Work Order Details</h2>
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
                    <p className="text-sm text-gray-500">Work Order No</p>
                    <p className="font-medium">{selectedOrder.workOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Production Order No</p>
                    <p className="font-medium">{selectedOrder.productionOrderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned Date</p>
                    <p className="font-medium">{selectedOrder.assignedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedOrder.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Assignment Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Work Center</p>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {selectedOrder.workCenter}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supervisor</p>
                    <p className="font-medium">{selectedOrder.supervisor}</p>
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

export default WorkOrders;
