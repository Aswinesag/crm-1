import axios from "axios";

//=====================================================
// API URLs
//=====================================================

const API_URL =
  "http://localhost:5002/api/supplier-payments";

const VENDOR_API =
  "http://localhost:5002/api/vendors";

//=====================================================
// Get Supplier Payments
//=====================================================

export const getSupplierPayments = (
  page = 1,
  limit = 10,
  search = ""
) =>
{
  return axios.get(
    `${API_URL}?page=${page}&limit=${limit}&search=${search}`
  );
};

//=====================================================
// Create Supplier Payment
//=====================================================

export const createSupplierPayment = (
  data
) =>
{
  return axios.post(
    API_URL,
    data
  );
};

//=====================================================
// Update Supplier Payment
//=====================================================

export const updateSupplierPayment = (
  id,
  data
) =>
{
  return axios.put(
    `${API_URL}/${id}`,
    data
  );
};

//=====================================================
// Delete Supplier Payment
//=====================================================

export const deleteSupplierPayment = (
  id
) =>
{
  return axios.delete(
    `${API_URL}/${id}`
  );
};

//=====================================================
// Get All Vendors
//=====================================================

export const getAllVendors = () =>
{
  return axios.get(
    VENDOR_API
  );
};