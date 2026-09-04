import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  FiFileText,
  FiEye,
  FiUploadCloud,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

const Ticket = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  // =========================
  // Upload Image to Cloudinary
  // =========================
  const uploadToCloudinary =
    async (file) => {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "upload_preset",
        "crm_un"
      );

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/drnz6tpox/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error?.message ||
            "Upload failed"
        );
      }

      return data.secure_url;
    };

  // =========================
  // Handle Submit
  // =========================
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        !form.title ||
        !form.description ||
        !form.category
      ) {
        return toast.error(
          "All fields are required"
        );
      }

      try {
        setLoading(true);

        let imageUrl = "";

        // Upload image first
        if (form.image) {
          imageUrl =
            await uploadToCloudinary(
              form.image
            );
        }

        // Save ticket
        await axiosInstance.post(
          "/tickets",
          {
            title: form.title,
            description:
              form.description,
            category:
              form.category,
            image: imageUrl,
          }
        );

        toast.success(
          "Ticket submitted successfully ✅"
        );

        // Reset form
        setForm({
          title: "",
          description: "",
          category: "",
          image: null,
        });
      } catch (err) {
        console.error(err);

        toast.error(
          "Error submitting ticket ❌"
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // Handle Cancel
  // =========================
  const handleCancel = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      image: null,
    });

    navigate("/tickets");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      
      {/* Main Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <FiFileText className="text-orange-600 text-xl" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-800">
              Raise a Ticket
            </h2>
          </div>

          {/* View Tickets Button */}
          <button
            onClick={() =>
              navigate("/tickets")
            }
            className="flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition"
          >
            <FiEye />
            View Tickets
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Category
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
            >
              <option value="">
                Select Category
              </option>

              <option value="bug">
                Bug
              </option>

              <option value="feature">
                Feature Request
              </option>

              <option value="support">
                Support
              </option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Title
            </label>

            <input
              type="text"
              placeholder="Enter ticket title..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target.value,
                })
              }
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Upload Image (optional)
            </label>

            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-400 transition">

              <FiUploadCloud className="text-xl text-gray-500" />

              <span className="text-sm text-gray-500">
                Click to upload image
              </span>

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  setForm({
                    ...form,
                    image:
                      e.target
                        .files[0],
                  })
                }
              />
            </label>

            {/* Preview File Name */}
            {form.image && (
              <p className="text-xs text-green-600 mt-2">
                Selected:{" "}
                {form.image.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>

            <textarea
              placeholder="Describe your issue..."
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />
          </div>

          {/* Buttons Row */}
          <div className="flex gap-4">

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading
                ? "Submitting..."
                : "Submit Ticket"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={
                handleCancel
              }
              className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Ticket;