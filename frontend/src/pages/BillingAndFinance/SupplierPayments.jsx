import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const SupplierPayments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Sample supplier payment data
  const [payments, setPayments] = useState([
    {
      id: "SPAY-001",
      paymentNumber: "SPAY-2024-001",
      paymentDate: "2024-01-18",
      supplierName: "Tech Supplies Ltd",
      purchaseOrderNumber: "PO-2024-001",
      invoiceNumber: "INV-SUP-001",
      invoiceAmount: 45000,
      paymentAmount: 45000,
      paymentMode: "Bank Transfer",
      bankName: "HDFC Bank",
      accountNumber: "9876543210",
      transactionId: "TXN987654321",
      referenceNumber: "REF987654",
      status: "Completed",
      remarks: "Full payment against PO"
    },
    {
      id: "SPAY-002",
      paymentNumber: "SPAY-2024-002",
      paymentDate: "2024-01-25",
      supplierName: "Industrial Materials Co",
      purchaseOrderNumber: "PO-2024-002",
      invoiceNumber: "INV-SUP-002",
      invoiceAmount: 30000,
      paymentAmount: 15000,
      paymentMode: "Cheque",
      bankName: "ICICI Bank",
      chequeNumber: "CHQ123456",
      transactionId: "",
      referenceNumber: "REF456789",
      status: "Pending",
      remarks: "Partial payment - cheque clearance pending"
    },
    {
      id: "SPAY-003",
      paymentNumber: "SPAY-2024-003",
      paymentDate: "2024-02-01",
      supplierName: "Tech Supplies Ltd",
      purchaseOrderNumber: "PO-2024-003",
      invoiceNumber: "INV-SUP-003",
      invoiceAmount: 25000,
      paymentAmount: 25000,
      paymentMode: "UPI",
      bankName: "",
      accountNumber: "",
      transactionId: "UPI123456789",
      referenceNumber: "REF123456",
      status: "Completed",
      remarks: "Full payment via UPI"
    }
  ]);

  const [formData, setFormData] = useState({
    paymentNumber: "",
    paymentDate: "",
    supplierName: "",
    purchaseOrderNumber: "",
    invoiceNumber: "",
    invoiceAmount: 0,
    paymentAmount: 0,
    paymentMode: "Bank Transfer",
    bankName: "",
    accountNumber: "",
    chequeNumber: "",
    transactionId: "",
    referenceNumber: "",
    remarks: ""
  });

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.purchaseOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? payment.status === statusFilter : true;
    const matchesMode = paymentModeFilter ? payment.paymentMode === paymentModeFilter : true;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const totalPayments = payments.length;
  const completedPayments = payments.filter((p) => p.status === "Completed").length;
  const pendingPayments = payments.filter((p) => p.status === "Pending").length;
  const failedPayments = payments.filter((p) => p.status === "Failed").length;
  const totalAmountPaid = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.paymentAmount, 0);

  const handleCreatePayment = (e) => {
    e.preventDefault();
    const newPayment = {
      ...formData,
      id: `SPAY-${String(payments.length + 1).padStart(3, '0')}`,
      status: "Pending"
    };
    setPayments([...payments, newPayment]);
    setShowCreateModal(false);
    setFormData({
      paymentNumber: "",
      paymentDate: "",
      supplierName: "",
      purchaseOrderNumber: "",
      invoiceNumber: "",
      invoiceAmount: 0,
      paymentAmount: 0,
      paymentMode: "Bank Transfer",
      bankName: "",
      accountNumber: "",
      chequeNumber: "",
      transactionId: "",
      referenceNumber: "",
      remarks: ""
    });
    toast.success("Supplier payment recorded successfully!");
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleDeletePayment = (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      setPayments(payments.filter((p) => p.id !== id));
      toast.success("Payment record deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPayments(payments.map((p) => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
    toast.success(`Payment status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Supplier Payments </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Payments"
          count={totalPayments}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Completed"
          count={completedPayments}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingPayments}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Failed"
          count={failedPayments}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Paid"
          count={`₹${totalAmountPaid.toLocaleString()}`}
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
            placeholder="Search supplier payments..."
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
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
          >
            <option value="">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Record Payment</button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Payment No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Supplier
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                PO No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Payment Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Amount
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Mode
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
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {payment.paymentNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {payment.supplierName}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {payment.purchaseOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {payment.paymentDate}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium text-red-600">
                    ₹{payment.paymentAmount.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {payment.paymentMode}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        payment.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewPayment(payment)}
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
                        onClick={() => handleDeletePayment(payment.id)}
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
                  No Payment Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Record Supplier Payment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment}>
              {/* Payment Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Payment Number</label>
                  <input
                    type="text"
                    name="paymentNumber"
                    value={formData.paymentNumber}
                    onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="SPAY-2024-001"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Supplier Name</label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Purchase Order No</label>
                  <input
                    type="text"
                    name="purchaseOrderNumber"
                    value={formData.purchaseOrderNumber}
                    onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter PO number"
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
                <div>
                  <label className="block mb-1 font-medium text-sm">Invoice Amount</label>
                  <input
                    type="number"
                    name="invoiceAmount"
                    value={formData.invoiceAmount}
                    onChange={(e) => setFormData({ ...formData, invoiceAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="0.00"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Payment Amount</label>
                  <input
                    type="number"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter account number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Cheque Number</label>
                  <input
                    type="text"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter cheque number"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Transaction ID</label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter transaction ID"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Reference Number</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter reference number"
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
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Supplier Payment Details</h2>
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
                  <p className="text-sm text-gray-500">Payment Number</p>
                  <p className="font-medium">{selectedPayment.paymentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">{selectedPayment.paymentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier Name</p>
                  <p className="font-medium">{selectedPayment.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Order No</p>
                  <p className="font-medium">{selectedPayment.purchaseOrderNumber || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium">{selectedPayment.invoiceNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Amount</p>
                  <p className="font-medium">₹{selectedPayment.invoiceAmount?.toLocaleString() || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Amount</p>
                  <p className="font-medium text-red-600 text-lg">₹{selectedPayment.paymentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Mode</p>
                  <p className="font-medium">{selectedPayment.paymentMode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">{selectedPayment.bankName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">{selectedPayment.accountNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cheque Number</p>
                  <p className="font-medium">{selectedPayment.chequeNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{selectedPayment.transactionId || '-'}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPayment.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : selectedPayment.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedPayment.status}
                </span>
              </div>

              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedPayment.remarks || 'No remarks'}</p>
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

export default SupplierPayments;
