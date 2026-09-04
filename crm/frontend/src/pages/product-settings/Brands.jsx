import React,
{
  useEffect,
  useState
}
from "react";

import Card from "../../components/Card";

import BrandModal from "../../components/BrandModal";

import { IoIosSearch }
from "react-icons/io";

import { MdDelete }
from "react-icons/md";

import {
  PencilIcon
}
from "@heroicons/react/24/outline";

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
}
from "../../services/brandService";

const Brands = () => { 

    const [brands, setBrands] =
  useState([]);

const [loading, setLoading] =
  useState(false);

const [search, setSearch] =
  useState("");

const [page, setPage] =
  useState(1);

const [totalPages,
  setTotalPages] =
  useState(1);

const [showModal,
  setShowModal] =
  useState(false);

const [isEdit,
  setIsEdit] =
  useState(false);

const [selectedId,
  setSelectedId] =
  useState(null);

const [formData,
  setFormData] =
  useState({
    name: "",
    description: "",
    status: "Active"
  });

  const fetchBrands =
async () => {

  try {

    setLoading(true);

    const response =
      await getBrands(
        page,
        10,
        search
      );

    setBrands(
      response.data.data || []
    );

    setTotalPages(
      response.data.totalPages || 1
    );

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }

};

useEffect(() => {

  fetchBrands();

}, [page]);

const handleAdd = () => {

  setFormData({
    name: "",
    description: "",
    status: "Active"
  });

  setIsEdit(false);

  setShowModal(true);

};

const handleEdit =
(brand) => {

  setSelectedId(
    brand._id
  );

  setFormData({
    name: brand.name,
    description:
      brand.description || "",
    status:
      brand.status
  });

  setIsEdit(true);

  setShowModal(true);

};

const handleSubmit =
async () => {

  try {

    if (
      !formData.name.trim()
    ) {
      return alert(
        "Brand Name Required"
      );
    }

    if (isEdit) {

      await updateBrand(
        selectedId,
        formData
      );

    } else {

      await createBrand(
        formData
      );

    }

    setShowModal(false);

    fetchBrands();

  } catch (error) {

    alert(
      error.response?.data
        ?.message
    );
  }

};

const handleDelete =
async (id) => {

  const confirmDelete =
    window.confirm(
      "Delete Brand ?"
    );

  if (!confirmDelete)
    return;

  await deleteBrand(id);

  fetchBrands();

};

const toggleStatus =
async (brand) => {

  await updateBrand(
    brand._id,
    {
      status:
        brand.status ===
        "Active"
          ? "Inactive"
          : "Active"
    }
  );

  fetchBrands();

};

const totalBrands =
  brands.length;

const activeBrands =
  brands.filter(
    item =>
      item.status ===
      "Active"
  ).length;

const inactiveBrands =
  brands.filter(
    item =>
      item.status ===
      "Inactive"
  ).length;


  const filteredBrands =
  brands.filter(
    item =>
      item.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

if (loading) {
  return (
    <div className="p-5">
      Loading...
    </div>
  );
}

return (
  <>
    {/* Cards */}

    <div className="flex flex-wrap gap-3 mt-4">
      <Card
        title="Total Brands"
        count={totalBrands}
        bg="#FFF7ED"
        color="#C2410C"
      />

      <Card
        title="Active"
        count={activeBrands}
        bg="#F0FDF4"
        color="#15803D"
      />

      <Card
        title="Inactive"
        count={inactiveBrands}
        bg="#FEF2F2"
        color="#DC2626"
      />
    </div>

    {/* Search & Buttons */}

    <div className="flex justify-between items-center mt-6 mb-5">

      <div className="relative w-full max-w-md">
        <IoIosSearch
          size={22}
          className="absolute left-3 top-3 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search Brand"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="flex gap-2">

        <button
          className="bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          Search
        </button>

        <button
          onClick={handleAdd}
          className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
        >
          + Add Brand
        </button>

      </div>

    </div>

    {/* Table */}

    <div className="bg-white rounded-lg shadow-sm overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-50">
          <tr>

            <th className="p-3 text-left">
              #
            </th>

            <th className="p-3 text-left">
              Brand Name
            </th>

            <th className="p-3 text-left">
              Description
            </th>

            <th className="p-3 text-left">
              Status
            </th>

            <th className="p-3 text-left">
              Actions
            </th>

          </tr>
        </thead>

        <tbody>

          {filteredBrands.map(
            (brand, index) => (
              <tr
                key={brand._id}
                className="border-t"
              >

                <td className="p-3">
                  {(page - 1) * 10 +
                    index +
                    1}
                </td>

                <td className="p-3">
                  {brand.name}
                </td>

                <td className="p-3">
                  {brand.description}
                </td>

                <td className="p-3">

                  <button
                    onClick={() =>
                      toggleStatus(
                        brand
                      )
                    }
                    className={
                      brand.status ===
                      "Active"
                        ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                        : "bg-red-100 text-red-700 px-3 py-1 rounded"
                    }
                  >
                    {brand.status}
                  </button>

                </td>

                <td className="p-3">

                  <div className="flex gap-3">

                    <PencilIcon
                      className="h-5 w-5 text-yellow-500 cursor-pointer"
                      onClick={() =>
                        handleEdit(
                          brand
                        )
                      }
                    />

                    <MdDelete
                      className="text-red-500 text-xl cursor-pointer"
                      onClick={() =>
                        handleDelete(
                          brand._id
                        )
                      }
                    />

                  </div>

                </td>

              </tr>
            )
          )}

          {filteredBrands.length ===
            0 && (
            <tr>

              <td
                colSpan="5"
                className="text-center py-5 text-gray-500"
              >
                No Brands Found
              </td>

            </tr>
          )}

        </tbody>

      </table>

      {/* Pagination */}

      <div className="flex justify-between items-center p-4 border-t">

        <span>
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-3">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage(page - 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={
              page === totalPages
            }
            onClick={() =>
              setPage(page + 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      </div>

    </div>

    <BrandModal
      isOpen={showModal}
      onClose={() =>
        setShowModal(false)
      }
      onSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
      isEdit={isEdit}
    />
  </>
);

};

export default Brands;