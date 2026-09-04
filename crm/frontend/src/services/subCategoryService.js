import axios from "axios";

const API =
"http://localhost:5002/api/subcategories";

export const getSubCategories =
(
  page = 1,
  limit = 10,
  keyword = ""
) =>
  axios.get(
    `${API}?page=${page}&limit=${limit}&keyword=${keyword}`
  );

export const createSubCategory = (data) =>
  axios.post(API, data);

export const updateSubCategory = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteSubCategory = (id) =>
  axios.delete(`${API}/${id}`);

export const searchSubCategories = (keyword) =>
  axios.get(`${API}/search?keyword=${keyword}`);

export const changeStatus = (id) =>
  axios.patch(`${API}/${id}/status`);