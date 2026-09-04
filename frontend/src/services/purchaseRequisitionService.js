import axios from "axios";

const API =
  "http://localhost:5002/api/purchase-requisitions";

export const getAllPRs = () =>
  axios.get(API);

export const getSinglePR = (id) =>
  axios.get(`${API}/${id}`);

export const createPR = (data) =>
  axios.post(API, data);

export const updatePRStatus = (
  id,
  data
) =>
  axios.put(
    `${API}/${id}/status`,
    data
  );