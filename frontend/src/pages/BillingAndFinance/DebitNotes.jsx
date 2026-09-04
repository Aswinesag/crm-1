import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";

const DebitNotes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);

  // Sample debit note data
  const [debitNotes, setDebitNotes] = useState([
    {
      id: "DN-001",
      debitNoteNumber: "DN-2024-001",
      debitNoteDate: "2024-01-22",
      invoiceNumber: "INV-2024-001",
      invoiceDate: "2024-01-15",
      customerName: "ABC Corporation",
      gstin: "29ABCDE1234F1Z5",
      billingAddress: "123 Business Street, Chennai",
      reason: "Additional charges for extra services",
      subtotal: 5000,
      cgst: 450,
      sgst: 450,
      igst: 0,
      grandTotal: 5900,
      status: "Approved",
      items: [
        {
          productCode: "SRV-001",
          productName: "Installation Service",
          quantity: 1,
          unit: "Nos",
          rate: 5000,
          discount: 0,
          gstPercent: 18,
          amount: 5900
        }
      ]
    },
    {
      id: "DN-002",
      debitNoteNumber: "DN-2024-002",
      debitNoteDate: "2024-01-28",
      invoiceNumber: "INV-2024-002",
      invoiceDate: "2024-01-20",
      customerName: "XYZ Industries",
      gstin: "29FGHIJ5678K2L6",
      billingAddress: "456 Industrial Area, Coimbatore",
      reason: "Late payment penalty charges",
      subtotal: 2000,
      cgst: 180,
      sgst: 180,
      igst: 0,
      grandTotal: 2360,
      status: "Pending",
      items: [
        {
          productCode: "PEN-001",
          productName: "Late Payment Penalty",
          quantity: 1,
          unit: "Nos",
          rate: 2000,
          discount: 0,
          gstPercent: 18,
          amount: 2360
        }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    debitNoteNumber: "",
    debitNoteDate: "",
    invoiceNumber: "",
    invoiceDate: "",
    customerName: "",
    gstin: "",
    billingAddress: "",
    reason: "",
    items: [
      {
        productCode: "",
        productName: "",
        quantity: 1,
        unit: "Nos",
        rate: 0,
        discount: 0,
        gstPercent: 18,
        amount: 0
      }
    ]
  });

  const filteredDebitNotes = debitNotes.filter((debitNote) => {
    const matchesSearch =
      debitNote.debitNoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debitNote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debitNote.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter ? debitNote.status === statusFilter : true;
    return matchesSearch && matchesFilter;
  });

  const totalDebitNotes = debitNotes.length;
  const approvedDebitNotes = debitNotes.filter((dn) => dn.status === "Approved").length;
  const pendingDebitNotes = debitNotes.filter((dn) => dn.status === "Pending").length;
  const rejectedDebitNotes = debitNotes.filter((dn) => dn.status === "Rejected").length;

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productCode: "",
          productName: "",
          quantity: 1,
          unit: "Nos",
          rate: 0,
          discount: 0,
          gstPercent: 18,
          amount: 0
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'rate' || field === 'quantity' || field === 'discount' || field === 'gstPercent' 
      ? parseFloat(value) || 0 
      : value;
    
    const qty = newItems[index].quantity;
    const rate = newItems[index].rate;
    const discount = newItems[index].discount;
    const gstPercent = newItems[index].gstPercent;
    const baseAmount = (qty * rate) - discount;
    const gstAmount = (baseAmount * gstPercent) / 100;
    newItems[index].amount = baseAmount + gstAmount;
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + ((item.quantity * item.rate) - item.discount), 0);
    const totalGST = formData.items.reduce((sum, item) => sum + (item.amount - ((item.quantity * item.rate) - item.discount)), 0);
    const grandTotal = subtotal + totalGST;
    
    return { subtotal, cgst: totalGST / 2, sgst: totalGST / 2, igst: 0, grandTotal };
  };

  const handleCreateDebitNote = (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    const newDebitNote = {
      ...formData,
      id: `DN-${String(debitNotes.length + 1).padStart(3, '0')}`,
      ...totals,
      status: "Pending"
    };
    setDebitNotes([...debitNotes, newDebitNote]);
    setShowCreateModal(false);
    setFormData({
      debitNoteNumber: "",
      debitNoteDate: "",
      invoiceNumber: "",
      invoiceDate: "",
      customerName: "",
      gstin: "",
      billingAddress: "",
      reason: "",
      items: [
        {
          productCode: "",
          productName: "",
          quantity: 1,
          unit: "Nos",
          rate: 0,
          discount: 0,
          gstPercent: 18,
          amount: 0
        }
      ]
    });
    toast.success("Debit note created successfully!");
  };

  const handleViewDebitNote = (debitNote) => {
    setSelectedDebitNote(debitNote);
    setShowViewModal(true);
  };

  const handleDeleteDebitNote = (id) => {
    if (window.confirm("Are you sure you want to delete this debit note?")) {
      setDebitNotes(debitNotes.filter((dn) => dn.id !== id));
      toast.success("Debit note deleted successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setDebitNotes(debitNotes.map((dn) => 
      dn.id === id ? { ...dn, status: newStatus } : dn
    ));
    toast.success(`Debit note status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Debit Notes </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Debit Notes"
          count={totalDebitNotes}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Approved"
          count={approvedDebitNotes}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingDebitNotes}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Rejected"
          count={rejectedDebitNotes}
          bg="#FAF0F0"
          color="#BA1D1D"
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
            placeholder="Search debit notes..."
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
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Debit Note</button>
          </div>
        </div>
      </div>

      {/* Debit Notes Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Debit Note No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Invoice No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Debit Note Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Amount
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
            {filteredDebitNotes.length > 0 ? (
              filteredDebitNotes.map((debitNote) => (
                <tr key={debitNote.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {debitNote.debitNoteNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {debitNote.customerName}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {debitNote.invoiceNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {debitNote.debitNoteDate}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium text-orange-600">
                    +₹{debitNote.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={debitNote.status}
                      onChange={(e) => handleStatusChange(debitNote.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        debitNote.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : debitNote.status === "Pending"
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
                        onClick={() => handleViewDebitNote(debitNote)}
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
                        onClick={() => handleDeleteDebitNote(debitNote.id)}
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
                  No Debit Note Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Debit Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Debit Note</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDebitNote}>
              {/* Debit Note Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Debit Note Number</label>
                  <input
                    type="text"
                    name="debitNoteNumber"
                    value={formData.debitNoteNumber}
                    onChange={(e) => setFormData({ ...formData, debitNoteNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="DN-2024-001"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Debit Note Date</label>
                  <input
                    type="date"
                    name="debitNoteDate"
                    value={formData.debitNoteDate}
                    onChange={(e) => setFormData({ ...formData, debitNoteDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium text-sm">Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Billing Address</label>
                  <textarea
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    rows="2"
                    placeholder="Enter billing address"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Reason for Debit Note</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  rows="3"
                  placeholder="Enter reason for issuing debit note (e.g., Additional charges, Late payment penalty, etc.)"
                  required
                />
              </div>

              {/* Debit Note Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Debit Note Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer text-sm"
                  >
                    <FiPlus />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full bg-white text-sm text-left border border-gray-300 rounded-md">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 border-b border-gray-300">Product Code</th>
                        <th className="p-2 border-b border-gray-300">Product Name</th>
                        <th className="p-2 border-b border-gray-300">Quantity</th>
                        <th className="p-2 border-b border-gray-300">Unit</th>
                        <th className="p-2 border-b border-gray-300">Rate</th>
                        <th className="p-2 border-b border-gray-300">Discount</th>
                        <th className="p-2 border-b border-gray-300">GST %</th>
                        <th className="p-2 border-b border-gray-300">Amount</th>
                        <th className="p-2 border-b border-gray-300">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2 border-b border-gray-300">
                            <input
                              type="text"
                              value={item.productCode}
                              onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                              placeholder="PRD-001"
                            />
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                              placeholder="Product name"
                            />
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                              min="1"
                            />
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="Nos">Nos</option>
                              <option value="Kg">Kg</option>
                              <option value="Ltr">Ltr</option>
                              <option value="Mtr">Mtr</option>
                              <option value="Box">Box</option>
                            </select>
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                              min="0"
                            />
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                              min="0"
                            />
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            <input
                              type="number"
                              value={item.gstPercent}
                              onChange={(e) => handleItemChange(index, 'gstPercent', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FB6514]"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-2 border-b border-gray-300 font-medium">
                            ₹{item.amount.toFixed(2)}
                          </td>
                          <td className="p-2 border-b border-gray-300">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="text-orange-600">+₹{calculateTotals().subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">CGST:</span>
                    <span className="text-orange-600">+₹{calculateTotals().cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">SGST:</span>
                    <span className="text-orange-600">+₹{calculateTotals().sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">IGST:</span>
                    <span className="text-orange-600">+₹{calculateTotals().igst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg md:col-span-2">
                    <span>Total Debit Amount:</span>
                    <span className="text-orange-600">+₹{calculateTotals().grandTotal.toLocaleString()}</span>
                  </div>
                </div>
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
                  Create Debit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Debit Note Modal */}
      {showViewModal && selectedDebitNote && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Debit Note Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-md mb-4">
                <p className="text-sm text-orange-600 font-medium">Reason for Debit Note:</p>
                <p className="text-orange-800">{selectedDebitNote.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Debit Note Number</p>
                  <p className="font-medium">{selectedDebitNote.debitNoteNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Debit Note Date</p>
                  <p className="font-medium">{selectedDebitNote.debitNoteDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium">{selectedDebitNote.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium">{selectedDebitNote.invoiceDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{selectedDebitNote.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GSTIN</p>
                  <p className="font-medium">{selectedDebitNote.gstin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Billing Address</p>
                  <p className="font-medium">{selectedDebitNote.billingAddress}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDebitNote.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : selectedDebitNote.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedDebitNote.status}
                </span>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Qty</th>
                      <th className="p-2 text-left">Rate</th>
                      <th className="p-2 text-left">GST %</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDebitNote.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2">{item.quantity} {item.unit}</td>
                        <td className="p-2">₹{item.rate.toLocaleString()}</td>
                        <td className="p-2">{item.gstPercent}%</td>
                        <td className="p-2 text-right text-orange-600">+₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-orange-50 p-4 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-orange-600">+₹{selectedDebitNote.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span className="text-orange-600">+₹{selectedDebitNote.cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span className="text-orange-600">+₹{selectedDebitNote.sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span className="text-orange-600">+₹{selectedDebitNote.igst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Debit Amount:</span>
                    <span className="text-orange-600">+₹{selectedDebitNote.grandTotal.toLocaleString()}</span>
                  </div>
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
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebitNotes;
