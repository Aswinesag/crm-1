import axiosInstance from "../api/axiosInstance.jsx";
export const getAllVendors = async () => (await axiosInstance.get("/vendors")).data;
