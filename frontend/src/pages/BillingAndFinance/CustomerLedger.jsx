import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const CustomerLedger = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);

  // Sample customer ledger data
  const [ledgers, setLedgers] = useState([
    {
      id: "LED-001",
      customerName: "ABC Corporation",
      customerCode: "CUST-001",
      gstin: "29ABCDE1234F1Z5",
      billingAddress: "123 Business Street, Chennai",
      contactNumber: "9876543210",
      email: "abc@corp.com",
      totalInvoiced: 60000,
      totalPaid: 60000,
      totalCreditNotes: 0,
      totalDebitNotes: 0,
      balanceAmount: 0,
      status: "Settled",
      lastTransactionDate: "2024-01-18",
      transactions: [
        {
          id: "TXN-001",
          date: "2024-01-15",
          type: "Invoice",
          reference: "INV-2024-001",
          debit: 60000,
          credit: 0,
          balance: 60000
        },
        {
          id: "TXN-002",
          date: "2024-01-18",
          type: "Payment",
          reference: "PAY-2024-001",
          debit: 0,
          credit: 60000,
          balance: 0
        }
      ]
    },
    {
      id: "LED-002",
      customerName: "XYZ Industries",
      customerCode: "CUST-002",
      gstin: "29FGHIJ5678K2L6",
      billingAddress: "456 Industrial Area, Coimbatore",
      contactNumber: "8765432109",
      email: "xyz@ind.com",
      totalInvoiced: 45000,
      totalPaid: 20000,
      totalCreditNotes: 0,
      totalDebitNotes: 2360,
      balanceAmount: 27360,
      status: "Pending",
      lastTransactionDate: "2024-01-28",
      transactions: [
        {
          id: "TXN-003",
          date: "2024-01-20",
          type: "Invoice",
          reference: "INV-2024-002",
          debit: 45000,
          credit: 0,
          balance: 45000
        },
        {
          id: "TXN-004",
          date: "2024-01-25",
          type: "Payment",
          reference: "PAY-2024-002",
          debit: 0,
          credit: 20000,
          balance: 25000
        },
        {
          id: "TXN-005",
          date: "2024-01-28",
          type: "Debit Note",
          reference: "DN-2024-002",
          debit: 2360,
          credit: 0,
          balance: 27360
        }
      ]
    },
    {
      id: "LED-003",
      customerName: "Global Tech Solutions",
      customerCode: "CUST-003",
      gstin: "29KLMNO3456M3N7",
      billingAddress: "789 Tech Park, Bangalore",
      contactNumber: "7654321098",
      email: "global@tech.com",
      totalInvoiced: 30000,
      totalPaid: 30000,
      totalCreditNotes: 5000,
      totalDebitNotes: 0,
      balanceAmount: -5000,
      status: "Credit Balance",
      lastTransactionDate: "2024-02-01",
      transactions: [
        {
          id: "TXN-006",
          date: "2024-01-28",
          type: "Invoice",
          reference: "INV-2024-003",
          debit: 30000,
          credit: 0,
          balance: 30000
        },
        {
          id: "TXN-007",
          date: "2024-02-01",
          type: "Payment",
          reference: "PAY-2024-003",
          debit: 0,
          credit: 35000,
          balance: -5000
        },
        {
          id: "TXN-008",
          date: "2024-02-01",
          type: "Credit Note",
          reference: "CN-2024-001",
          debit: 0,
          credit: 0,
          balance: -5000
        }
      ]
    }
  ]);

  const filteredLedgers = ledgers.filter((ledger) => {
    const matchesSearch =
      ledger.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ledger.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ledger.gstin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? ledger.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = ledgers.length;
  const settledCustomers = ledgers.filter((l) => l.status === "Settled").length;
  const pendingCustomers = ledgers.filter((l) => l.status === "Pending").length;
  const creditBalanceCustomers = ledgers.filter((l) => l.status === "Credit Balance").length;
  const totalReceivable = ledgers.reduce((sum, l) => sum + Math.max(0, l.balanceAmount), 0);
  const totalCreditBalance = ledgers.reduce((sum, l) => sum + Math.min(0, l.balanceAmount), 0);

  const handleViewLedger = (ledger) => {
    setSelectedLedger(ledger);
    setShowViewModal(true);
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
        <span className="text-[#C2410C]"> Customer Ledger </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Customers"
          count={totalCustomers}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Settled"
          count={settledCustomers}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingCustomers}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Credit Balance"
          count={creditBalanceCustomers}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Receivable"
          count={`₹${totalReceivable.toLocaleString()}`}
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
            placeholder="Search customers..."
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
            <option value="Settled">Settled</option>
            <option value="Pending">Pending</option>
            <option value="Credit Balance">Credit Balance</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer Code
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Total Invoiced
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Total Paid
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Balance
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
            {filteredLedgers.length > 0 ? (
              filteredLedgers.map((ledger) => (
                <tr key={ledger.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium text-blue-700">{ledger.customerName}</p>
                      <p className="text-xs text-gray-500">{ledger.email}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {ledger.customerCode}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    ₹{ledger.totalInvoiced.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium text-green-600">
                    ₹{ledger.totalPaid.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    <span className={ledger.balanceAmount > 0 ? "text-red-600" : ledger.balanceAmount < 0 ? "text-green-600" : "text-gray-600"}>
                      ₹{ledger.balanceAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ledger.status === "Settled"
                          ? "bg-green-100 text-green-700"
                          : ledger.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {ledger.status}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewLedger(ledger)}
                      />
                      <FiDownload
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Download functionality coming soon")}
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
                  No Ledger Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Ledger Modal */}
      {showViewModal && selectedLedger && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Customer Ledger Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{selectedLedger.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-medium">{selectedLedger.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GSTIN</p>
                    <p className="font-medium">{selectedLedger.gstin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedLedger.contactNumber}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Billing Address</p>
                    <p className="font-medium">{selectedLedger.billingAddress}</p>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Account Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Invoiced</p>
                    <p className="font-medium text-lg">₹{selectedLedger.totalInvoiced.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="font-medium text-lg text-green-600">₹{selectedLedger.totalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Credit Notes</p>
                    <p className="font-medium text-lg text-blue-600">₹{selectedLedger.totalCreditNotes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Debit Notes</p>
                    <p className="font-medium text-lg text-orange-600">₹{selectedLedger.totalDebitNotes.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 border-t pt-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 font-medium">Current Balance</p>
                      <p className={`font-bold text-2xl ${selectedLedger.balanceAmount > 0 ? "text-red-600" : selectedLedger.balanceAmount < 0 ? "text-green-600" : "text-gray-600"}`}>
                        ₹{selectedLedger.balanceAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="font-semibold mb-3">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Reference</th>
                        <th className="p-2 text-right">Debit</th>
                        <th className="p-2 text-right">Credit</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedLedger.transactions.map((txn, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{txn.date}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              txn.type === "Invoice" ? "bg-red-100 text-red-700" :
                              txn.type === "Payment" ? "bg-green-100 text-green-700" :
                              txn.type === "Credit Note" ? "bg-blue-100 text-blue-700" :
                              "bg-orange-100 text-orange-700"
                            }`}>
                              {txn.type}
                            </span>
                          </td>
                          <td className="p-2">{txn.reference}</td>
                          <td className="p-2 text-right">{txn.debit > 0 ? `₹${txn.debit.toLocaleString()}` : '-'}</td>
                          <td className="p-2 text-right">{txn.credit > 0 ? `₹${txn.credit.toLocaleString()}` : '-'}</td>
                          <td className="p-2 text-right font-medium">
                            ₹{txn.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  Download Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
