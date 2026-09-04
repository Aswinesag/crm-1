import React from "react";
import ProductSettingPage from "../../components/ProductSettingPage.jsx";

const fields = [
  { name: "name", label: "Category name", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "status", label: "Status", type: "select", defaultValue: "Active", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
];
const columns = [{ key: "name", label: "Category" }, { key: "description", label: "Description" }, { key: "status", label: "Status" }];

export default function Categories() { return <ProductSettingPage title="Categories" singular="Category" resource="categories" fields={fields} columns={columns} hasStatus />; }
