import axios from "axios";

const API_URL =
  "http://localhost:5002/api/purchase-requisitions";

// ===============================
// Get All Purchase Requisitions
// ===============================
export const getPurchaseRequisitions = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

// ===============================
// Get Single Purchase Requisition
// ===============================
export const getPurchaseRequisitionById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

// ===============================
// Create Purchase Requisition
// ===============================
export const createPurchaseRequisition = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

// ===============================
// Update Purchase Requisition
// ===============================
export const updatePurchaseRequisition = (
  id,
  data
) => {
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

// ===============================
// Delete Purchase Requisition
// ===============================
export const deletePurchaseRequisition = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

// ===============================
// Approve Purchase Requisition
// ===============================
export const approvePurchaseRequisition = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/approve`
  );
};

// ===============================
// Reject Purchase Requisition
// ===============================
export const rejectPurchaseRequisition = (
  id,
  remarks = ""
) => {
  return axios.patch(
    `${API_URL}/${id}/reject`,
    {
      remarks,
    }
  );
};