import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const ProductionPlanning = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Sample production planning data
  const [plans, setPlans] = useState([
    {
      id: "PLAN-001",
      planNumber: "PLAN-2024-001",
      planDate: "2024-07-01",
      product: "1 HP Centrifugal Pump",
      productCode: "PUMP-001",
      plannedQuantity: 100,
      unit: "Units",
      startDate: "2024-07-01",
      endDate: "2024-07-05",
      priority: "High",
      planner: "John Smith",
      status: "In Progress",
      remarks: "Urgent order for client"
    },
    {
      id: "PLAN-002",
      planNumber: "PLAN-2024-002",
      planDate: "2024-07-10",
      product: "2 HP Centrifugal Pump",
      productCode: "PUMP-002",
      plannedQuantity: 50,
      unit: "Units",
      startDate: "2024-07-15",
      endDate: "2024-07-20",
      priority: "Medium",
      planner: "Jane Doe",
      status: "Pending",
      remarks: "Regular production"
    },
    {
      id: "PLAN-003",
      planNumber: "PLAN-2024-003",
      planDate: "2024-07-15",
      product: "0.5 HP Submersible Pump",
      productCode: "PUMP-003",
      plannedQuantity: 200,
      unit: "Units",
      startDate: "2024-07-20",
      endDate: "2024-07-25",
      priority: "Low",
      planner: "Mike Johnson",
      status: "Completed",
      remarks: "Stock replenishment"
    },
    {
      id: "PLAN-004",
      planNumber: "PLAN-2024-004",
      planDate: "2024-07-20",
      product: "3 HP Industrial Pump",
      productCode: "PUMP-004",
      plannedQuantity: 25,
      unit: "Units",
      startDate: "2024-07-25",
      endDate: "2024-07-30",
      priority: "High",
      planner: "Sarah Wilson",
      status: "Pending",
      remarks: "Special order"
    }
  ]);

  const [formData, setFormData] = useState({
    planNumber: "",
    planDate: "",
    product: "",
    productCode: "",
    plannedQuantity: 0,
    unit: "Units",
    startDate: "",
    endDate: "",
    priority: "Medium",
    planner: "",
    status: "Pending",
    remarks: ""
  });

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.planner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? plan.status === statusFilter : true;
    const matchesPriority = priorityFilter ? plan.priority === priorityFilter : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPlans = plans.length;
  const pendingPlans = plans.filter((p) => p.status === "Pending").length;
  const inProgressPlans = plans.filter((p) => p.status === "In Progress").length;
  const completedPlans = plans.filter((p) => p.status === "Completed").length;
  const totalQuantity = plans.reduce((sum, p) => sum + p.plannedQuantity, 0);

  const handleCreatePlan = (e) => {
    e.preventDefault();
    const newPlan = {
      ...formData,
      id: `PLAN-${String(plans.length + 1).padStart(3, '0')}`
    };
    setPlans([...plans, newPlan]);
    setShowCreateModal(false);
    setFormData({
      planNumber: "",
      planDate: "",
      product: "",
      productCode: "",
      plannedQuantity: 0,
      unit: "Units",
      startDate: "",
      endDate: "",
      priority: "Medium",
      planner: "",
      status: "Pending",
      remarks: ""
    });
    toast.success("Production plan created successfully!");
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowViewModal(true);
  };

  const handleDeletePlan = (id) => {
    if (window.confirm("Are you sure you want to delete this production plan?")) {
      setPlans(plans.filter((p) => p.id !== id));
      toast.success("Production plan deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPlans(plans.map((p) => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    toast.success(`Plan status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Production Planning </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Plans"
          count={totalPlans}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Pending"
          count={pendingPlans}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="In Progress"
          count={inProgressPlans}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Completed"
          count={completedPlans}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Total Quantity"
          count={totalQuantity}
          bg="#FEF3C7"
          color="#D97706"
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
            placeholder="Search production plans..."
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Plan</button>
          </div>
        </div>
      </div>

      {/* Production Plans Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Plan Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Product
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Planned Qty
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Start Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                End Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Priority
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Planner
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
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {plan.planNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{plan.product}</p>
                      <p className="text-xs text-gray-500">{plan.productCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {plan.plannedQuantity} {plan.unit}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {plan.startDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {plan.endDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      plan.priority === "High" ? "bg-red-100 text-red-700" :
                      plan.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {plan.priority}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {plan.planner}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={plan.status}
                      onChange={(e) => handleStatusChange(plan.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        plan.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : plan.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
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
                        onClick={() => handleViewPlan(plan)}
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
                        onClick={() => handleDeletePlan(plan.id)}
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
                  No Production Plan Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Production Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Production Plan</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan}>
              {/* Plan Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Plan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Plan Number</label>
                    <input
                      type="text"
                      name="planNumber"
                      value={formData.planNumber}
                      onChange={(e) => setFormData({ ...formData, planNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="PLAN-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Plan Date</label>
                    <input
                      type="date"
                      name="planDate"
                      value={formData.planDate}
                      onChange={(e) => setFormData({ ...formData, planDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Planner</label>
                    <input
                      type="text"
                      name="planner"
                      value={formData.planner}
                      onChange={(e) => setFormData({ ...formData, planner: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter planner name"
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
                    <label className="block mb-1 font-medium text-sm">Planned Quantity</label>
                    <input
                      type="number"
                      name="plannedQuantity"
                      value={formData.plannedQuantity}
                      onChange={(e) => setFormData({ ...formData, plannedQuantity: parseInt(e.target.value) || 0 })}
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
                    <label className="block mb-1 font-medium text-sm">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
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
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Production Plan Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Production Plan Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Plan Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Plan Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan Number</p>
                    <p className="font-medium">{selectedPlan.planNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan Date</p>
                    <p className="font-medium">{selectedPlan.planDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Planner</p>
                    <p className="font-medium">{selectedPlan.planner}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPlan.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedPlan.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {selectedPlan.status}
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
                    <p className="font-medium">{selectedPlan.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Code</p>
                    <p className="font-medium">{selectedPlan.productCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Planned Quantity</p>
                    <p className="font-bold text-lg">{selectedPlan.plannedQuantity} {selectedPlan.unit}</p>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Schedule Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{selectedPlan.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{selectedPlan.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedPlan.priority === "High" ? "bg-red-100 text-red-700" :
                      selectedPlan.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {selectedPlan.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedPlan.remarks || '-'}</p>
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
                  Print Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanning;
