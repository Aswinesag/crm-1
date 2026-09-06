import axiosInstance from "../api/axiosInstance.jsx";
export const getAllPRs = async () => (await axiosInstance.get("/purchase-requisitions")).data;
export const getSinglePR = async (id) => (await axiosInstance.get(`/purchase-requisitions/${id}`)).data;
export const createPR = async (data) => (await axiosInstance.post("/purchase-requisitions", data)).data;
export const updatePRStatus = async (id, status) => (await axiosInstance.put(`/purchase-requisitions/${id}/status`, { status })).data;
export const createRFQFromPR = async (id, data) => (await axiosInstance.post(`/purchase-requisitions/${id}/rfq`, data)).data;
