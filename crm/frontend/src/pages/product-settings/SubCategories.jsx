import React, {
  useEffect,
  useState
} from "react";

import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";

import Card from "../../components/Card";

import SubCategoryModal from "../../components/SubCategoryModal";

import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory
} from "../../services/subCategoryService";

import {
  getCategories
} from "../../services/categoryService";

const SubCategories = () => { 

    const [subCategories, setSubCategories] =
  useState([]);

const [categories, setCategories] =
  useState([]);

const [loading, setLoading] =
  useState(false);

const [search, setSearch] =
  useState("");

const [page, setPage] =
  useState(1);

const [totalPages, setTotalPages] =
  useState(1);

const [showModal, setShowModal] =
  useState(false);

const [isEdit, setIsEdit] =
  useState(false);

const [selectedId, setSelectedId] =
  useState(null);

const [formData, setFormData] =
  useState({
    category: "",
    name: "",
    description: "",
    status: "Active"
  });

  const fetchCategoriesList =
async () => {

  try {

    const response =
      await getCategories();

    setCategories(
      response.data || []
    );

  } catch (error) {

    console.error(error);

  }

};

const fetchSubCategories = async () => {

  try {

    setLoading(true);

    const response =
      await getSubCategories();

    console.log(
      "SubCategories API",
      response.data
    );

    setSubCategories(
      Array.isArray(
        response.data.data
      )
        ? response.data.data
        : []
    );

    setTotalPages(
      response.data.totalPages || 1
    );

  } catch (error) {

    console.error(error);

    setSubCategories([]);

  } finally {

    setLoading(false);

  }

};


useEffect(() => {

  fetchSubCategories();

}, [page]);

useEffect(() => {

  fetchCategoriesList();

}, []);


const handleSearch = () => {

  const filtered =
    safeSubCategories.filter(
      item =>
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  setSubCategories(filtered);

};


const handleAdd = () => {

  setFormData({
    category: "",
    name: "",
    description: "",
    status: "Active"
  });

  setIsEdit(false);

  setShowModal(true);

};

const handleEdit =
(subCategory) => {

  setSelectedId(
    subCategory._id
  );

  setFormData({
    category:
      subCategory.category?._id ||
      subCategory.category,
    name: subCategory.name,
    description:
      subCategory.description,
    status:
      subCategory.status
  });

  setIsEdit(true);

  setShowModal(true);

};

const handleSubmit =
async () => {

  try {

    if (
      !formData.category
    ) {
      return alert(
        "Select Category"
      );
    }

    if (
      !formData.name.trim()
    ) {
      return alert(
        "Sub Category Name Required"
      );
    }

    if (isEdit) {

      await updateSubCategory(
        selectedId,
        formData
      );

    } else {

      await createSubCategory(
        formData
      );

    }

    setShowModal(false);

    fetchSubCategories();

  } catch (error) {

    alert(
      error.response?.data
        ?.message ||
      "Error"
    );

  }

};

const handleDelete =
async (id) => {

  const confirmDelete =
    window.confirm(
      "Delete Sub Category?"
    );

  if (!confirmDelete)
    return;

  await deleteSubCategory(id);

  fetchSubCategories();

};

const toggleStatus =
async (subCategory) => {

  await updateSubCategory(
    subCategory._id,
    {
      status:
        subCategory.status ===
        "Active"
          ? "Inactive"
          : "Active"
    }
  );

  fetchSubCategories();

};

const safeSubCategories =
  Array.isArray(subCategories)
    ? subCategories
    : [];

const totalSubCategories =
  safeSubCategories.length;

const activeSubCategories =
  safeSubCategories.filter(
    item =>
      item.status === "Active"
  ).length;

const inactiveSubCategories =
  safeSubCategories.filter(
    item =>
      item.status === "Inactive"
  ).length;

  const filteredSubCategories =
  safeSubCategories.filter(
    item =>
      item.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      item.category?.name
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
        title="Total Sub Categories"
        count={totalSubCategories}
        bg="#FFF7ED"
        color="#C2410C"
      />

      <Card
        title="Active"
        count={activeSubCategories}
        bg="#F0FDF4"
        color="#15803D"
      />

      <Card
        title="Inactive"
        count={inactiveSubCategories}
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
          placeholder="Search Sub Category"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          Search
        </button>

        <button
          onClick={handleAdd}
          className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
        >
          + Add Sub Category
        </button>
      </div>
    </div>

    {/* Table */}

    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">
              Category
            </th>
            <th className="p-3 text-left">
              Sub Category
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
          {filteredSubCategories.map(
            (subCategory, index) => (
              <tr
                key={subCategory._id}
                className="border-t"
              >
                <td className="p-3">
                  {(page - 1) * 10 +
                    index +
                    1}
                </td>

                <td className="p-3">
                  {
                    subCategory?.category
                      ?.name
                  }
                </td>

                <td className="p-3">
                  {subCategory.name}
                </td>

                <td className="p-3">
                  {
                    subCategory.description
                  }
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      toggleStatus(
                        subCategory
                      )
                    }
                    className={
                      subCategory.status ===
                      "Active"
                        ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                        : "bg-red-100 text-red-700 px-3 py-1 rounded"
                    }
                  >
                    {
                      subCategory.status
                    }
                  </button>
                </td>

                <td className="p-3">
                  <div className="flex gap-3">
                    <PencilIcon
                      className="h-5 w-5 text-yellow-500 cursor-pointer"
                      onClick={() =>
                        handleEdit(
                          subCategory
                        )
                      }
                    />

                    <MdDelete
                      className="text-red-500 text-xl cursor-pointer"
                      onClick={() =>
                        handleDelete(
                          subCategory._id
                        )
                      }
                    />
                  </div>
                </td>
              </tr>
            )
          )}

          {filteredSubCategories.length ===
            0 && (
            <tr>
              <td
                colSpan="6"
                className="text-center py-5 text-gray-500"
              >
                No Sub Categories Found
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

    <SubCategoryModal
      isOpen={showModal}
      onClose={() =>
        setShowModal(false)
      }
      onSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
      categories={categories}
      isEdit={isEdit}
    />
  </>
);
    
};

export default SubCategories;