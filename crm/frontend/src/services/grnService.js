import axios from "axios";

const API_URL =
  "http://localhost:5002/api/grns";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${
      localStorage.getItem("token")
    }`,
  },
});

export const getAllGRNs = async () => {
  const res = await axios.get(
    API_URL,
    getConfig()
  );

  return res.data;
};

export const getGRNById = async (id) => {
  const res = await axios.get(
    `${API_URL}/${id}`,
    getConfig()
  );

  return res.data;
};

export const createGRN = async (
  data
) => {
  const res = await axios.post(
    API_URL,
    data,
    getConfig()
  );

  return res.data;
};

export const updateGRN = async (
  id,
  data
) => {
  const res = await axios.put(
    `${API_URL}/${id}`,
    data,
    getConfig()
  );

  return res.data;
};

export const deleteGRN = async (
  id
) => {
  const res = await axios.delete(
    `${API_URL}/${id}`,
    getConfig()
  );

  return res.data;
};