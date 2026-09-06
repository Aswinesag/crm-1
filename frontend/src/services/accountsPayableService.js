import axiosInstance from "../api/axiosInstance.jsx";
export const getAccountsPayable = async (params = {}) => (await axiosInstance.get("/accounts-payable", { params })).data;
export const getAccountsPayableDetail = async (id) => (await axiosInstance.get(`/accounts-payable/${id}`)).data.data;
export const getAccountsPayableSummary = async () => (await axiosInstance.get("/accounts-payable/summary")).data.data;
export const getAccountsPayableAging = async (params = {}) => (await axiosInstance.get("/accounts-payable/aging", { params })).data.data;
