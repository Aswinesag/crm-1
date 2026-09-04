import axios from "axios";

const API_URL = "http://localhost:5002/api/stock-transfers";

const getToken = () => {
  return localStorage.getItem("token");
};

const getConfig = () => {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  };
};

// ===========================================
// CREATE STOCK TRANSFER
// ===========================================

export const createStockTransfer = async (transferData) => {

  const response = await axios.post(
    API_URL,
    transferData,
    getConfig()
  );

  return response.data;

};

// ===========================================
// GET ALL STOCK TRANSFERS
// ===========================================

export const getStockTransfers = async (
  page = 1,
  limit = 10,
  search = ""
) => {

  const response = await axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`,
    getConfig()
  );

  return response.data;

};

// ===========================================
// GET SINGLE STOCK TRANSFER
// ===========================================

export const getStockTransferById = async (id) => {

  const response = await axios.get(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;

};

// ===========================================
// DELETE STOCK TRANSFER
// ===========================================

export const deleteStockTransfer = async (id) => {

  const response = await axios.delete(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;

};