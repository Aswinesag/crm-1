import axiosInstance from "../api/axiosInstance.jsx";
export const createRFQ = async (data) => (await axiosInstance.post("/rfqs", data)).data;
export const getAllRFQs = async (_page = 1, _search = "", status = "") => (await axiosInstance.get("/rfqs", { params: { status } })).data;
export const getRFQById = async (id) => (await axiosInstance.get(`/rfqs/${id}`)).data;
export const sendRFQ = async (id) => (await axiosInstance.put(`/rfqs/${id}/send`)).data;
export const submitRFQQuotation = async (id, data) => (await axiosInstance.put(`/rfqs/${id}/quotation`, data)).data;
export const createPOFromRFQ = async (id, data) => (await axiosInstance.post(`/rfqs/${id}/purchase-order`, data)).data;
