import axios from "axios";

const API_URL = "http://localhost:5002/api/warehouses";

// Get All Warehouses
export const getWarehouses = () => {
  return axios.get(API_URL);
};

// Get Warehouse By ID
export const getWarehouseById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// Create Warehouse
export const createWarehouse = (data) => {
  return axios.post(API_URL, data);
};

// Update Warehouse
export const updateWarehouse = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

// Delete Warehouse
export const deleteWarehouse = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};