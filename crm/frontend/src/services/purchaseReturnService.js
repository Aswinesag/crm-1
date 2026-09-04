import axios from "axios";

const API_URL = "http://localhost:5002/api/purchase-returns";

// ======================================================
// Get All Purchase Returns
// ======================================================
export const getPurchaseReturns = async () =>
{
    try
    {
        const response = await axios.get(API_URL);
        return response.data;
    }
    catch (error)
    {
        console.error("Error fetching Purchase Returns:", error);
        throw error;
    }
};

// ======================================================
// Get Purchase Return By ID
// ======================================================
export const getPurchaseReturnById = async (id) =>
{
    try
    {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    }
    catch (error)
    {
        console.error("Error fetching Purchase Return:", error);
        throw error;
    }
};

// ======================================================
// Create Purchase Return
// ======================================================
export const createPurchaseReturn = async (purchaseReturnData) =>
{
    try
    {
        const response = await axios.post(API_URL, purchaseReturnData);
        return response.data;
    }
    catch (error)
    {
        console.error("Error creating Purchase Return:", error);
        throw error;
    }
};

// ======================================================
// Update Purchase Return
// ======================================================
export const updatePurchaseReturn = async (id, purchaseReturnData) =>
{
    try
    {
        const response = await axios.put(
            `${API_URL}/${id}`,
            purchaseReturnData
        );

        return response.data;
    }
    catch (error)
    {
        console.error("Error updating Purchase Return:", error);
        throw error;
    }
};

// ======================================================
// Delete Purchase Return
// ======================================================
export const deletePurchaseReturn = async (id) =>
{
    try
    {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    }
    catch (error)
    {
        console.error("Error deleting Purchase Return:", error);
        throw error;
    }
};