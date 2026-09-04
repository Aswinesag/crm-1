import React from "react";
import ProductSettingPage from "../../components/ProductSettingPage.jsx";

const fields = [
  { name: "hsnCode", label: "HSN code", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "gstPercentage", label: "GST percentage", type: "number", min: 0, max: 100, required: true },
];
const columns = [{ key: "hsnCode", label: "HSN code" }, { key: "description", label: "Description" }, { key: "gstPercentage", label: "GST %", render: (record) => `${record.gstPercentage}%` }];

export default function HsnCodes() { return <ProductSettingPage title="HSN Codes" singular="HSN Code" resource="hsn-codes" fields={fields} columns={columns} />; }
