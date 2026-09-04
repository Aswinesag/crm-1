import axios from "axios";

const API_URL = "http://localhost:5002/api/stock-audits";

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
// CREATE STOCK AUDIT
// ===========================================
export const createStockAudit = async (auditData) => {
  const response = await axios.post(
    API_URL,
    auditData,
    getConfig()
  );

  return response.data;
};

// ===========================================
// GET ALL STOCK AUDITS
// ===========================================
export const getStockAudits = async () => {
  const response = await axios.get(
    API_URL,
    getConfig()
  );

  return response.data;
};

// ===========================================
// GET STOCK AUDIT BY ID
// ===========================================
export const getStockAuditById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};

// ===========================================
// UPDATE STOCK AUDIT
// ===========================================
export const updateStockAudit = async (id, auditData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    auditData,
    getConfig()
  );

  return response.data;
};

// ===========================================
// DELETE STOCK AUDIT
// ===========================================
export const deleteStockAudit = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getConfig()
  );

  return response.data;
};