import axios from "axios";

const API =
  "http://localhost:5002/api/vendors";

export const getAllVendors =
  async () => {

    const response =
      await axios.get(API);

    return response.data;

};