import axiosInstance from "./axiosInstance";

export const fetchTickets = async () => {
  const res = await axiosInstance.get("/tickets");
  return res.data.tickets;
};