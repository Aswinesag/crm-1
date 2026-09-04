import React from "react";
import ProductSettingPage from "../../components/ProductSettingPage.jsx";

const fields = [
  { name: "name", label: "Unit name", required: true },
  { name: "shortName", label: "Short name" },
  { name: "status", label: "Status", type: "select", defaultValue: "Active", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
];
const columns = [{ key: "name", label: "Unit" }, { key: "shortName", label: "Short name" }, { key: "status", label: "Status" }];

export default function Units() { return <ProductSettingPage title="Units" singular="Unit" resource="units" fields={fields} columns={columns} hasStatus />; }
