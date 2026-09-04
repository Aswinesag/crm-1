import axios from "axios";

const API_URL = "http://localhost:5002/api/reorder-alerts";

// ===========================================
// GET TOKEN
// ===========================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ===========================================
// GET CONFIG
// ===========================================

const getConfig = () => {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  };
};

// ===========================================
// GET ALL REORDER ALERTS
// ===========================================

export const getReorderAlerts = async () => {

  const response = await axios.get(
    API_URL,
    getConfig()
  );

  return response.data;

};