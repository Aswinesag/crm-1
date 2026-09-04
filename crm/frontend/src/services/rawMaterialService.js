import axios from "axios";

const API_URL =
  "http://localhost:5002/api/raw-materials";

/*
=========================================
GET ALL RAW MATERIALS
GET /api/raw-materials
=========================================
*/
export const getRawMaterials = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

/*
=========================================
GET RAW MATERIAL BY ID
GET /api/raw-materials/:id
=========================================
*/
export const getRawMaterialById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

/*
=========================================
CREATE RAW MATERIAL
POST /api/raw-materials
=========================================
*/
export const createRawMaterial = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

/*
=========================================
UPDATE RAW MATERIAL
PUT /api/raw-materials/:id
=========================================
*/
export const updateRawMaterial = (
  id,
  data
) => {
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

/*
=========================================
DELETE RAW MATERIAL
DELETE /api/raw-materials/:id
=========================================
*/
export const deleteRawMaterial = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

/*
=========================================
ACTIVATE RAW MATERIAL
PATCH /api/raw-materials/:id/activate
=========================================
*/
export const activateRawMaterial = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/activate`
  );
};

/*
=========================================
DEACTIVATE RAW MATERIAL
PATCH /api/raw-materials/:id/deactivate
=========================================
*/
export const deactivateRawMaterial = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/deactivate`
  );
};