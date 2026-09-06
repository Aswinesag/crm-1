import axiosInstance from "../api/axiosInstance.jsx";

export const getAllPurchaseOrders = async () => (await axiosInstance.get("/purchase-orders")).data.data;
export const getPurchaseOrderById = async (id) => (await axiosInstance.get(`/purchase-orders/${id}`)).data.data;
