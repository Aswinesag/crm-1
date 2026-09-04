import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiCreditCard } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import {
  createRazorpayOrder,
  loadRazorpayCheckout,
  verifyRazorpayPayment,
} from "../../services/paymentService.js";
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  getInvoices,
} from "../../services/invoiceService.js";

const toDisplayInvoice = (invoice) => ({
  ...invoice,
  status: invoice.paymentStatus === "Unpaid" ? "Pending" : invoice.paymentStatus,
  invoiceDate: String(invoice.invoiceDate || "").slice(0, 10),
  dueDate: String(invoice.dueDate || "").slice(0, 10),
});

const emptyInvoiceForm = () => ({
  invoiceNumber: "",
  invoiceDate: "",
  salesOrderNo: "",
  customerName: "",
  gstin: "",
  billingAddress: "",
  shippingAddress: "",
  paymentTerms: "30 Days",
  dueDate: "",
  freightCharges: 1000,
  items: [{ productCode: "", productName: "", quantity: 1, unit: "Nos", rate: 0, discount: 0, gstPercent: 18, amount: 0 }],
});

const InvoiceManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyInvoiceForm);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getInvoices({ limit: 100 });
      setInvoices(response.data.map(toDisplayInvoice));
    } catch (error) {
      setLoadError(error.response?.data?.message || "Unable to load invoices");
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.salesOrderNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter ? invoice.status === statusFilter : true;
    return matchesSearch && matchesFilter;
  });

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv) => inv.status === "Paid").length;
  const pendingInvoices = invoices.filter((inv) => inv.status === "Pending").length;
  const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue").length;

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
    
    // Calculate amount
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
    const freightCharges = Number(formData.freightCharges) || 0;
    const grandTotal = subtotal + totalGST + freightCharges;
    
    return { subtotal, cgst: totalGST / 2, sgst: totalGST / 2, igst: 0, freightCharges, grandTotal };
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        items: formData.items.map((item) => ({
          productCode: item.productCode,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          discount: item.discount,
          gstPercent: item.gstPercent,
        })),
      };
      const persisted = await createInvoice(payload);
      setInvoices((current) => [toDisplayInvoice(persisted), ...current]);
      setShowCreateModal(false);
      setFormData(emptyInvoiceForm());
      toast.success("Invoice created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        setInvoices((current) => current.filter((invoice) => invoice.id !== id));
        toast.success("Invoice deleted successfully!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to delete invoice");
      }
    }
  };

  const handlePayNow = async (invoice) => {
    if (payingInvoiceId || invoice.status === "Paid") return;
    setPayingInvoiceId(invoice.id);

    try {
      await loadRazorpayCheckout();
      const order = await createRazorpayOrder({ invoiceId: invoice.id });

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "CRM Invoice Payment",
        description: `Payment for ${order.invoiceNumber}`,
        prefill: {
          name: order.customerName || "",
          email: order.customerEmail || "",
          contact: order.customerContact || "",
        },
        notes: { invoiceNumber: order.invoiceNumber },
        handler: async (checkoutResult) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: checkoutResult.razorpay_order_id,
              razorpay_payment_id: checkoutResult.razorpay_payment_id,
              razorpay_signature: checkoutResult.razorpay_signature,
            });
            const persisted = await getInvoice(invoice.id);
            setInvoices((current) => current.map((item) =>
              item.id === invoice.id ? toDisplayInvoice(persisted) : item
            ));
            toast.success("Payment verified successfully!");
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment could not be verified");
          } finally {
            setPayingInvoiceId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingInvoiceId(null);
            toast("Payment checkout closed");
          },
        },
        theme: { color: "#FB6514" },
      });

      checkout.on("payment.failed", (response) => {
        setPayingInvoiceId(null);
        toast.error(response.error?.description || "Payment was not completed");
      });
      checkout.open();
    } catch (error) {
      setPayingInvoiceId(null);
      if (error.response?.data?.code === "INVOICE_ALREADY_PAID") {
        try {
          const persisted = await getInvoice(invoice.id);
          setInvoices((current) => current.map((item) => item.id === invoice.id ? toDisplayInvoice(persisted) : item));
          toast.success("The existing payment was recovered and this invoice is now paid");
          return;
        } catch {
          // Fall through to the authoritative backend error if refreshing fails.
        }
      }
      toast.error(error.response?.data?.message || error.message || "Unable to start payment");
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
        <span className="text-[#C2410C]"> Invoice Management </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Invoices"
          count={totalInvoices}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Paid Invoices"
          count={paidInvoices}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending Invoices"
          count={pendingInvoices}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Overdue Invoices"
          count={overdueInvoices}
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
            placeholder="Search invoices..."
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
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Invoice</button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Invoice No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Invoice Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Due Date
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
            {isLoading ? (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">Loading invoices...</td></tr>
            ) : loadError ? (
              <tr><td colSpan={7} className="p-4 text-center text-red-600">
                {loadError}{" "}
                <button type="button" onClick={loadInvoices} className="underline">Retry</button>
              </td></tr>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {invoice.customerName}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {invoice.invoiceDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {invoice.dueDate}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    ₹{invoice.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      {["Pending", "Overdue"].includes(invoice.status) && (
                        <button
                          type="button"
                          disabled={Boolean(payingInvoiceId)}
                          onClick={() => handlePayNow(invoice)}
                          className="inline-flex items-center gap-1 rounded bg-[#FB6514] px-2 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                          title="Pay invoice with Razorpay"
                        >
                          <FiCreditCard />
                          {payingInvoiceId === invoice.id ? "Opening..." : "Pay Now"}
                        </button>
                      )}
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewInvoice(invoice)}
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
                        onClick={() => handleDeleteInvoice(invoice.id)}
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
                  No Invoice Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Invoice</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="INV-2024-001"
                    required
                  />
                </div>
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
                <div>
                  <label className="block mb-1 font-medium text-sm">Sales Order No</label>
                  <input
                    type="text"
                    name="salesOrderNo"
                    value={formData.salesOrderNo}
                    onChange={(e) => setFormData({ ...formData, salesOrderNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="SO-2024-001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
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
                <div>
                  <label className="block mb-1 font-medium text-sm">GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    placeholder="29ABCDE1234F1Z5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                <div>
                  <label className="block mb-1 font-medium text-sm">Shipping Address</label>
                  <textarea
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    rows="2"
                    placeholder="Enter shipping address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Payment Terms</label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  >
                    <option value="Advance">Advance</option>
                    <option value="Immediate">Immediate</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
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
                <div>
                  <label className="block mb-1 font-medium text-sm">Freight Charges</label>
                  <input
                    type="number"
                    value={formData.freightCharges}
                    onChange={(e) => setFormData({ ...formData, freightCharges: Number(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
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
                    <span>₹{calculateTotals().subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">CGST:</span>
                    <span>₹{calculateTotals().cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">SGST:</span>
                    <span>₹{calculateTotals().sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">IGST:</span>
                    <span>₹{calculateTotals().igst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Freight Charges:</span>
                    <span>₹{calculateTotals().freightCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Grand Total:</span>
                    <span className="text-[#FB6514]">₹{calculateTotals().grandTotal.toLocaleString()}</span>
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
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Creating..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Invoice Details</h2>
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
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Invoice Date</p>
                  <p className="font-medium">{selectedInvoice.invoiceDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sales Order No</p>
                  <p className="font-medium">{selectedInvoice.salesOrderNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{selectedInvoice.dueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GSTIN</p>
                  <p className="font-medium">{selectedInvoice.gstin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Billing Address</p>
                  <p className="font-medium">{selectedInvoice.billingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="font-medium">{selectedInvoice.shippingAddress}</p>
                </div>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-500 mb-2">Payment Terms</p>
                <p className="font-medium">{selectedInvoice.paymentTerms}</p>
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
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.productName}</td>
                        <td className="p-2">{item.quantity} {item.unit}</td>
                        <td className="p-2">₹{item.rate.toLocaleString()}</td>
                        <td className="p-2">{item.gstPercent}%</td>
                        <td className="p-2 text-right">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>₹{selectedInvoice.cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>₹{selectedInvoice.sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{selectedInvoice.igst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight Charges:</span>
                    <span>₹{selectedInvoice.freightCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-[#FB6514]">₹{selectedInvoice.grandTotal.toLocaleString()}</span>
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

export default InvoiceManagement;
