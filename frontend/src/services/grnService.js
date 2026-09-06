import axiosInstance from "../api/axiosInstance.jsx";

export const getAllGRNs = async () => (await axiosInstance.get("/grns")).data;
export const getGRNById = async (id) => (await axiosInstance.get(`/grns/${id}`)).data;
export const createGRN = async (data) => (await axiosInstance.post("/grns", data)).data;
export const updateGRN = async (id, data) => (await axiosInstance.put(`/grns/${id}`, data)).data;
export const deleteGRN = async (id) => (await axiosInstance.delete(`/grns/${id}`)).data;
export const postGRN = async (id) => (await axiosInstance.post(`/grns/${id}/post`)).data;
export const reverseGRN = async (id, reason) => (await axiosInstance.post(`/grns/${id}/reverse`, { reason })).data;
