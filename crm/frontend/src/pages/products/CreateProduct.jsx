import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPackage, FiBox, FiTag } from "react-icons/fi";
import { FaWarehouse, FaMoneyBillWave } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { createProduct } from "../../services/productService";
import axios from "axios";

const CreateProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    productType: "",
    category: "",
    subCategory: "",
    brand: "",
    unit: "",
    costPrice: "",
    sellingPrice: "",
    mrp: "",
    discount: "",
    gst: "",
    hsnCode: "",
    openingStock: "",
    reorderLevel: "",
    maximumStock: "",
    warehouse: "",
    status: "Active",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);

  const [variants, setVariants] = useState([
    {
      variantName: "",
      variantValue: "",
    },
  ]);

  const fetchCategories = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5002/api/categories"
    );

    setCategories(res.data.data || []);
  } catch (error) {
    console.error("Category Error:", error);
  }
};

const fetchBrands = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5002/api/brands"
    );

    setBrands(res.data.data || []);
  } catch (error) {
    console.error("Brand Error:", error);
  }
};

const fetchUnits = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5002/api/units"
    );

    setUnits(res.data.data || []);
  } catch (error) {
    console.error("Unit Error:", error);
  }
};

const fetchWarehouses = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5002/api/warehouses"
    );

    setWarehouses(res.data.data || []);
  } catch (error) {
    console.error("Warehouse Error:", error);
  }
};

const fetchSubCategories = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5002/api/subcategories"
    );

    console.log("Sub Categories API:", res.data);

    setSubCategories(res.data.data || []);
  } catch (error) {
    console.error("SubCategory Error:", error);
  }
};

const fetchHsnCodes = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5002/api/hsn"
    );

    console.log("HSN API:", res.data);

    setHsnCodes(res.data.data || []);
  } catch (error) {
    console.error("HSN Error:", error);
  }
};


useEffect(() => {
  fetchCategories();
  fetchSubCategories();
  fetchBrands();
  fetchUnits();
  fetchWarehouses();
  fetchHsnCodes();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        variantName: "",
        variantValue: "",
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const isFormValid = () => {
    const requiredFields = [
      "productCode",
      "productName",
      "productType",
      "category",
      "brand",
      "unit",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required`);
        return false;
      }
    }

    return true;
  };

 const handleCreateProduct = async () => {
  if (!isFormValid()) return;

  try {

    const payload = {
    ...formData,

    subCategory:
      formData.subCategory || null,

    hsnCode:
      formData.hsnCode || null,

    warehouse:
      formData.warehouse || null,

    variants,
  };

    const response =
      await createProduct(payload);

    if (response.success) {

      toast.success(
        "Product Created Successfully"
      );

      setTimeout(() => {
        navigate("/products");
      }, 1000);

    } else {

      toast.error(
        response.message ||
        "Failed to create product"
      );

    }

  } catch (error) {

    console.error(error);

    toast.error(
      error.response?.data?.message ||
      "Error creating product"
    );

  }
};

  const handleClose = () => {
    navigate("/products");
  };

  return (
    <div className="px-6">
      <div className="my-4">
        <Link to="/">Dashboard</Link> /
        <Link to="/products" className="hover:text-[#C2410C]">
          {" "}Products
        </Link>
        {" "}/
        <span className="text-[#C2410C]"> Create Product</span>
      </div>

      <div className="flex justify-center">
        <div className="bg-white w-full max-w-6xl rounded-md p-6 shadow-md">

          <h2 className="text-xl font-semibold mb-6">
            Create Product
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputWithIcon
              label="Product Code"
              icon={<FiPackage />}
              name="productCode"
              value={formData.productCode}
              onChange={handleChange}
              placeholder="Product Code"
            />

            <InputWithIcon
              label="Product Name"
              icon={<FiBox />}
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Product Name"
            />

            <SelectField
              label="Product Type"
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              options={[
                { value: "Raw Material", label: "Raw Material" },
                { value: "Finished Product", label: "Finished Product" },
                { value: "Service", label: "Service" },
              ]}
            />
          </div>

          <h3 className="font-semibold text-lg mt-8 mb-3">
            Classification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
            />

            <SelectField
              label="Sub Category"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              options={subCategories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
            />

            <SelectField
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              options={brands.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <SelectField
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              options={units.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
            />

            <SelectField
              label="HSN Code"
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleChange}
              options={hsnCodes.map((c) => ({
                value: c._id,
                label: c.hsnCode,
              }))}
            />

            <SelectField
              label="Warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              options={warehouses.map((c) => ({
                  value: c._id,
                  label: c.warehouseName,
                }))}
            />
          </div>

          <h3 className="font-semibold text-lg mt-8 mb-3">
            Pricing Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputWithIcon label="Cost Price" icon={<FaMoneyBillWave />} name="costPrice" value={formData.costPrice} onChange={handleChange} />
            <InputWithIcon label="Selling Price" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} />
            <InputWithIcon label="MRP" name="mrp" value={formData.mrp} onChange={handleChange} />
            <InputWithIcon label="Discount %" name="discount" value={formData.discount} onChange={handleChange} />
            <InputWithIcon label="GST %" name="gst" value={formData.gst} onChange={handleChange} />
          </div>

          <h3 className="font-semibold text-lg mt-8 mb-3">
            Inventory Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputWithIcon label="Opening Stock" name="openingStock" value={formData.openingStock} onChange={handleChange} />
            <InputWithIcon label="Reorder Level" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} />
            <InputWithIcon label="Maximum Stock" name="maximumStock" value={formData.maximumStock} onChange={handleChange} />
          </div>

          <h3 className="font-semibold text-lg mt-8 mb-3">
            Product Variants
          </h3>

          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Variant Name"
                value={variant.variantName}
                onChange={(e) =>
                  handleVariantChange(index, "variantName", e.target.value)
                }
              />

              <input
                className="border rounded px-3 py-2"
                placeholder="Variant Value"
                value={variant.variantValue}
                onChange={(e) =>
                  handleVariantChange(index, "variantValue", e.target.value)
                }
              />

              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="border rounded px-3 py-2"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddVariant}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Variant
          </button>

          <div className="mt-5">
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-md border border-gray-300"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 text-white rounded-md bg-[#FB6514]"
              onClick={handleCreateProduct}
            >
              Create Product
            </button>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

const InputWithIcon = ({
  label,
  icon,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
}) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
      {icon}
      <input
        type={type}
        className="outline-none w-full"
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder || label}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <div className="border border-gray-300 rounded-md px-3 py-2">
      <select
        className="outline-none w-full"
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Select {label}</option>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CreateProduct;
