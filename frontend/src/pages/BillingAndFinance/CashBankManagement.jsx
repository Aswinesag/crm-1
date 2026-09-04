import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const CashBankManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Sample cash and bank accounts data
  const [accounts, setAccounts] = useState([
    {
      id: "ACC-001",
      accountName: "Main Cash Account",
      accountNumber: "CASH-001",
      accountType: "Cash",
      bankName: "",
      branch: "",
      ifscCode: "",
      currentBalance: 50000,
      openingBalance: 50000,
      status: "Active",
      lastTransactionDate: "2024-02-01",
      transactions: [
        {
          id: "TXN-001",
          date: "2024-01-15",
          type: "Credit",
          description: "Cash received from customer",
          amount: 20000,
          balance: 70000
        },
        {
          id: "TXN-002",
          date: "2024-01-20",
          type: "Debit",
          description: "Office expense payment",
          amount: 15000,
          balance: 55000
        },
        {
          id: "TXN-003",
          date: "2024-01-25",
          type: "Debit",
          description: "Petty cash expense",
          amount: 5000,
          balance: 50000
        }
      ]
    },
    {
      id: "ACC-002",
      accountName: "HDFC Bank - Current Account",
      accountNumber: "1234567890",
      accountType: "Bank",
      bankName: "HDFC Bank",
      branch: "Chennai Main Branch",
      ifscCode: "HDFC0001234",
      currentBalance: 250000,
      openingBalance: 200000,
      status: "Active",
      lastTransactionDate: "2024-02-01",
      transactions: [
        {
          id: "TXN-004",
          date: "2024-01-18",
          type: "Credit",
          description: "Customer payment received",
          amount: 60000,
          balance: 260000
        },
        {
          id: "TXN-005",
          date: "2024-01-22",
          type: "Debit",
          description: "Supplier payment",
          amount: 45000,
          balance: 215000
        },
        {
          id: "TXN-006",
          date: "2024-01-28",
          type: "Credit",
          description: "Loan received",
          amount: 35000,
          balance: 250000
        }
      ]
    },
    {
      id: "ACC-003",
      accountName: "ICICI Bank - Savings Account",
      accountNumber: "0987654321",
      accountType: "Bank",
      bankName: "ICICI Bank",
      branch: "Coimbatore Branch",
      ifscCode: "ICIC0005678",
      currentBalance: 150000,
      openingBalance: 100000,
      status: "Active",
      lastTransactionDate: "2024-01-30",
      transactions: [
        {
          id: "TXN-007",
          date: "2024-01-20",
          type: "Credit",
          description: "Interest credited",
          amount: 500,
          balance: 100500
        },
        {
          id: "TXN-008",
          date: "2024-01-25",
          type: "Credit",
          description: "Customer payment",
          amount: 49500,
          balance: 150000
        }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    accountType: "Cash",
    bankName: "",
    branch: "",
    ifscCode: "",
    openingBalance: 0
  });

  const [transactionFormData, setTransactionFormData] = useState({
    date: "",
    type: "Credit",
    description: "",
    amount: 0
  });

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bankName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = accountTypeFilter ? account.accountType === accountTypeFilter : true;
    return matchesSearch && matchesType;
  });

  const totalAccounts = accounts.length;
  const cashAccounts = accounts.filter((a) => a.accountType === "Cash").length;
  const bankAccounts = accounts.filter((a) => a.accountType === "Bank").length;
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const newAccount = {
      ...formData,
      id: `ACC-${String(accounts.length + 1).padStart(3, '0')}`,
      currentBalance: formData.openingBalance,
      status: "Active",
      lastTransactionDate: new Date().toISOString().split('T')[0],
      transactions: []
    };
    setAccounts([...accounts, newAccount]);
    setShowCreateModal(false);
    setFormData({
      accountName: "",
      accountNumber: "",
      accountType: "Cash",
      bankName: "",
      branch: "",
      ifscCode: "",
      openingBalance: 0
    });
    toast.success("Account created successfully!");
  };

  const handleViewAccount = (account) => {
    setSelectedAccount(account);
    setShowViewModal(true);
  };

  const handleAddTransaction = (account) => {
    setSelectedAccount(account);
    setTransactionFormData({
      date: "",
      type: "Credit",
      description: "",
      amount: 0
    });
    setShowTransactionModal(true);
  };

  const handleCreateTransaction = (e) => {
    e.preventDefault();
    const newBalance = transactionFormData.type === "Credit"
      ? selectedAccount.currentBalance + transactionFormData.amount
      : selectedAccount.currentBalance - transactionFormData.amount;

    const newTransaction = {
      id: `TXN-${String(selectedAccount.transactions.length + 1).padStart(3, '0')}`,
      date: transactionFormData.date,
      type: transactionFormData.type,
      description: transactionFormData.description,
      amount: transactionFormData.amount,
      balance: newBalance
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === selectedAccount.id
        ? {
            ...acc,
            currentBalance: newBalance,
            lastTransactionDate: transactionFormData.date,
            transactions: [...acc.transactions, newTransaction]
          }
        : acc
    );

    setAccounts(updatedAccounts);
    setShowTransactionModal(false);
    toast.success("Transaction recorded successfully!");
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      setAccounts(accounts.filter((a) => a.id !== id));
      toast.success("Account deleted successfully!");
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
        / <span className="text-[#C2410C]"> Billing & Finance </span> /{" "}
        <span className="text-[#C2410C]"> Cash & Bank Management </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Accounts"
          count={totalAccounts}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Cash Accounts"
          count={cashAccounts}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Bank Accounts"
          count={bankAccounts}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Total Balance"
          count={`₹${totalBalance.toLocaleString()}`}
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
            placeholder="Search accounts..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-col xl:flex-row items-center">
          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Add Account</button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Account Name
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Account Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Type
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Bank/Branch
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Current Balance
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
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 font-medium text-blue-700">
                    {account.accountName}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {account.accountNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.accountType === "Cash" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {account.accountType}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {account.bankName ? `${account.bankName} - ${account.branch}` : '-'}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium text-green-600">
                    ₹{account.currentBalance.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {account.status}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewAccount(account)}
                      />
                      <FiPlus
                        className="text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleAddTransaction(account)}
                        title="Add Transaction"
                      />
                      <FiEdit
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Edit functionality coming soon")}
                      />
                      <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeleteAccount(account.id)}
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
                  No Account Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Account</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Account Name</label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter account name"
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Account Type</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Opening Balance</label>
                  <input
                    type="number"
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              {formData.accountType === "Bank" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <label className="block mb-1 font-medium text-sm">Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter branch"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
              )}

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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Account Modal */}
      {showViewModal && selectedAccount && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Account Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Account Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Account Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Name</p>
                    <p className="font-medium">{selectedAccount.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">{selectedAccount.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium">{selectedAccount.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedAccount.status}</p>
                  </div>
                  {selectedAccount.accountType === "Bank" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{selectedAccount.bankName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Branch</p>
                        <p className="font-medium">{selectedAccount.branch}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">IFSC Code</p>
                        <p className="font-medium">{selectedAccount.ifscCode}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Balance Summary */}
              <div className="bg-green-50 p-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Opening Balance</p>
                    <p className="font-medium text-lg">₹{selectedAccount.openingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="font-bold text-2xl text-green-600">₹{selectedAccount.currentBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Transaction</p>
                    <p className="font-medium">{selectedAccount.lastTransactionDate}</p>
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
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAccount.transactions.map((txn, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{txn.date}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              txn.type === "Credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {txn.type}
                            </span>
                          </td>
                          <td className="p-2">{txn.description}</td>
                          <td className="p-2 text-right font-medium">
                            {txn.type === "Credit" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                          </td>
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

      {/* Add Transaction Modal */}
      {showTransactionModal && selectedAccount && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Transaction</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Account: <span className="font-medium">{selectedAccount.accountName}</span></p>
              <p className="text-sm text-gray-500">Current Balance: <span className="font-medium text-green-600">₹{selectedAccount.currentBalance.toLocaleString()}</span></p>
            </div>

            <form onSubmit={handleCreateTransaction}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={transactionFormData.date}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Transaction Type</label>
                  <select
                    name="type"
                    value={transactionFormData.type}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  >
                    <option value="Credit">Credit (Deposit)</option>
                    <option value="Debit">Debit (Withdrawal)</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Description</label>
                <textarea
                  name="description"
                  value={transactionFormData.description}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  rows="3"
                  placeholder="Enter transaction description"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={transactionFormData.amount}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBankManagement;
