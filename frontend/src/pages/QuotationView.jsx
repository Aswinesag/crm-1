import React, { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";

import {
  updateLead,
  addnote,
} from "../redux/leadSlice";

import {
  updateLeadStatus,
  addNoteToLeadApi,
} from "../api/fetchdata";

import { SlNote } from "react-icons/sl";

const QuotationView = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const section =
    location.state?.fromSection || "quotation";

  const lead = useSelector((state) =>
    state.leads.leads.find(
      (l) => l._id === id
    )
  );

  const [fields, setFields] =
    useState(null);

  // ✅ Store original editable values
  const [originalFields, setOriginalFields] =
    useState(null);

  // ✅ Track changes
  const [isChanged, setIsChanged] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [newNote, setNewNote] =
    useState("");

  const [noteSaving, setNoteSaving] =
    useState(false);

  useEffect(() => {
    if (lead) {
      const quotationData = {
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phone: lead.phone || "",
        priority: lead.priority || "",
        status: lead.status || "",
        assignedTo:
          lead.assignedTo || "",
        country: lead.country || "",
        state: lead.state || "",
        city: lead.city || "",
        address: lead.address || "",
        firstName:
          lead.firstName || "",
        lastName:
          lead.lastName || "",
      };

      setFields(quotationData);

      // ✅ Save original editable fields
      setOriginalFields({
        status:
          quotationData.status || "",
        assignedTo:
          quotationData.assignedTo || "",
      });
    }
  }, [lead]);

  // ✅ Detect changes only in editable fields
  useEffect(() => {
    if (!fields || !originalFields) return;

    const currentEditableFields = {
      status:
        fields.status || "",
      assignedTo:
        fields.assignedTo || "",
    };

    const changed =
      JSON.stringify(
        currentEditableFields
      ) !==
      JSON.stringify(
        originalFields
      );

    setIsChanged(changed);
  }, [fields, originalFields]);

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Update only when changes exist
  const handleUpdate = async () => {
    // Prevent unnecessary update
    if (!isChanged) {
      toast.error(
        "No changes detected."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        status: fields.status,
        assignedTo:
          fields.assignedTo,
      };

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

      // ✅ Reset original values
      setOriginalFields({
        status:
          fields.status || "",
        assignedTo:
          fields.assignedTo || "",
      });

      // ✅ Reset change state
      setIsChanged(false);

      toast.success(
        "Quotation updated!"
      );
    } catch {
      toast.error(
        "Update failed!"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
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
          note: updatedLead.notes[
            updatedLead.notes.length - 1
          ],
        })
      );

      toast.success("Note added.");

      setNewNote("");
    } catch {
      toast.error(
        "Failed to add note."
      );
    } finally {
      setNoteSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${section}`);
  };

  if (!lead || !fields) {
    return (
      <div className="p-8">
        Loading quotation
        data...
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
        </Link>{" "}
        /
        <Link
          to={`/${section}`}
          className="hover:text-[#C2410C]"
        >
          {" "}
          Quotations
        </Link>{" "}
        /
        <span className="text-[#C2410C]">
          {" "}
          {lead.name} Detail
        </span>
      </div>

      {/* Quotation Info */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-600 mb-4 md:mb-0">
            <SlNote
              className="bg-orange-100 text-orange-500 rounded p-2"
              size={38}
            />
            Quotation Information
          </h2>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-md font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed
              ${
                isChanged
                  ? "bg-[#FB6514] text-white hover:brightness-110"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={
                saving || !isChanged
              }
              onClick={handleUpdate}
            >
              {saving
                ? "Saving..."
                : "Update Quotation"}
            </button>

            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ✅ Unsaved Changes Indicator */}
        {isChanged && (
          <div className="mb-5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            You have unsaved changes.
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Disabled Fields */}
          <Input
            label="Name"
            value={fields.name}
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
            value={fields.email}
            disabled
          />

          <Input
            label="Phone"
            value={fields.phone}
            disabled
          />

          <Input
            label="Country"
            value={fields.country}
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
            value={fields.address}
            disabled
          />

          <Input
            label="First Name"
            value={fields.firstName}
            disabled
          />

          <Input
            label="Last Name"
            value={fields.lastName}
            disabled
          />

          {/* Editable Status */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-500">
              Status
            </label>

            <select
              className="p-2 rounded-md border-2 border-orange-400 bg-white"
              value={fields.status}
              name="status"
              onChange={handleChange}
              disabled={saving}
            >
              <option>
                Quotation
              </option>

              <option>
                Quotation Sent
              </option>

              <option>
                Converted
              </option>

              <option>
                Follow-up
              </option>

              <option>
                Lost
              </option>
            </select>
          </div>

          {/* Editable Assigned To */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-500">
              Assigned To
            </label>

            <input
              name="assignedTo"
              value={
                fields.assignedTo
              }
              onChange={
                handleChange
              }
              disabled={saving}
              className="p-2 rounded-md border-2 border-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center mb-6 gap-3">
          <SlNote
            size={34}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />

          <h3 className="text-xl font-bold text-gray-600">
            Quotation Notes
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          {lead.notes?.length ? (
            lead.notes.map(
              (note) => (
                <div
                  key={note.id}
                  className="bg-gray-100 rounded-xl p-3"
                >
                  <div className="font-medium text-gray-700">
                    {
                      note.text
                    }
                  </div>

                  <div className="text-xs text-gray-600 text-end mt-2">
                    By{" "}
                    {
                      note.author
                    }{" "}
                    on{" "}
                    {new Date(
                      note.createdAt
                    ).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(
                      note.createdAt
                    ).toLocaleTimeString()}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-gray-400">
              No notes for this
              quotation yet.
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            rows={2}
            className="flex-1 p-3 bg-orange-50 rounded-xl border border-orange-200"
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) =>
              setNewNote(
                e.target.value
              )
            }
            disabled={noteSaving}
          />

          <button
            className="bg-[#FB6514] text-white px-4 py-2 rounded-md font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              noteSaving ||
              !newNote.trim()
            }
            onClick={handleAddNote}
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

// Reusable Input
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
      className="p-2 rounded-md border border-gray-200 bg-gray-100"
    />
  </div>
);

export default QuotationView;