import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import { getPayments } from "../../services/paymentService.js";

const money = (value, currency = "INR") => new Intl.NumberFormat("en-IN", {
  style: "currency", currency,
}).format(Number(value) || 0);
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN") : "-";

const CustomerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getPayments({ limit: 100 });
      setPayments(result.data || []);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load payments";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const found = !query || [payment.receipt, payment.customerName, payment.invoiceNumber,
        payment.razorpayOrderId, payment.razorpayPaymentId]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return found && (!status || payment.status === status);
    });
  }, [payments, search, status]);

  const paid = payments.filter((payment) => payment.status === "Paid");
  const received = paid.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return <div className="mt-4">
    <Toaster />
    <div><Link to="/" className="hover:text-[#C2410C]">Dashboard</Link>{" / "}
      <span className="text-[#C2410C]">Billing & Finance / Customer Payments</span></div>

    <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
      <Card title="Total Payments" count={payments.length} bg="#FFF7ED" color="#C2410C" />
      <Card title="Verified Paid" count={paid.length} bg="#EAF1FA" color="#1C4CD2" />
      <Card title="Checkout Created" count={payments.filter((p) => p.status === "Created").length} bg="#FAF5FF" color="#7E22CE" />
      <Card title="Retryable" count={payments.filter((p) => p.status === "Retryable").length} bg="#FFF7ED" color="#C2410C" />
      <Card title="Total Received" count={money(received)} bg="#ECFDF5" color="#059669" />
    </div>

    <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-6 mt-6">
      <div className="relative w-full max-w-md">
        <IoIosSearch size={22} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="Search receipt, customer, invoice or Razorpay ID..."
          className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
      </div>
      <select value={status} onChange={(event) => setStatus(event.target.value)}
        className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500">
        <option value="">All Statuses</option><option value="Paid">Paid</option><option value="Created">Checkout Created</option><option value="Retryable">Retryable</option>
      </select>
    </div>

    <div className="overflow-x-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
      <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
        <thead className="bg-white text-gray-500 uppercase tracking-wider"><tr>
          {["Receipt", "Customer", "Invoice", "Date", "Amount", "Mode", "Status", "Action"].map((heading) =>
            <th key={heading} className="p-3 border-b border-gray-300">{heading}</th>)}
        </tr></thead>
        <tbody>
          {loading && <tr><td colSpan={8} className="p-4 text-center text-gray-500">Loading payments...</td></tr>}
          {!loading && error && <tr><td colSpan={8} className="p-4 text-center text-red-600">{error}{" "}<button className="underline" onClick={loadPayments}>Retry</button></td></tr>}
          {!loading && !error && filtered.map((payment) => <tr key={payment.id || payment._id} className="hover:bg-gray-50">
            <td className="p-3 border-b text-blue-700 font-medium">{payment.receipt}</td>
            <td className="p-3 border-b">{payment.customerName}</td><td className="p-3 border-b">{payment.invoiceNumber}</td>
            <td className="p-3 border-b">{date(payment.paidAt || payment.createdAt)}</td>
            <td className="p-3 border-b font-medium text-green-600">{money(payment.amount, payment.currency)}</td>
            <td className="p-3 border-b">Razorpay</td><td className="p-3 border-b">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "Paid" ? "bg-green-100 text-green-700" : payment.status === "Retryable" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>{payment.status}</span>
            </td><td className="p-3 border-b"><button aria-label="View payment" onClick={() => setSelected(payment)}><FiEye className="text-blue-500" /></button></td>
          </tr>)}
          {!loading && !error && filtered.length === 0 && <tr><td colSpan={8} className="p-4 text-center">No payment records found.</td></tr>}
        </tbody>
      </table>
    </div>

    {selected && <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md max-w-2xl w-full m-4 shadow-xl">
        <div className="flex justify-between mb-6"><h2 className="text-xl font-bold">Payment Details</h2><button onClick={() => setSelected(null)} className="text-2xl">×</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[['Receipt', selected.receipt], ['Status', selected.status], ['Invoice', selected.invoiceNumber], ['Customer', selected.customerName],
            ['Amount', money(selected.amount, selected.currency)], ['Paid At', date(selected.paidAt)], ['Last Reconciled', date(selected.lastReconciledAt)],
            ['Razorpay Order ID', selected.razorpayOrderId], ['Razorpay Payment ID', selected.razorpayPaymentId || '-']].map(([label, value]) =>
            <div key={label}><p className="text-sm text-gray-500">{label}</p><p className="break-all">{value}</p></div>)}
        </div>
        <div className="flex justify-end mt-6"><button onClick={() => setSelected(null)} className="px-6 py-2 border border-gray-400 rounded-md">Close</button></div>
      </div>
    </div>}
  </div>;
};

export default CustomerPayments;
