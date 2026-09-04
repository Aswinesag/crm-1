import axiosInstance from "../api/axiosInstance.jsx";

const endpoint = (resource) => resource === "warehouses" ? "/warehouses" : `/product-settings/${resource}`;

export const listSettings = async (resource, params = {}) =>
  (await axiosInstance.get(endpoint(resource), { params })).data;

export const createSetting = async (resource, payload) =>
  (await axiosInstance.post(endpoint(resource), payload)).data;

export const updateSetting = async (resource, id, payload) =>
  (await axiosInstance.put(`${endpoint(resource)}/${id}`, payload)).data;

export const deleteSetting = async (resource, id) =>
  (await axiosInstance.delete(`${endpoint(resource)}/${id}`)).data;
