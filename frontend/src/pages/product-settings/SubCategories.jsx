import React from "react";
import ProductSettingPage from "../../components/ProductSettingPage.jsx";

const fields = [
  { name: "category", label: "Category", type: "relation", optionsResource: "categories", required: true },
  { name: "name", label: "Subcategory name", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "status", label: "Status", type: "select", defaultValue: "Active", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
];
const columns = [{ key: "category.name", label: "Category" }, { key: "name", label: "Subcategory" }, { key: "description", label: "Description" }, { key: "status", label: "Status" }];

export default function SubCategories() { return <ProductSettingPage title="Subcategories" singular="Subcategory" resource="subcategories" fields={fields} columns={columns} hasStatus />; }
