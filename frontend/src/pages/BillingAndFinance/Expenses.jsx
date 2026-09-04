import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const Expenses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Sample expense data
  const [expenses, setExpenses] = useState([
    {
      id: "EXP-001",
      expenseNumber: "EXP-2024-001",
      expenseDate: "2024-01-15",
      category: "Office Supplies",
      subCategory: "Stationery",
      description: "Office stationery purchase",
      amount: 5000,
      paidBy: "Cash",
      paidTo: "Stationery Shop",
      invoiceNumber: "INV-STAT-001",
      status: "Approved",
      remarks: "Monthly stationery stock"
    },
    {
      id: "EXP-002",
      expenseNumber: "EXP-2024-002",
      expenseDate: "2024-01-20",
      category: "Utilities",
      subCategory: "Electricity",
      description: "Office electricity bill",
      amount: 12000,
      paidBy: "Bank Transfer",
      paidTo: "TNEB",
      invoiceNumber: "EB-2024-001",
      status: "Pending",
      remarks: "Monthly electricity bill"
    },
    {
      id: "EXP-003",
      expenseNumber: "EXP-2024-003",
      expenseDate: "2024-01-25",
      category: "Travel",
      subCategory: "Local Travel",
      description: "Client meeting travel",
      amount: 2500,
      paidBy: "UPI",
      paidTo: "Cab Service",
      invoiceNumber: "",
      status: "Approved",
      remarks: "Travel to client location"
    },
    {
      id: "EXP-004",
      expenseNumber: "EXP-2024-004",
      expenseDate: "2024-02-01",
      category: "Maintenance",
      subCategory: "Office Maintenance",
      description: "Office AC maintenance",
      amount: 3500,
      paidBy: "Cheque",
      paidTo: "AC Service Co",
      invoiceNumber: "INV-AC-001",
      status: "Rejected",
      remarks: "Quarterly maintenance"
    }
  ]);

  const [formData, setFormData] = useState({
    expenseNumber: "",
    expenseDate: "",
    category: "Office Supplies",
    subCategory: "",
    description: "",
    amount: 0,
    paidBy: "Cash",
    paidTo: "",
    invoiceNumber: "",
    remarks: ""
  });

  const categories = [
    "Office Supplies",
    "Utilities",
    "Travel",
    "Maintenance",
    "Marketing",
    "Salaries",
    "Rent",
    "Insurance",
    "Training",
    "Miscellaneous"
  ];

  const paymentMethods = ["Cash", "Bank Transfer", "UPI", "Cheque", "Card"];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? expense.category === categoryFilter : true;
    const matchesStatus = statusFilter ? expense.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalExpenses = expenses.length;
  const approvedExpenses = expenses.filter((e) => e.status === "Approved").length;
  const pendingExpenses = expenses.filter((e) => e.status === "Pending").length;
  const rejectedExpenses = expenses.filter((e) => e.status === "Rejected").length;
  const totalAmount = expenses
    .filter((e) => e.status === "Approved")
    .reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const newExpense = {
      ...formData,
      id: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
      status: "Pending"
    };
    setExpenses([...expenses, newExpense]);
    setShowCreateModal(false);
    setFormData({
      expenseNumber: "",
      expenseDate: "",
      category: "Office Supplies",
      subCategory: "",
      description: "",
      amount: 0,
      paidBy: "Cash",
      paidTo: "",
      invoiceNumber: "",
      remarks: ""
    });
    toast.success("Expense recorded successfully!");
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      setExpenses(expenses.filter((e) => e.id !== id));
      toast.success("Expense record deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setExpenses(expenses.map((e) => 
      e.id === id ? { ...e, status: newStatus } : e
    ));
    toast.success(`Expense status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Expenses </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Expenses"
          count={totalExpenses}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Approved"
          count={approvedExpenses}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingExpenses}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Rejected"
          count={rejectedExpenses}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Amount"
          count={`₹${totalAmount.toLocaleString()}`}
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
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-col xl:flex-row items-center">
          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Add Expense</button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Expense No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Category
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Description
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Amount
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Paid By
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
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {expense.expenseNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {expense.expenseDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {expense.description}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium text-red-600">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {expense.paidBy}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={expense.status}
                      onChange={(e) => handleStatusChange(expense.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        expense.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : expense.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewExpense(expense)}
                      />
                      <FiEdit
                        className="text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Edit functionality coming soon")}
                      />
                      <FiDownload
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Download functionality coming soon")}
                      />
                      <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeleteExpense(expense.id)}
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
                  No Expense Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Expense</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Expense Number</label>
                  <input
                    type="text"
                    name="expenseNumber"
                    value={formData.expenseNumber}
                    onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="EXP-2024-001"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Expense Date</label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Sub Category</label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter sub category"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="0.00"
                    min="0"
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
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Paid By</label>
                  <select
                    name="paidBy"
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Paid To</label>
                  <input
                    type="text"
                    name="paidTo"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter payee name"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter invoice number"
                  />
                </div>
              </div>

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
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Expense Details</h2>
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
                  <p className="text-sm text-gray-500">Expense Number</p>
                  <p className="font-medium">{selectedExpense.expenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expense Date</p>
                  <p className="font-medium">{selectedExpense.expenseDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sub Category</p>
                  <p className="font-medium">{selectedExpense.subCategory || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{selectedExpense.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-red-600 text-lg">₹{selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid By</p>
                  <p className="font-medium">{selectedExpense.paidBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Paid To</p>
                  <p className="font-medium">{selectedExpense.paidTo || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium">{selectedExpense.invoiceNumber || '-'}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedExpense.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : selectedExpense.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedExpense.status}
                </span>
              </div>

              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedExpense.remarks || 'No remarks'}</p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => toast.info("Download functionality coming soon")}
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
