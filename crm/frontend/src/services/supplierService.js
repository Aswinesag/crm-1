import axios from "axios";

const API_URL =
  "http://localhost:5002/api/suppliers";

/*
=========================================
GET ALL SUPPLIERS
GET /api/suppliers
=========================================
*/
export const getSuppliers = (
  page = 1,
  limit = 1000,
  search = ""
) => {
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

/*
=========================================
GET SUPPLIER BY ID
GET /api/suppliers/:id
=========================================
*/
export const getSupplierById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

/*
=========================================
CREATE SUPPLIER
POST /api/suppliers
=========================================
*/
export const createSupplier = (
  data
) => {
  return axios.post(
    API_URL,
    data
  );
};

/*
=========================================
UPDATE SUPPLIER
PUT /api/suppliers/:id
=========================================
*/
export const updateSupplier = (
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
DELETE SUPPLIER
DELETE /api/suppliers/:id
=========================================
*/
export const deleteSupplier = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};

/*
=========================================
ACTIVATE SUPPLIER
PATCH /api/suppliers/:id/activate
=========================================
*/
export const activateSupplier = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/activate`
  );
};

/*
=========================================
DEACTIVATE SUPPLIER
PATCH /api/suppliers/:id/deactivate
=========================================
*/
export const deactivateSupplier = (
  id
) => {
  return axios.patch(
    `${API_URL}/${id}/deactivate`
  );
};