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
  setEngineerTaskCounts,
} from "../redux/leadSlice";

import { SlNote } from "react-icons/sl";

import {
  updateLeadStatus,
  addNoteToLeadApi,
  fetchEngineersWithTaskCount,
} from "../api/fetchdata";

import { MdErrorOutline } from "react-icons/md";

const EnquiryView = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const section =
    location.state?.fromSection || "enquiry";

  const lead = useSelector(
    (state) =>
      state.leads.leads.find(
        (l) => l._id === id
      ) || null
  );

  const engineerTaskCounts = useSelector(
    (state) => state.leads.engineer_taskCounts
  );

  const [saving, setSaving] = useState(false);

  const [fields, setFields] = useState(null);

  // ✅ Store original editable values
  const [originalFields, setOriginalFields] =
    useState(null);

  // ✅ Track changes
  const [isChanged, setIsChanged] =
    useState(false);

  const [newNote, setNewNote] = useState("");

  const [noteSaving, setNoteSaving] =
    useState(false);

  // Load data into local state
  useEffect(() => {
    if (lead) {
      const enquiryData = {
        name: lead.name || "",
        company: lead.company || "",
        assignedTo: lead.assignedTo || "",
        priority: lead.priority || "",
        status: lead.status || "",
        email: lead.email || "",
        phone: lead.phone || "",
        country: lead.country || "",
        state: lead.state || "",
        city: lead.city || "",
        address: lead.address || "",
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
      };

      setFields(enquiryData);

      // ✅ Save original editable fields
      setOriginalFields({
        assignedTo:
          enquiryData.assignedTo || "",
        status:
          enquiryData.status || "",
      });
    }
  }, [lead]);

  // ✅ Detect changes only in editable fields
  useEffect(() => {
    if (!fields || !originalFields) return;

    const currentEditableFields = {
      assignedTo:
        fields.assignedTo || "",
      status:
        fields.status || "",
    };

    const changed =
      JSON.stringify(
        currentEditableFields
      ) !== JSON.stringify(originalFields);

    setIsChanged(changed);
  }, [fields, originalFields]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Update only when changes exist
  const handleUpdate = async () => {
    // Prevent unnecessary update
    if (!isChanged) {
      toast.error("No changes detected.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        assignedTo:
          fields.assignedTo,
        status: fields.status,
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

      const data =
        await fetchEngineersWithTaskCount();

      dispatch(
        setEngineerTaskCounts(data)
      );

      // ✅ Reset original values
      setOriginalFields({
        assignedTo:
          fields.assignedTo || "",
        status:
          fields.status || "",
      });

      // ✅ Reset change state
      setIsChanged(false);

      toast.success(
        "Enquiry updated!"
      );
    } catch (err) {
      toast.error("Update failed!");
    } finally {
      setSaving(false);
    }
  };

  // Add note
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
    } catch (err) {
      toast.error(
        "Failed to add note."
      );
    } finally {
      setNoteSaving(false);
    }
  };

  // Cancel → go back
  const handleCancel = () => {
    navigate(`/${section}`);
  };

  if (!lead || !fields) {
    return (
      <div className="p-8">
        Loading enquiry data...
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
          Enquiry
        </Link>{" "}
        /
        <span className="text-[#C2410C]">
          {" "}
          {lead.name} Detail
        </span>
      </div>

      {/* Enquiry Info */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-600 mb-4 md:mb-0">
            <SlNote
              className="bg-orange-100 text-orange-500 rounded p-2"
              size={38}
            />
            Enquiry Information
          </h2>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-md font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed
              ${
                isChanged
                  ? "bg-[#FB6514] text-white hover:brightness-110 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={
                saving || !isChanged
              }
              onClick={handleUpdate}
            >
              {saving
                ? "Saving..."
                : "Update Enquiry"}
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

          {/* Editable Field */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-500">
              Assigned To
            </label>

            <select
              className="p-2 rounded-md border-2 border-orange-400 bg-white"
              value={fields.assignedTo}
              name="assignedTo"
              onChange={handleChange}
              disabled={saving}
            >
              <option value="">
                Select Engineer
              </option>

              {engineerTaskCounts.map(
                (eng, idx) => (
                  <option
                    key={idx}
                    value={eng.name}
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
        </div>
      </div>

      {/* Lost Section */}
      {lead.status === "Lost" && (
        <div className="bg-red-50 border border-red-300 p-5 rounded-lg mt-6">
          <div className="flex items-center mb-4">
            <MdErrorOutline
              className="text-red-600 mr-2"
              size={28}
            />

            <h3 className="text-lg font-bold text-red-700">
              Lost Enquiry Details
            </h3>
          </div>

          <p>
            <b>Reason:</b>{" "}
            {lead.failedReason ||
              "N/A"}
          </p>

          <p>
            <b>Message:</b>{" "}
            {lead.failedMessage ||
              "N/A"}
          </p>

          <p>
            <b>Date:</b>{" "}
            {lead.failedDate
              ? new Date(
                  lead.failedDate
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-600 mb-4">
          Enquiry Notes
        </h3>

        {lead.notes?.length ? (
          lead.notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-100 p-3 rounded mb-2"
            >
              <p>{note.text}</p>

              <small>
                {note.author} -{" "}
                {new Date(
                  note.createdAt
                ).toLocaleString()}
              </small>
            </div>
          ))
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
            disabled={noteSaving}
          />

          <button
            onClick={handleAddNote}
            disabled={
              noteSaving ||
              saving ||
              !newNote.trim()
            }
            className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
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
    <label className="text-sm text-gray-500">
      {label}
    </label>

    <input
      {...props}
      className="p-2 border rounded bg-gray-100"
    />
  </div>
);

export default EnquiryView;