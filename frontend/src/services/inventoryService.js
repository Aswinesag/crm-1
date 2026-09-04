import axiosInstance from "../api/axiosInstance.jsx";
export const getInventory = async (params = {}) => (await axiosInstance.get("/inventory", { params })).data;
export const getTransactions = async (params = {}) => (await axiosInstance.get("/inventory/transactions", { params })).data;
export const getAudits = async (params = {}) => (await axiosInstance.get("/inventory/audits", { params })).data;
export const getReorderAlerts = async (params = {}) => (await axiosInstance.get("/inventory/reorder-alerts", { params })).data;
export const stockIn = async (payload) => (await axiosInstance.post("/inventory/stock-in", payload)).data;
export const stockOut = async (payload) => (await axiosInstance.post("/inventory/stock-out", payload)).data;
export const transferStock = async (payload) => (await axiosInstance.post("/inventory/transfer", payload)).data;
export const auditStock = async (payload) => (await axiosInstance.post("/inventory/audit", payload)).data;
