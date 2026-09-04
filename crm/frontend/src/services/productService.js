import axios from "axios";

const API_URL = "http://localhost:5002/api/products";

export const getProducts = async (
  page = 1,
  limit = 10,
  keyword = ""
) => {
  if (keyword) {
    const res = await axios.get(
      `${API_URL}/search?keyword=${keyword}`
    );
    return res.data;
  }

  const res = await axios.get(
    `${API_URL}?page=${page}&limit=${limit}`
  );

  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(
    `${API_URL}/${id}`
  );

  return res.data;
};

export const createProduct = async (productData) => {
  const res = await axios.post(
    API_URL,
    productData
  );

  return res.data;
};