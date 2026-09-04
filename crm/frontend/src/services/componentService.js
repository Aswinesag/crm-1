import axios from "axios";

const API_URL =
  "http://localhost:5002/api/components";

/*
=========================================
GET ALL COMPONENTS
GET /api/components
=========================================
*/
export const getComponents = (
  page = 1,
  limit = 10,
  search = ""
) => {
  return axios.get(
    API_URL,
    {
      params: {
        page,
        limit,
        search,
      },
    }
  );
};

/*
=========================================
GET COMPONENT BY ID
GET /api/components/:id
=========================================
*/
export const getComponentById = (
  id
) => {
  return axios.get(
    `${API_URL}/${id}`
  );
};

/*
=========================================
CREATE COMPONENT
POST /api/components
=========================================
*/
export const createComponent = (
  componentData
) => {
  return axios.post(
    API_URL,
    componentData
  );
};

/*
=========================================
UPDATE COMPONENT
PUT /api/components/:id
=========================================
*/
export const updateComponent = (
  id,
  componentData
) => {
  return axios.put(
    `${API_URL}/${id}`,
    componentData
  );
};

/*
=========================================
ACTIVATE COMPONENT
PUT /api/components/:id/activate
=========================================
*/
export const activateComponent = (
  id
) => {
  return axios.put(
    `${API_URL}/${id}/activate`
  );
};

/*
=========================================
DEACTIVATE COMPONENT
PUT /api/components/:id/deactivate
=========================================
*/
export const deactivateComponent = (
  id
) => {
  return axios.put(
    `${API_URL}/${id}/deactivate`
  );
};

/*
=========================================
DELETE COMPONENT
DELETE /api/components/:id
=========================================
*/
export const deleteComponent = (
  id
) => {
  return axios.delete(
    `${API_URL}/${id}`
  );
};