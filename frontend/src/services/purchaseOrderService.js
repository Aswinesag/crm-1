import axios from "axios";

const API_URL =
  "http://localhost:5002/api/purchase-orders";

export const getAllPurchaseOrders =
  async () => {
    const res =
      await axios.get(API_URL);

    return res.data.data;
  };

export const getPurchaseOrderById =
  async (id) => {
    const res =
      await axios.get(
        `${API_URL}/${id}`
      );

    return res.data.data;
  };

