import axiosInstance from "./axiosInstance";

export const getERPSummary = async () => {
  const response =
    await axiosInstance.get(
      "/erp-dashboard/summary"
    );

  return response.data;
};

export const getPurchaseSummary =
  async () => {
    const response =
      await axiosInstance.get(
        "/erp-dashboard/purchase-summary"
      );

    return response.data;
  };

export const getWarehouseSummary =
  async () => {
    const response =
      await axiosInstance.get(
        "/erp-dashboard/warehouse-summary"
      );

    return response.data;
  };

export const getTopVendors =
  async () => {
    const response =
      await axiosInstance.get(
        "/erp-dashboard/top-vendors"
      );

    return response.data;
  };