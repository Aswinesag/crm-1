import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const SupplierLedger = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);

  // Sample supplier ledger data
  const [ledgers, setLedgers] = useState([
    {
      id: "SLED-001",
      supplierName: "Tech Supplies Ltd",
      supplierCode: "SUP-001",
      gstin: "29ABCDE1234F1Z5",
      billingAddress: "123 Industrial Area, Chennai",
      contactNumber: "9876543210",
      email: "tech@supplies.com",
      totalInvoiced: 45000,
      totalPaid: 45000,
      totalCreditNotes: 0,
      totalDebitNotes: 0,
      balanceAmount: 0,
      status: "Settled",
      lastTransactionDate: "2024-01-18",
      transactions: [
        {
          id: "STXN-001",
          date: "2024-01-15",
          type: "Invoice",
          reference: "INV-SUP-001",
          debit: 0,
          credit: 45000,
          balance: 45000
        },
        {
          id: "STXN-002",
          date: "2024-01-18",
          type: "Payment",
          reference: "SPAY-2024-001",
          debit: 45000,
          credit: 0,
          balance: 0
        }
      ]
    },
    {
      id: "SLED-002",
      supplierName: "Industrial Materials Co",
      supplierCode: "SUP-002",
      gstin: "29FGHIJ5678K2L6",
      billingAddress: "456 Factory Zone, Coimbatore",
      contactNumber: "8765432109",
      email: "industrial@materials.com",
      totalInvoiced: 30000,
      totalPaid: 15000,
      totalCreditNotes: 0,
      totalDebitNotes: 2360,
      balanceAmount: 12640,
      status: "Pending",
      lastTransactionDate: "2024-01-28",
      transactions: [
        {
          id: "STXN-003",
          date: "2024-01-20",
          type: "Invoice",
          reference: "INV-SUP-002",
          debit: 0,
          credit: 30000,
          balance: 30000
        },
        {
          id: "STXN-004",
          date: "2024-01-25",
          type: "Payment",
          reference: "SPAY-2024-002",
          debit: 15000,
          credit: 0,
          balance: 15000
        },
        {
          id: "STXN-005",
          date: "2024-01-28",
          type: "Debit Note",
          reference: "SDN-2024-002",
          debit: 2360,
          credit: 0,
          balance: 12640
        }
      ]
    },
    {
      id: "SLED-003",
      supplierName: "Global Logistics",
      supplierCode: "SUP-003",
      gstin: "29KLMNO3456M3N7",
      billingAddress: "789 Transport Hub, Bangalore",
      contactNumber: "7654321098",
      email: "global@logistics.com",
      totalInvoiced: 25000,
      totalPaid: 30000,
      totalCreditNotes: 5000,
      totalDebitNotes: 0,
      balanceAmount: -5000,
      status: "Credit Balance",
      lastTransactionDate: "2024-02-01",
      transactions: [
        {
          id: "STXN-006",
          date: "2024-01-28",
          type: "Invoice",
          reference: "INV-SUP-003",
          debit: 0,
          credit: 25000,
          balance: 25000
        },
        {
          id: "STXN-007",
          date: "2024-02-01",
          type: "Payment",
          reference: "SPAY-2024-003",
          debit: 30000,
          credit: 0,
          balance: -5000
        },
        {
          id: "STXN-008",
          date: "2024-02-01",
          type: "Credit Note",
          reference: "SCN-2024-001",
          debit: 0,
          credit: 0,
          balance: -5000
        }
      ]
    }
  ]);

  const filteredLedgers = ledgers.filter((ledger) => {
    const matchesSearch =
      ledger.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ledger.supplierCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ledger.gstin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? ledger.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalSuppliers = ledgers.length;
  const settledSuppliers = ledgers.filter((l) => l.status === "Settled").length;
  const pendingSuppliers = ledgers.filter((l) => l.status === "Pending").length;
  const creditBalanceSuppliers = ledgers.filter((l) => l.status === "Credit Balance").length;
  const totalPayable = ledgers.reduce((sum, l) => sum + Math.max(0, l.balanceAmount), 0);
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
        <span className="text-[#C2410C]"> Supplier Ledger </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Suppliers"
          count={totalSuppliers}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Settled"
          count={settledSuppliers}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingSuppliers}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Credit Balance"
          count={creditBalanceSuppliers}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Payable"
          count={`₹${totalPayable.toLocaleString()}`}
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
            placeholder="Search suppliers..."
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
                Supplier
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Supplier Code
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
                      <p className="font-medium text-blue-700">{ledger.supplierName}</p>
                      <p className="text-xs text-gray-500">{ledger.email}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {ledger.supplierCode}
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
              <h2 className="text-xl font-bold">Supplier Ledger Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Supplier Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Supplier Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Supplier Name</p>
                    <p className="font-medium">{selectedLedger.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supplier Code</p>
                    <p className="font-medium">{selectedLedger.supplierCode}</p>
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
                              txn.type === "Invoice" ? "bg-green-100 text-green-700" :
                              txn.type === "Payment" ? "bg-red-100 text-red-700" :
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

export default SupplierLedger;
