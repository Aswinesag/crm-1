import React, { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import toast, {
  Toaster,
} from "react-hot-toast";

import {
  updateLead,
  addnote,
  setEngineerTaskCounts,
} from "../redux/leadSlice";

import {
  updateLeadStatus,
  addNoteToLeadApi,
  fetchEngineersWithTaskCount,
} from "../api/fetchdata";

import { SlNote } from "react-icons/sl";
import { MdErrorOutline } from "react-icons/md";

import { leadViewConfig } from "../config/leadViewConfig";

const LeadView = () => {
  const { type, id } = useParams();

  const config = leadViewConfig[type];

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const lead = useSelector(
    (state) =>
      state.leads.leads.find(
        (l) => l._id === id
      ) || null
  );

  const engineerTaskCounts = useSelector(
    (state) =>
      state.leads.engineer_taskCounts
  );

  const [fields, setFields] =
    useState(null);

  const [
    originalFields,
    setOriginalFields,
  ] = useState(null);

  const [isChanged, setIsChanged] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [newNote, setNewNote] =
    useState("");

  const [noteSaving, setNoteSaving] =
    useState(false);

  // =========================
// Dynamic Products State
// =========================
const [products, setProducts] = useState([
  {
    productName: "",
    quantity: 1,
  },
]);

const [originalProducts, setOriginalProducts] = useState([]);
  // =========================
  // Load Lead Data
  // =========================
  useEffect(() => {
    if (lead) {
     const leadData = {
  name: lead.name || "",

  company: lead.company || "",

  assignedTo:
    lead.assignedTo || "",

  priority:
    lead.priority || "",

  status: lead.status || "",

  email: lead.email || "",

  phone: lead.phone || "",

  country:
    lead.country || "",

  state: lead.state || "",

  city: lead.city || "",

  address:
    lead.address || "",

  firstName:
    lead.firstName || "",

  lastName:
    lead.lastName || "",

  quoteAmount:
    lead.quoteAmount ||
    "25000",

  createdBy:
    lead.createdBy || "",

  source:
    lead.source || "",
};
      
      setFields(leadData);

      // ✅ Load products
    if (lead.products && lead.products.length > 0) {
      setProducts(
        lead.products.map((p) => ({
          productName: p.productName || "",
          quantity: p.quantity || 1,
        }))
      );
    }

    setOriginalProducts(
    lead.products?.map((p) => ({
      productName: p.productName || "",
      quantity: p.quantity || 1,
    })) || []
  );

      const editableData = {};

      config.editableFields.forEach(
        (field) => {
          editableData[field] =
            leadData[field] || "";
        }
      );

      setOriginalFields(
        editableData
      );
    }
  }, [lead, config]);

  // =========================
  // Detect Changes
  // =========================
  useEffect(() => {
    if (
      !fields ||
      !originalFields
    )
      return;

    const currentEditable = {};

    config.editableFields.forEach(
      (field) => {
        currentEditable[field] =
          fields[field] || "";
      }
    );

const fieldsChanged =
  JSON.stringify(currentEditable) !==
  JSON.stringify(originalFields);

  let productsChanged = false;

  if (type === "opportunity") {
    productsChanged =
      JSON.stringify(products) !==
      JSON.stringify(originalProducts);
  }

setIsChanged(
  fieldsChanged || productsChanged
);
  }, [
    fields,
    originalFields,
    products,
    originalProducts,
    config,
    type,
  ]);

  // =========================
  // Handle Change
  // =========================
  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
// Add Product Row
// =========================
const handleAddProduct = () => {
  setProducts([
    ...products,
    {
      productName: "",
      quantity: 1,
    },
  ]);
};

// =========================
// Remove Product Row
// =========================
const handleRemoveProduct = (index) => {
  const updatedProducts = products.filter(
    (_, i) => i !== index
  );

  setProducts(updatedProducts);
};

// =========================
// Handle Product Change
// =========================
const handleProductChange = (
  index,
  field,
  value
) => {
  const updatedProducts = [...products];

  updatedProducts[index][field] = value;

  setProducts(updatedProducts);
};
  // =========================
  // Update Lead
  // =========================
  const handleUpdate =
    async () => {
      if (!isChanged) {
        toast.error(
          "No changes detected."
        );

        return;
      }

      setSaving(true);

      try {
        const payload = {};

        config.editableFields.forEach(
          (field) => {
            payload[field] =
              fields[field];
          }
        );

       if (type === "opportunity") {
          payload.products = products;
        }

        const updated =
          await updateLeadStatus(
            id,
            payload
          );

        dispatch(
          updateLead({
            id,
            changes: updated,
          })
        );

        const data =
          await fetchEngineersWithTaskCount();

        dispatch(
          setEngineerTaskCounts(
            data
          )
        );

        setOriginalFields(
          payload
        );
        setOriginalProducts(products);

        setIsChanged(false);

        toast.success(
          `${config.sectionName} updated!`
        );
      } catch {
        toast.error(
          "Update failed!"
        );
      } finally {
        setSaving(false);
      }
    };

  // =========================
  // Add Note
  // =========================
  const handleAddNote =
    async () => {
      if (!newNote.trim()) {
        return toast.error(
          "Cannot add empty note."
        );
      }

      setNoteSaving(true);

      try {
        const updatedLead =
          await addNoteToLeadApi(
            id,
            newNote
          );

        dispatch(
          addnote({
            id,
            note:
              updatedLead.notes[
                updatedLead.notes
                  .length - 1
              ],
          })
        );

        toast.success(
          "Note added."
        );

        setNewNote("");
      } catch {
        toast.error(
          "Failed to add note."
        );
      } finally {
        setNoteSaving(false);
      }
    };

  // =========================
  // Cancel Navigation
  // =========================
  const routeMap = {
    enquiry: "/enquiry",
    quotation: "/quotation",
    opportunity: "/opportunities",
    lead: "/leads",
    followup: "/followup",
    delivery: "/Delivery",
  };

  const handleCancel = () => {
    navigate(routeMap[type] || "/");
  };

  // =========================
  // Make Quotation
  // =========================
  const handleAddQuote = () => {
    navigate(`/addQuotation/${id}`);
  };

  const product =
    lead?.products?.[0];

  if (!lead || !fields) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-4 max-w-5xl mx-auto">
      <Toaster />

      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/"
          className="hover:text-[#C2410C]"
        >
          Dashboard
        </Link>

        {" / "}

        <Link
          to={`/${type}`}
          className="hover:text-[#C2410C]"
        >
          {config.sectionName}
        </Link>

        {" / "}

        <span className="text-[#C2410C]">
          {lead.name} Detail
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-600 mb-4 md:mb-0">
            <SlNote
              className="bg-orange-100 text-orange-500 rounded p-2"
              size={38}
            />

            {config.title}
          </h2>

         <div className="flex gap-3">
  <button
    className={`px-4 py-2 rounded-md font-semibold shadow transition
    ${
      isChanged
        ? "bg-[#FB6514] text-white"
        : "bg-gray-300 text-gray-500"
    }`}
    disabled={
      saving || !isChanged
    }
    onClick={
      handleUpdate
    }
  >
    {saving
      ? "Saving..."
      : config.updateButton}
  </button>

  {/* Only for quotation page */}
  {type === "quotation" && (
    <button
      onClick={handleAddQuote}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
    >
      Make Quotation
    </button>
  )}

  {config.showQuotationButton &&
    (lead.status ===
      "Quotation" ||
      lead.status ===
        "Quotation Sent") && (
      <button
        onClick={
          handleAddQuote
        }
        className="bg-[#FB6514] text-white px-4 py-2 rounded-md"
      >
        Make Quotation
      </button>
    )}
    <button
    onClick={handleCancel}
    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
  >
    Cancel
  </button>
</div>  
        </div>

        {/* Unsaved Changes */}
        {isChanged && (
          <div className="mb-5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            You have unsaved
            changes.
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Lead Name"
             value={
                products?.[0]?.productName || ""
              }
            disabled
          />

          <Input
            label="Company"
            value={fields.company}
            disabled
          />

          <Input
            label="Priority"
            value={fields.priority}
            disabled
          />

          <Input
            label="Email"
            name="email"
            value={fields.email}
            onChange={handleChange}
          />

          <Input
            label="Phone"
            value={fields.phone}
            disabled
          />

          {/* Enquiry / Quotation / Followup / Opportunity / Lead */}
          {(type === "lead" ||
            type ===
              "opportunity" ||
            type === "enquiry" ||
            type ===
              "quotation" ||
            type ===
              "followup") && (
            <>
              <Input
                label="First Name"
                value={
                  fields.firstName
                }
                disabled
              />

              <Input
                label="Last Name"
                value={
                  fields.lastName
                }
                disabled
              />

              <Input
                label="Country"
                value={
                  fields.country
                }
                disabled
              />

              <Input
                label="State"
                value={fields.state}
                disabled
              />

              <Input
                label="City"
                value={fields.city}
                disabled
              />

              <Input
                label="Address"
                value={
                  fields.address
                }
                disabled
              />
            </>
          )}

          {/* NEW FIELDS FOR ENQUIRY / QUOTATION / FOLLOWUP */}
          {(type === "enquiry" ||
            type === "quotation" ||
            type ===
              "followup") && (
            <>
              <Input
                label="Quote Amount"
                value={
                  fields.quoteAmount
                }
                disabled
              />

              <Input
                label="Created By"
                value={
                  fields.createdBy
                }
                disabled
              />

              <Input
                label="Source"
                value={fields.source}
                disabled
              />
            </>
          )}

          {/* Delivery Fields */}
          {type === "delivery" && (
            <>
              <Input
                label="Product"
                value={
                  product?.productName ||
                  "N/A"
                }
                disabled
              />

              <Input
                label="Serial No"
                value={
                  product?.serialNumbers ||
                  "N/A"
                }
                disabled
              />

              <Input
                label="Qty"
                value={
                  product?.qty ||
                  "N/A"
                }
                disabled
              />

              <Input
                label="Invoice"
                value={
                  product?.invoiceNo ||
                  "N/A"
                }
                disabled
              />

              <Input
                label="Dispatch No"
                value={
                  lead?.dispatchNo ||
                  "N/A"
                }
                disabled
              />

              <Input
                label="Address"
                value={
                  fields.address
                }
                disabled
              />
            </>
          )}

          {/* =========================
    Dynamic Products Section
========================= */}


          {/* Assigned To */}
          {config.editableFields.includes(
            "assignedTo"
          ) && (
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 text-gray-500">
                Assigned To
              </label>

              <select
                className="p-2 rounded-md border-2 border-orange-400"
                value={
                  fields.assignedTo
                }
                name="assignedTo"
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Select Engineer
                </option>

                {engineerTaskCounts.map(
                  (
                    eng,
                    idx
                  ) => (
                    <option
                      key={idx}
                      value={
                        eng.name
                      }
                    >
                      {eng.name} (
                      {
                        eng.assignedTaskCount
                      }
                      )
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* Status */}
          {config.editableFields.includes(
            "status"
          ) && (
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 text-gray-500">
                Status
              </label>

              <select
                className="p-2 rounded-md border-2 border-orange-400"
                value={
                  fields.status
                }
                name="status"
                onChange={
                  handleChange
                }
              >
                {config.statusOptions.map(
                  (
                    status,
                    idx
                  ) => (
                    <option
                      key={idx}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* Editable Quote Amount */}
          {config.editableFields.includes(
            "quoteAmount"
          ) && (
            <Input
              label="Quote Amount"
              name="quoteAmount"
              value={
                fields.quoteAmount
              }
              onChange={
                handleChange
              }
            />
          )}
            {type === "opportunity" && (
  <div className="col-span-1 md:col-span-2 xl:col-span-3 mt-6">

    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-700">
        Products
      </h3>

      <button
        type="button"
        onClick={handleAddProduct}
        className="bg-[#FB6514] hover:bg-orange-600 text-white px-4 py-2 rounded-md"
      >
        + Add Product
      </button>
    </div>

    {/* Product Rows */}
    <div className="space-y-4">
      {products.map((product, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-lg p-4 bg-gray-50"
        >

          {/* Top Row */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-700">
              Product {index + 1}
            </h4>

            {products.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  handleRemoveProduct(index)
                }
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Product Name */}
           {/* Product Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 text-gray-500">
                Lead Name
              </label>

              <input
                type="text"
                value={product.productName}
                onChange={(e) =>
                  handleProductChange(
                    index,
                    "productName",
                    e.target.value
                  )
                }
                className="p-2 border rounded bg-white"
                placeholder="Enter Product Name"
              />
            </div>

            {/* Quantity */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1 text-gray-500">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) =>
                  handleProductChange(
                    index,
                    "quantity",
                    e.target.value
                  )
                }
                className="p-2 border rounded bg-white"
                placeholder="Enter Quantity"
              />
            </div>

          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </div>

      {/* Lost Section */}
      {config.showLostSection &&
        lead.status ===
          "Lost" && (
          <div className="bg-red-50 border border-red-300 p-5 rounded-lg mt-6">
            <div className="flex items-center mb-4">
              <MdErrorOutline
                className="text-red-600 mr-2"
                size={28}
              />

              <h3 className="text-lg font-bold text-red-700">
                Lost Details
              </h3>
            </div>

            <p>
              <b>Reason:</b>{" "}
              {
                lead.failedReason
              }
            </p>

            <p>
              <b>Message:</b>{" "}
              {
                lead.failedMessage
              }
            </p>
          </div>
        )}

      {/* Notes Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-600 mb-4">
          {config.noteTitle}
        </h3>

        {lead.notes?.length ? (
          lead.notes.map(
            (note) => (
              <div
                key={note.id}
                className="bg-gray-100 p-3 rounded mb-2"
              >
                <p>
                  {note.text}
                </p>

                <small>
                  {note.author} -{" "}
                  {new Date(
                    note.createdAt
                  ).toLocaleString()}
                </small>
              </div>
            )
          )
        ) : (
          <p className="text-gray-400">
            No notes yet.
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <textarea
            className="flex-1 p-2 border rounded"
            value={newNote}
            onChange={(e) =>
              setNewNote(
                e.target.value
              )
            }
          />

          <button
            onClick={
              handleAddNote
            }
            disabled={
              noteSaving ||
              !newNote.trim()
            }
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            {noteSaving
              ? "Adding..."
              : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================
// Reusable Input Component
// =========================
const Input = ({
  label,
  ...props
}) => (
  <div className="flex flex-col">
    <label className="text-sm font-semibold mb-1 text-gray-500">
      {label}
    </label>

    <input
      {...props}
      className="p-2 border rounded bg-gray-100"
    />
  </div>
);

export default LeadView;