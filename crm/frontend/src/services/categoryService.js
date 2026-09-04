import axios from "axios";

const API_URL =
  "http://localhost:5002/api/categories";

export const getCategories = async (
  page = 1,
  limit = 10,
  search = ""
) => {

  const response =
    await axios.get(API_URL, {
      params: {
        page,
        limit,
        search
      }
    });

  return response.data;
};

export const createCategory = async (
  data
) => {

  const response =
    await axios.post(
      API_URL,
      data
    );

  return response.data;
};

export const updateCategory = async (
  id,
  data
) => {

  const response =
    await axios.put(
      `${API_URL}/${id}`,
      data
    );

  return response.data;
};

export const deleteCategory = async (
  id
) => {

  const response =
    await axios.delete(
      `${API_URL}/${id}`
    );

  return response.data;
};