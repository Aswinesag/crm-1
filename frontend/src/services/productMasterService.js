import axiosInstance from "../api/axiosInstance.jsx";

export const listMasterRecords = async (resource, params = {}) => (await axiosInstance.get(`/${resource}`, { params })).data;
export const createMasterRecord = async (resource, payload) => (await axiosInstance.post(`/${resource}`, payload)).data;
export const updateMasterRecord = async (resource, id, payload) => (await axiosInstance.put(`/${resource}/${id}`, payload)).data;
export const deactivateMasterRecord = async (resource, id) => (await axiosInstance.delete(`/${resource}/${id}`)).data;
export const changeMasterStatus = async (resource, id, status) => (await axiosInstance.patch(`/${resource}/${id}/status`, { status })).data;
