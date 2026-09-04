import React, { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiChevronDown, FiCreditCard, FiLoader } from "react-icons/fi";
import { getPlans, getSubscriptions, purchaseSubscription, renewSubscription } from "../../services/subscriptionService.js";
import { createRazorpayOrder, loadRazorpayCheckout, verifyRazorpayPayment } from "../../services/paymentService.js";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-gray-800 outline-none transition duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";
const fields = [["customerName", "Customer name", "text"], ["customerEmail", "Customer email", "email"], ["customerContact", "Contact number", "tel"], ["gstin", "GSTIN", "text"], ["billingAddress", "Billing address", "text"]];

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ planId: "", customerName: "", customerEmail: "", customerContact: "", gstin: "", billingAddress: "" });

  const load = useCallback(async () => {
    try {
      const [planData, subscriptionData] = await Promise.all([getPlans(), getSubscriptions()]);
      setPlans(planData); setSubscriptions(subscriptionData);
      setForm((current) => ({ ...current, planId: current.planId || planData[0]?._id || "" }));
    } catch (error) { toast.error(error.response?.data?.message || "Unable to load subscriptions"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const payInvoice = async (invoice) => {
    await loadRazorpayCheckout();
    const order = await createRazorpayOrder({ invoiceId: invoice._id || invoice.id });
    new window.Razorpay({ key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
      name: "CRM Subscription", description: order.invoiceNumber,
      prefill: { name: order.customerName, email: order.customerEmail, contact: order.customerContact },
      handler: async (result) => { await verifyRazorpayPayment({ razorpay_order_id: result.razorpay_order_id, razorpay_payment_id: result.razorpay_payment_id, razorpay_signature: result.razorpay_signature }); await load(); toast.success("Subscription payment verified"); },
      theme: { color: "#FB6514" } }).open();
  };
  const purchase = async (event) => {
    event.preventDefault(); if (!form.planId || creating) return; setCreating(true);
    try { const result = await purchaseSubscription(form); await payInvoice(result.invoice); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to create subscription"); }
    finally { setCreating(false); }
  };
  const renew = async (subscription) => {
    try { const result = await renewSubscription(subscription._id, { planId: subscription.plan?._id || subscription.plan, billingAddress: "Existing customer address" }); await payInvoice(result.invoice); }
    catch (error) { toast.error(error.response?.data?.message || "Unable to initiate renewal"); }
  };

  return <div className="mt-4 pb-8"><Toaster />
    <h1 className="text-2xl font-bold text-gray-900">Subscriptions & Renewals</h1>
    <p className="mt-1 text-sm text-gray-500">Create fixed-term subscriptions and manage customer renewals.</p>

    {plans.length > 0 && <div className="mt-5 grid gap-4 md:grid-cols-2">{plans.map((plan) =>
      <button type="button" key={plan._id} onClick={() => setForm({ ...form, planId: plan._id })} className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${form.planId === plan._id ? "border-orange-400 ring-2 ring-orange-100" : "border-gray-200"}`}>
        <div className="flex justify-between"><div><h2 className="font-semibold text-gray-900">{plan.name}</h2><p className="mt-1 text-sm text-gray-500">{plan.durationMonths === 6 ? "6 Months" : "1 Year"}</p></div><p className="text-xl font-bold text-orange-600">{money(plan.amount)}</p></div>
      </button>)}</div>}

    <form onSubmit={purchase} className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-semibold text-gray-900">Create Subscription</h2>
      <p className="mt-1 text-sm text-gray-500">Choose a plan and enter the customer billing information.</p>
      {!loading && plans.length === 0 && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><b>No active subscription plans.</b> Create a 6-month or 1-year plan before starting a subscription.</div>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label><span className="mb-1.5 block text-sm font-medium text-gray-700">Subscription plan</span><div className="relative">
          <select required disabled={loading || !plans.length} value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className={`${inputClass} appearance-none pr-11 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}>
            <option value="">{loading ? "Loading plans..." : plans.length ? "Select a subscription plan" : "No active plans available"}</option>
            {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name} — {plan.durationMonths === 6 ? "6 Months" : "1 Year"} — {money(plan.amount)}</option>)}
          </select><FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div></label>
        {fields.map(([key, label, type]) => <label key={key}><span className="mb-1.5 block text-sm font-medium text-gray-700">{label}{["customerName", "customerEmail", "billingAddress"].includes(key) && <span className="text-red-500"> *</span>}</span><input type={type} required={["customerName", "customerEmail", "billingAddress"].includes(key)} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={`Enter ${label.toLowerCase()}`} className={inputClass} /></label>)}
      </div>
      <button disabled={!plans.length || creating} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:hover:translate-y-0 md:w-auto md:min-w-64">
        {creating ? <><FiLoader className="animate-spin" />Creating invoice...</> : <><FiCreditCard />Create Invoice & Pay</>}
      </button>
    </form>

    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"><table className="w-full"><thead className="bg-gray-50 text-sm text-gray-600"><tr>{["Customer", "Plan", "Status", "Start", "Expiry", "Action"].map((heading) => <th key={heading} className="p-4 text-left font-semibold">{heading}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading subscriptions...</td></tr> : subscriptions.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-gray-500">No subscriptions created yet.</td></tr> : subscriptions.map((subscription) => <tr key={subscription._id} className="border-t border-gray-100 transition hover:bg-orange-50/40"><td className="p-4 font-medium text-gray-900">{subscription.customerName}<br/><span className="text-xs font-normal text-gray-500">{subscription.customerEmail}</span></td><td>{subscription.planName}</td><td><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">{subscription.status}</span></td><td>{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "-"}</td><td>{subscription.expiryDate ? new Date(subscription.expiryDate).toLocaleDateString() : "-"}</td><td><button onClick={() => renew(subscription)} disabled={!!subscription.nextRenewalInvoice} className="rounded-md px-3 py-1.5 font-medium text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:text-gray-400">Renew</button></td></tr>)}
    </tbody></table></div>
  </div>;
};
export default Subscriptions;
