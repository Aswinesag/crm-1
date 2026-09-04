import axiosInstance from "../api/axiosInstance.jsx";

export const getInvoices = async (params = {}) => {
  const response = await axiosInstance.get("/invoices", { params });
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await axiosInstance.get(`/invoices/${id}`);
  return response.data.data;
};

export const createInvoice = async (payload) => {
  const response = await axiosInstance.post("/invoices", payload);
  return response.data.data;
};

export const updateInvoice = async (id, payload) => {
  const response = await axiosInstance.put(`/invoices/${id}`, payload);
  return response.data.data;
};

export const deleteInvoice = async (id) => {
  const response = await axiosInstance.delete(`/invoices/${id}`);
  return response.data;
};
