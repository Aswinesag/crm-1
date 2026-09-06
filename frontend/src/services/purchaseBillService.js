import axiosInstance from "../api/axiosInstance.jsx";

export const getPurchaseBills = async (params = {}) => (await axiosInstance.get("/purchase-bills", { params })).data;
export const getPurchaseBill = async (id) => (await axiosInstance.get(`/purchase-bills/${id}`)).data.data;
export const createPurchaseBill = async (data) => (await axiosInstance.post("/purchase-bills", data)).data.data;
export const updatePurchaseBill = async (id, data) => (await axiosInstance.put(`/purchase-bills/${id}`, data)).data.data;
export const deletePurchaseBill = async (id) => (await axiosInstance.delete(`/purchase-bills/${id}`)).data;
export const previewPurchaseBill = async (data) => (await axiosInstance.post("/purchase-bills/match-preview", data)).data.data;
export const submitPurchaseBill = async (id) => (await axiosInstance.post(`/purchase-bills/${id}/submit`)).data.data;
export const rematchPurchaseBill = async (id) => (await axiosInstance.post(`/purchase-bills/${id}/rematch`)).data.data;
export const approvePurchaseBill = async (id) => (await axiosInstance.post(`/purchase-bills/${id}/approve`)).data.data;
export const approvePurchaseBillException = async (id, reason) => (await axiosInstance.post(`/purchase-bills/${id}/approve-exception`, { reason })).data.data;
export const rejectPurchaseBill = async (id, reason) => (await axiosInstance.post(`/purchase-bills/${id}/reject`, { reason })).data.data;
