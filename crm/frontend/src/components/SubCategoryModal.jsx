import React from "react";

const SubCategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  categories,
  isEdit
}) => {

  if (!isOpen) return null;

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

      <div className="bg-white rounded-lg w-full max-w-md p-6">

        <h2 className="text-xl font-semibold mb-4">

          {isEdit
            ? "Edit Sub Category"
            : "Add Sub Category"}

        </h2>

        <div className="space-y-4">

          {/* Category Dropdown */}

          <div>

            <label className="block mb-1">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >

              <option value="">
                Select Category
              </option>

              {categories?.map((cat) => (

                <option
                  key={cat._id}
                  value={cat._id}
                >
                  {cat.name}
                </option>

              ))}

            </select>

          </div>

          {/* Sub Category Name */}

          <div>

            <label className="block mb-1">
              Sub Category Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />

          </div>

          {/* Description */}

          <div>

            <label className="block mb-1">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-md p-2"
            />

          </div>

          {/* Status */}

          <div>

            <label className="block mb-1">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-[#FB6514] text-white rounded-md"
          >
            {isEdit ? "Update" : "Save"}
          </button>

        </div>

      </div>

    </div>

  );

};

export default SubCategoryModal;