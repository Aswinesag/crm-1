import axios from "axios";

const API_URL = "http://localhost:5002/api/hsn";

/*
|--------------------------------------------------------------------------
| Get All HSN Codes
|--------------------------------------------------------------------------
*/

export const getHSNCodes = (
  page = 1,
  limit = 10,
  gstPercentage = ""
) => {

  let url = `${API_URL}?page=${page}&limit=${limit}`;

  if (gstPercentage !== "") {
    url += `&gstPercentage=${gstPercentage}`;
  }

  return axios.get(url);

};

/*
|--------------------------------------------------------------------------
| Search HSN
|--------------------------------------------------------------------------
*/

export const searchHSN = (keyword) => {

  return axios.get(
    `${API_URL}/search?keyword=${keyword}`
  );

};

/*
|--------------------------------------------------------------------------
| Get HSN By ID
|--------------------------------------------------------------------------
*/

export const getHSNById = (id) => {

  return axios.get(
    `${API_URL}/${id}`
  );

};

/*
|--------------------------------------------------------------------------
| Create HSN
|--------------------------------------------------------------------------
*/

export const createHSN = (data) => {

  return axios.post(
    API_URL,
    data
  );

};

/*
|--------------------------------------------------------------------------
| Update HSN
|--------------------------------------------------------------------------
*/

export const updateHSN = (
  id,
  data
) => {

  return axios.put(
    `${API_URL}/${id}`,
    data
  );

};

/*
|--------------------------------------------------------------------------
| Delete HSN
|--------------------------------------------------------------------------
*/

export const deleteHSN = (id) => {

  return axios.delete(
    `${API_URL}/${id}`
  );

};