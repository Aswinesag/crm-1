import axiosInstance from "./axiosInstance";

export const updateTicketStatus = async (id, status) => {
  const res = await axiosInstance.put(`/tickets/${id}`, { status });
  return res.data;
};