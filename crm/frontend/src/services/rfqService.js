import axios from "axios";

const API_URL =
  "http://localhost:5002/api/rfqs";

export const createRFQ =
  async (rfqData) => {

    const response =
      await axios.post(
        API_URL,
        rfqData
      );

    return response.data;
};

export const getAllRFQs = async (
  page = 1,
  search = "",
  status = ""
) => {

  const response =
    await axios.get(API_URL, {
      params: {
        page,
        search,
        status,
      },
    });

  return response.data;
};

export const getRFQById =
  async (id) => {

    const response =
      await axios.get(
        `${API_URL}/${id}`
      );

    return response.data;
};