import axiosInstance from "../api/axiosInstance.jsx";
export const getPlans = async () => (await axiosInstance.get("/subscriptions/plans")).data.data;
export const getSubscriptions = async () => (await axiosInstance.get("/subscriptions")).data.data;
export const purchaseSubscription = async (payload) => (await axiosInstance.post("/subscriptions/purchase", payload)).data.data;
export const renewSubscription = async (id, payload) => (await axiosInstance.post(`/subscriptions/${id}/renew`, payload)).data.data;
export const getSubscriptionReminders = async () => (await axiosInstance.get("/subscriptions/reminders")).data.data;
