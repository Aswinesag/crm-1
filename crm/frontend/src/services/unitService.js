import axios from "axios";

const API_URL = "http://localhost:5002/api/units";

/*
|--------------------------------------------------------------------------
| Get All Units
|--------------------------------------------------------------------------
*/

export const getUnits = (
  page = 1,
  limit = 1000,
  search = ""
) => {

  let url = `${API_URL}?page=${page}&limit=${limit}`;

  if (search.trim()) {
    url += `&keyword=${search}`;
  }

  return axios.get(url);
};

/*
|--------------------------------------------------------------------------
| Get Single Unit
|--------------------------------------------------------------------------
*/

export const getUnitById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

/*
|--------------------------------------------------------------------------
| Create Unit
|--------------------------------------------------------------------------
*/

export const createUnit = (data) => {
  return axios.post(API_URL, data);
};

/*
|--------------------------------------------------------------------------
| Update Unit
|--------------------------------------------------------------------------
*/

export const updateUnit = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

/*
|--------------------------------------------------------------------------
| Delete Unit
|--------------------------------------------------------------------------
*/

export const deleteUnit = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

/*
|--------------------------------------------------------------------------
| Search Units
|--------------------------------------------------------------------------
*/

export const searchUnits = (keyword) => {
  return axios.get(
    `${API_URL}/search?keyword=${keyword}`
  );
};

/*
|--------------------------------------------------------------------------
| Change Status
|--------------------------------------------------------------------------
*/

export const changeUnitStatus = (
  id,
  status
) => {
  return axios.patch(
    `${API_URL}/${id}/status`,
    {
      status,
    }
  );
};