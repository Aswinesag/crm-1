import React from "react";
import ProductSettingPage from "../../components/ProductSettingPage.jsx";

const fields = [
  { name: "warehouseCode", label: "Warehouse code", required: true },
  { name: "warehouseName", label: "Warehouse name", required: true },
  { name: "location", label: "Location", required: true },
  { name: "managerName", label: "Manager name" },
  { name: "contactNumber", label: "Contact number", type: "tel" },
  { name: "status", label: "Status", type: "select", defaultValue: "Active", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
];
const columns = [{ key: "warehouseCode", label: "Code" }, { key: "warehouseName", label: "Warehouse" }, { key: "location", label: "Location" }, { key: "managerName", label: "Manager" }, { key: "status", label: "Status" }];

export default function Warehouses() { return <ProductSettingPage title="Warehouses" singular="Warehouse" resource="warehouses" fields={fields} columns={columns} hasStatus />; }
