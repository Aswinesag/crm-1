import axios from "axios";

const API_URL = "http://localhost:5002/api/stock-outs";

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

export const createStockOut = async (stockOutData) => {
  const response = await axios.post(
    API_URL,
    stockOutData,
    getConfig()
  );

  return response.data;
};

export const getStockOuts = async (
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

export const getStockOutById = async (id) => {

  const response = await axios.get(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};

export const updateStockOut = async (
  id,
  stockOutData
) => {

  const response = await axios.put(
    `${API_URL}/${id}`,
    stockOutData,
    getConfig()
  );

  return response.data;
};

export const activateStockOut = async (id) => {

  const response = await axios.patch(
    `${API_URL}/${id}/activate`,
    {},
    getConfig()
  );

  return response.data;
};

export const deactivateStockOut = async (id) => {

  const response = await axios.patch(
    `${API_URL}/${id}/deactivate`,
    {},
    getConfig()
  );

  return response.data;
};

export const deleteStockOut = async (id) => {

  const response = await axios.delete(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};