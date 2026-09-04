import React from "react";
import ProductSettingPage from "../../components/ProductSettingPage.jsx";

const fields = [
  { name: "name", label: "Brand name", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "status", label: "Status", type: "select", defaultValue: "Active", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
];
const columns = [{ key: "name", label: "Brand" }, { key: "description", label: "Description" }, { key: "status", label: "Status" }];

export default function Brands() { return <ProductSettingPage title="Brands" singular="Brand" resource="brands" fields={fields} columns={columns} hasStatus />; }
