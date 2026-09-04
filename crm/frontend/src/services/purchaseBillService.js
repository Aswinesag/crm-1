import axios from "axios";

// ==============================================
// Base URL
// ==============================================

const API_URL = "http://localhost:5002/api/purchase-bills";

// ==============================================
// Get All Purchase Bills
// GET /api/purchase-bills
// ==============================================

export const getPurchaseBills = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page,
        limit,
        search,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get Purchase Bills Error :", error);

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to fetch Purchase Bills",
      }
    );
  }
};

// ==============================================
// Get Purchase Bill By ID
// GET /api/purchase-bills/:id
// ==============================================

export const getPurchaseBillById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);

    return response.data;
  } catch (error) {
    console.error("Get Purchase Bill Error :", error);

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to fetch Purchase Bill",
      }
    );
  }
};

// ==============================================
// Create Purchase Bill
// POST /api/purchase-bills
// ==============================================

export const createPurchaseBill = async (purchaseBillData) => {
  try {
    const response = await axios.post(API_URL, purchaseBillData);

    return response.data;
  } catch (error) {
    console.error("Create Purchase Bill Error :", error);

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to create Purchase Bill",
      }
    );
  }
};

// ==============================================
// Update Purchase Bill
// PUT /api/purchase-bills/:id
// ==============================================

export const updatePurchaseBill = async (id, purchaseBillData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}`,
      purchaseBillData
    );

    return response.data;
  } catch (error) {
    console.error("Update Purchase Bill Error :", error);

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to update Purchase Bill",
      }
    );
  }
};

// ==============================================
// Delete Purchase Bill
// DELETE /api/purchase-bills/:id
// ==============================================

export const deletePurchaseBill = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);

    return response.data;
  } catch (error) {
    console.error("Delete Purchase Bill Error :", error);

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to delete Purchase Bill",
      }
    );
  }
};