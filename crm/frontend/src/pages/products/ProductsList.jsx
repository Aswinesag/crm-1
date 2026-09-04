import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { IoIosSearch } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";
import Card from "../../components/Card";
import {
  getProducts,
  deleteProduct
} from "../../services/productService";


const ProductsList = () => { 

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const totalProducts = products.length;

  const rawMaterials = products.filter(
    (p) => p.productType === "Raw Material"
  ).length;

  const finishedProducts = products.filter(
    (p) => p.productType === "Finished Product"
  ).length;

  const activeProducts = products.filter(
    (p) => p.status === "Active"
  ).length;

  const handleSearch = async () => {

  try {

    setLoading(true);

    const response = await getProducts(
      1,
      10,
      search
    );

    setProducts(response.data || []);

    setTotalPages(response.totalPages || 1);

    setPage(1);

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }
};

  const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) return;

  try {

    await deleteProduct(id);

    fetchProducts();

  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );

  }
};

  const fetchProducts = async () => {
  try {

    setLoading(true);

    const response = await getProducts(
      page,
      10,
      search
    );

    console.log("API Response:", response);

    setProducts(response.data || []);

    setTotalPages(response.totalPages || 1);

  } catch (error) {

    console.error(
      "Error Fetching Products:",
      error
    );

  } finally {

    setLoading(false);

  }
};

useEffect(() => {
  fetchProducts();
}, [page]);


return (
  <div className="mt-4" id="table-width-fixed">

    {/* Breadcrumb */}
    <div>
      <Link to="/" className="hover:text-[#C2410C]">
        Dashboard
      </Link>{" "}
      / <span className="text-[#C2410C]">Products</span>
    </div>

    {/* Summary Cards */}
    <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">

      <Card
        title="Total Products"
        count={totalProducts}
        bg="#FFF7ED"
        color="#C2410C"
      />

      <Card
        title="Raw Materials"
        count={rawMaterials}
        bg="#EAF1FA"
        color="#1C4CD2"
      />

      <Card
        title="Finished Products"
        count={finishedProducts}
        bg="#FAF5FF"
        color="#7E22CE"
      />

      <Card
        title="Active Products"
        count={activeProducts}
        bg="#F0FDF4"
        color="#15803D"
      />

    </div>

    {/* Search Section */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-6 mt-6">

      <div className="relative w-full max-w-md">

        <IoIosSearch
          size={22}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="flex gap-2">

        <button
          onClick={handleSearch}
          className="bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>

        <Link to="/products/create">
          <div className="flex gap-2 bg-[#FB6514] px-4 py-2 rounded-md text-white items-center font-medium">
            <span>+</span>
            <span>Add Product</span>
          </div>
        </Link>

      </div>

    </div>

    {/* Loader */}
    {loading ? (

      <div className="flex justify-center items-center h-64">

        <div className="loader border-4 border-orange-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>

      </div>

    ) : (

      <>
        {/* Table */}
        <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">

          <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">

            <thead className="bg-white text-gray-500 uppercase tracking-wider">

              <tr>

                <th className="p-3 border-b">#</th>
                <th className="p-3 border-b">Code</th>
                <th className="p-3 border-b">Product Name</th>
                <th className="p-3 border-b">Type</th>
                <th className="p-3 border-b">Category</th>
                <th className="p-3 border-b">Brand</th>
                <th className="p-3 border-b">Unit</th>
                <th className="p-3 border-b">Cost</th>
                <th className="p-3 border-b">Selling</th>
                <th className="p-3 border-b">Stock</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Actions</th>

              </tr>

            </thead>

            <tbody>

              {products.length > 0 ? (

                products.map((product, index) => (

                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 bg-white"
                  >

                    <td className="p-3 border-b">
                      {(page - 1) * 10 + index + 1}
                    </td>

                    <td className="p-3 border-b">
                      {product.productCode}
                    </td>

                    <td className="p-3 border-b text-blue-700">
                      {product.productName}
                    </td>

                    <td className="p-3 border-b">

                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          product.productType === "Raw Material"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.productType}
                      </span>

                    </td>

                    <td className="p-3 border-b">
                      {product.category?.name || "-"}
                    </td>

                    <td className="p-3 border-b">
                      {product.brand?.name || "-"}
                    </td>

                    <td className="p-3 border-b">
                      {product.unit?.name || "-"}
                    </td>

                    <td className="p-3 border-b">
                      ₹{product.costPrice || 0}
                    </td>

                    <td className="p-3 border-b">
                      ₹{product.sellingPrice || 0}
                    </td>

                    <td className="p-3 border-b">
                      {product.openingStock || 0}
                    </td>

                    <td className="p-3 border-b">

                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          product.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status}
                      </span>

                    </td>

                    <td className="p-3 border-b">

                      <div className="flex items-center gap-3">

                        <Link
                          to={`/products/view/${product._id}`}
                        >
                          <FaEye className="text-blue-500 cursor-pointer hover:scale-110 transition" />
                        </Link>

                        <Link
                          to={`/products/edit/${product._id}`}
                        >
                          <PencilIcon className="h-5 w-5 text-yellow-500 cursor-pointer hover:scale-110 transition" />
                        </Link>

                        <MdDelete
                          className="text-red-500 cursor-pointer hover:scale-110 transition text-lg"
                          onClick={() =>
                            handleDelete(product._id)
                          }
                        />

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="12"
                    className="p-4 text-center text-gray-500"
                  >
                    No Products Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        <div className="flex flex-col bg-white md:flex-row justify-between items-center p-3 gap-3 rounded-b-md shadow-md">

          <div>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded-md border"
            >
              Previous
            </button>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md border"
            >
              Next
            </button>

          </div>

        </div>

      </>
    )}

  </div>
);

};

export default ProductsList;