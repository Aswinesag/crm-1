import axios from "axios";

const API_URL =
  "http://localhost:5002/api/request-for-quotations";

// =====================================
// Get All RFQs
// =====================================
export const getRFQs = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

// =====================================
// Get RFQ By ID
// =====================================
export const getRFQById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

// =====================================
// Create RFQ
// =====================================
export const createRFQ = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

// =====================================
// Update RFQ
// =====================================
export const updateRFQ = (
  id,
  data
) => {
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

// =====================================
// Delete RFQ
// =====================================
export const deleteRFQ = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

// =====================================
// Approve RFQ
// =====================================
export const approveRFQ = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/approve`
  );
};

// =====================================
// Reject RFQ
// =====================================
export const rejectRFQ = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/reject`
  );
};

// =====================================
// Close RFQ
// =====================================
export const closeRFQ = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/close`
  );
};