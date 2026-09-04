import axiosInstance from "../api/axiosInstance.jsx";

let checkoutLoader;

export const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (checkoutLoader) return checkoutLoader;

  checkoutLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay Checkout failed to load")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay Checkout failed to load"));
    document.body.appendChild(script);
  });
  return checkoutLoader;
};

export const createRazorpayOrder = async (payload) => {
  const response = await axiosInstance.post("/payments/razorpay/order", payload);
  return response.data.data;
};

export const verifyRazorpayPayment = async (payload) => {
  const response = await axiosInstance.post("/payments/razorpay/verify", payload);
  return response.data.data;
};

export const getPayments = async (params = {}) => {
  const response = await axiosInstance.get("/payments", { params });
  return response.data;
};
