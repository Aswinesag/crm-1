import axios from "axios";

const API_URL = "http://localhost:5002/api/grns";

export const getGoodsReceiptNotes = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getGoodsReceiptNoteById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

export const createGoodsReceiptNote = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

export const updateGoodsReceiptNote = (
  id,
  data
) => {
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

export const deleteGoodsReceiptNote = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

export const activateGoodsReceiptNote = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/activate`
  );
};

export const deactivateGoodsReceiptNote = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/deactivate`
  );
};