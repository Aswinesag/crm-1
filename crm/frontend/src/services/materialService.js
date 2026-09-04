import axios from "axios";

const API =
  "http://localhost:5002/api/materials";

export const getAllMaterials = async () => {

  const response =
    await axios.get(API);

  return response.data;

};