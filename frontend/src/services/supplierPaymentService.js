import axiosInstance from "../api/axiosInstance.jsx";
export const getSupplierPayments = async (params = {}) => (await axiosInstance.get("/supplier-payments", { params })).data;
export const getSupplierPayment = async (id) => (await axiosInstance.get(`/supplier-payments/${id}`)).data.data;
export const previewSupplierPayment = async (data) => (await axiosInstance.post("/supplier-payments/preview", data)).data.data;
export const recordSupplierPayment = async (data) => (await axiosInstance.post("/supplier-payments", data)).data;
export const reverseSupplierPayment = async (id, reason) => (await axiosInstance.post(`/supplier-payments/${id}/reverse`, { reason })).data;
