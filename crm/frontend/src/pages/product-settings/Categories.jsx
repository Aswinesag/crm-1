import React, {
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";

import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";

import Card from "../../components/Card";

import CategoryModal from "../../components/CategoryModal";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoryService";

const Categories = () => {

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
      name: "",
      description: "",
      status: "Active"
    }); 

const fetchCategories = async () => {

  try {

    setLoading(true);

    const response =
      await getCategories(
        page,
        10,
        search
      );

    setCategories(
      response.data || []
    );

    setTotalPages(
      response.totalPages || 1
    );

  } catch (error) {

    console.error(error);

  } finally {

    setLoading(false);

  }

};

useEffect(() => {
  fetchCategories();
}, [page]);

const handleSearch = async () => {

  setPage(1);

  fetchCategories();

};

const handleAdd = () => {

  setFormData({
    name: "",
    description: "",
    status: "Active"
  });

  setIsEdit(false);

  setShowModal(true);

};

const handleEdit = (category) => {

  setSelectedId(
    category._id
  );

  setFormData({
    name: category.name,
    description:
      category.description,
    status: category.status
  });

  setIsEdit(true);

  setShowModal(true);

};

const handleSubmit = async () => {

  try {

    if (
      !formData.name.trim()
    ) {
      return alert(
        "Category Name Required"
      );
    }

    if (isEdit) {

      await updateCategory(
        selectedId,
        formData
      );

    } else {

      await createCategory(
        formData
      );

    }

    setShowModal(false);

    fetchCategories();

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
      "Delete Category?"
    );

  if (!confirmDelete)
    return;

  await deleteCategory(id);

  fetchCategories();

};

const toggleStatus =
async (category) => {

  await updateCategory(
    category._id,
    {
      status:
        category.status ===
        "Active"
          ? "Inactive"
          : "Active"
    }
  );

  fetchCategories();

};

 const totalCategories =
  categories.length;

const activeCategories =
  categories.filter(
    c => c.status === "Active"
  ).length;

const inactiveCategories =
  categories.filter(
    c => c.status === "Inactive"
  ).length;

return(<>
  <div className="flex flex-wrap gap-3 mt-4">

  <Card
    title="Total Categories"
    count={totalCategories}
    bg="#FFF7ED"
    color="#C2410C"
  />

  <Card
    title="Active"
    count={activeCategories}
    bg="#F0FDF4"
    color="#15803D"
  />

  <Card
    title="Inactive"
    count={inactiveCategories}
    bg="#FEF2F2"
    color="#DC2626"
  />

</div>

<div className="flex justify-between mt-6">

  <div className="relative w-full max-w-md">

    <IoIosSearch
      size={22}
      className="absolute left-3 top-3 text-gray-400"
    />

    <input
      type="text"
      placeholder="Search Category"
      value={search}
      onChange={(e)=>
        setSearch(
          e.target.value
        )
      }
      className="w-full pl-10 pr-4 py-2 border rounded-lg"
    />

  </div>

  <div className="flex gap-2">

    <button
      onClick={handleSearch}
      className="bg-gray-600 text-white px-4 py-2 rounded-md"
    >
      Search
    </button>

    <button
      onClick={handleAdd}
      className="bg-[#FB6514] text-white px-4 py-2 rounded-md"
    >
      + Add Category
    </button>

  </div>

</div>

<table className="w-full bg-white mt-5">

<thead>

<tr>

<th>#</th>
<th>Name</th>
<th>Description</th>
<th>Status</th>
<th>Actions</th>

</tr>

</thead>

<tbody>

{
categories.map(
(category,index)=>(
<tr key={category._id}>

<td>
{(page-1)*10+index+1}
</td>

<td>
{category.name}
</td>

<td>
{category.description}
</td>

<td>

<button
onClick={()=>
toggleStatus(
category
)
}
className={
category.status==="Active"
?
"bg-green-100 text-green-700 px-2 py-1 rounded"
:
"bg-red-100 text-red-700 px-2 py-1 rounded"
}
>

{category.status}

</button>

</td>

<td>

<div className="flex gap-3">

<PencilIcon
className="h-5 w-5 text-yellow-500 cursor-pointer"
onClick={()=>
handleEdit(
category
)
}
/>

<MdDelete
className="text-red-500 text-xl cursor-pointer"
onClick={()=>
handleDelete(
category._id
)
}
/>

</div>

</td>

</tr>
))
}

</tbody>

</table>

<div className="flex justify-between bg-white p-3">

<span>
Page {page}
of {totalPages}
</span>

<div className="flex gap-2">

<button
disabled={page===1}
onClick={()=>
setPage(page-1)
}
>
Previous
</button>

<button
disabled={
page===totalPages
}
onClick={()=>
setPage(page+1)
}
>
Next
</button>

</div>

</div>

<CategoryModal
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

export default Categories;