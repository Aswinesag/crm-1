import axios from "axios";

const API_URL =
  "http://localhost:5002/api/purchase-orders";

// ======================================
// Get All Purchase Orders
// ======================================

export const getPurchaseOrders = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

// ======================================
// Get Purchase Order By ID
// ======================================

export const getPurchaseOrderById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

// ======================================
// Create Purchase Order
// ======================================

export const createPurchaseOrder = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

// ======================================
// Update Purchase Order
// ======================================

export const updatePurchaseOrder = (
  id,
  data
) => {
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

// ======================================
// Delete Purchase Order
// ======================================

export const deletePurchaseOrder = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

// ======================================
// Update Purchase Order Status
// ======================================

export const updatePurchaseOrderStatus = (
  id,
  status
) => {
  return axios.patch(
    `${API_URL}/${id}/status`,
    {
      status,
    }
  );
};