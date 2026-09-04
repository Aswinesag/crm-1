import axios from "axios";

const API_URL =
  "http://localhost:5002/api/brands";

export const getBrands = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

export const createBrand = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

export const updateBrand = (
  id,
  data
) => {
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

export const deleteBrand = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

export const activateBrand = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/activate`
  );
};

export const deactivateBrand = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/deactivate`
  );
};