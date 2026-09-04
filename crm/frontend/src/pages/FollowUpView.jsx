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

const FollowUpView = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const section =
    location.state?.fromSection || "followup";

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
      const followupData = {
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
      };

      setFields(followupData);

      // ✅ Save only editable fields
      setOriginalFields({
        status:
          followupData.status || "",
        assignedTo:
          followupData.assignedTo || "",
      });
    }
  }, [lead]);

  // ✅ Detect changes
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

  // ✅ Update only if changes exist
  const handleUpdate = async () => {
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

      // ✅ Reset change tracker
      setIsChanged(false);

      toast.success(
        "Follow-up updated!"
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

  if (!lead || !fields) {
    return (
      <div className="p-8">
        Loading follow-up
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
          Follow-ups
        </Link>{" "}
        /
        <span className="text-[#C2410C]">
          {" "}
          {lead.name} Detail
        </span>
      </div>

      {/* Info Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-600 mb-4 md:mb-0">
            <SlNote
              className="bg-orange-100 text-orange-500 rounded p-2"
              size={38}
            />
            Follow-up Information
          </h2>

          <div className="flex gap-3">
            {/* ✅ Update Button */}
            <button
              onClick={handleUpdate}
              disabled={
                saving || !isChanged
              }
              className={`px-4 py-2 rounded-md font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed
              ${
                isChanged
                  ? "bg-[#FB6514] text-white hover:brightness-110"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving
                ? "Saving..."
                : "Update"}
            </button>

            {/* Cancel Button */}
            <button
              onClick={() =>
                navigate(
                  `/${section}`
                )
              }
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ✅ Unsaved Changes Message */}
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
            label="Address"
            value={fields.address}
            disabled
          />

          {/* Editable Status */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-500">
              Status
            </label>

            <select
              name="status"
              value={fields.status}
              onChange={handleChange}
              disabled={saving}
              className="p-2 rounded-md border-2 border-orange-400 bg-white focus:outline-amber-400"
            >
              <option>
                Follow-up
              </option>

              <option>
                Quotation
              </option>

              <option>
                Converted
              </option>

              <option>
                Lost
              </option>
            </select>
          </div>

          {/* Editable Assigned To */}
          <Input
            label="Assigned To"
            name="assignedTo"
            value={
              fields.assignedTo
            }
            onChange={
              handleChange
            }
            disabled={saving}
            className="border-2 border-orange-400 bg-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-6 gap-3">
          <SlNote
            size={34}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />

          <h3 className="text-xl font-bold text-gray-600">
            Follow-up Notes
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          {lead.notes?.length ? (
            lead.notes.map(
              (note) => (
                <div
                  key={note.id}
                  className="bg-gray-100 p-3 rounded-xl"
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
            <p className="text-gray-400">
              No notes yet
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            rows={2}
            className="flex-1 p-3 bg-orange-50 rounded-xl border border-orange-200 outline-none"
            value={newNote}
            onChange={(e) =>
              setNewNote(
                e.target.value
              )
            }
            disabled={noteSaving}
            placeholder="Add a note..."
          />

          <button
            onClick={handleAddNote}
            disabled={
              noteSaving ||
              !newNote.trim()
            }
            className="bg-[#FB6514] text-white px-4 py-2 rounded-md font-bold disabled:opacity-60 disabled:cursor-not-allowed"
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
  className = "",
  ...props
}) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-500 mb-1">
      {label}
    </label>

    <input
      {...props}
      className={`p-2 border rounded bg-gray-100 focus:outline-none ${className}`}
    />
  </div>
);

export default FollowUpView;