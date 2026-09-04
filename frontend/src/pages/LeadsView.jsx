import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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

const LeadView = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lead = useSelector(
    (state) => state.leads.leads.find((lead) => lead._id === id) || null
  );

  const engineerTaskCounts = useSelector(
    (state) => state.leads.engineer_taskCounts
  );

  const [fields, setFields] = useState(null);

  // ✅ NEW: store original data for comparison
  const [originalFields, setOriginalFields] = useState(null);

  // ✅ NEW: track if changes are made
  const [isChanged, setIsChanged] = useState(false);

  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const statusOptions = [
    { value: "Yet to Start", label: "Yet to Start" },
    { value: "Work In Progress", label: "Work In Progress" },
    { value: "Opportunity", label: "Qualified" },
    { value: "Lost", label: "Not Qualified" },
  ];

  useEffect(() => {
    if (lead) {
      const leadData = {
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
        quoteAmount: lead.quoteAmount || "",
      };

      setFields(leadData);

      // ✅ Save original values
      setOriginalFields(leadData);
    }
  }, [lead]);

  // ✅ Detect field changes
  useEffect(() => {
    if (!fields || !originalFields) return;

    const changed =
      JSON.stringify(fields) !== JSON.stringify(originalFields);

    setIsChanged(changed);
  }, [fields, originalFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Update only if changes exist
  const handleUpdate = async () => {
    // ✅ Prevent unnecessary API call
    if (!isChanged) {
      toast.error("No changes detected.");
      return;
    }

    setSaving(true);

    try {
      const updated = await updateLeadStatus(id, fields);

      dispatch(updateLead({ id, changes: updated }));

      const engineers = await fetchEngineersWithTaskCount();

      dispatch(setEngineerTaskCounts(engineers));

      // ✅ Reset original data after successful update
      setOriginalFields(fields);

      // ✅ Reset change tracking
      setIsChanged(false);

      toast.success("Lead updated!");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Update failed!"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      return toast.error("Cannot add empty note.");
    }

    setNoteSaving(true);

    try {
      const updatedLead = await addNoteToLeadApi(id, newNote);

      dispatch(
        addnote({
          id,
          note: updatedLead.notes[updatedLead.notes.length - 1],
        })
      );

      toast.success("Note added.");

      setNewNote("");
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : "Failed to add note."
      );
    } finally {
      setNoteSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  if (!lead || !fields) {
    return (
      <div className="p-8">
        Loading lead data...
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
        /{" "}
        <Link
          to="/leads"
          className="hover:text-[#C2410C]"
        >
          Leads
        </Link>{" "}
        /{" "}
        <span className="text-[#C2410C]">
          Lead Detail
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
            Lead Information
          </h2>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              disabled={saving || !isChanged}
              onClick={handleUpdate}
              className={`px-4 py-2 rounded-md font-semibold shadow transition
                ${
                  isChanged
                    ? "bg-[#FB6514] text-white hover:brightness-110 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {saving ? "Saving..." : "Update Lead"}
            </button>

            <button
              onClick={handleCancel}
              className="bg-gray-400 cursor-pointer text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Optional change indicator */}
        {isChanged && (
          <div className="mb-5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            You have unsaved changes.
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Lead Name"
            name="name"
            value={fields.name}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="Company"
            name="company"
            value={fields.company}
            onChange={handleChange}
            disabled={saving}
          />

          <Select
            label="Priority"
            name="priority"
            value={fields.priority}
            onChange={handleChange}
            disabled={saving}
            options={[
              { label: "High", value: "High" },
              { label: "Medium", value: "Medium" },
              { label: "Low", value: "Low" },
            ]}
          />

          <Input
            label="Email"
            name="email"
            value={fields.email}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="Phone"
            name="phone"
            value={fields.phone}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="Country"
            name="country"
            value={fields.country}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="State"
            name="state"
            value={fields.state}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="City"
            name="city"
            value={fields.city}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="Address"
            name="address"
            value={fields.address}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="First Name"
            name="firstName"
            value={fields.firstName}
            onChange={handleChange}
            disabled={saving}
          />

          <Input
            label="Last Name"
            name="lastName"
            value={fields.lastName}
            onChange={handleChange}
            disabled={saving}
          />

          {fields.quoteAmount && (
            <Input
              label="Quote Amount"
              name="quoteAmount"
              value={fields.quoteAmount}
              disabled
              readOnly
            />
          )}
        </div>
      </div>

      {/* Failed Lead Details */}
      {lead.status === "Failed" && (
        <div className="bg-red-50 border border-red-300 p-5 rounded-lg max-w-5xl mx-auto mt-6 shadow-sm">
          <div className="flex items-center mb-4">
            <MdErrorOutline
              className="text-red-600 mr-2"
              size={28}
            />

            <h3 className="text-lg font-bold text-red-700">
              Lost Lead Details
            </h3>
          </div>

          <div className="mb-3">
            <label className="block font-semibold text-red-600 mb-1">
              Lost Reason
            </label>

            <div className="text-red-700">
              {lead.failedReason || "N/A"}
            </div>
          </div>

          <div className="mb-3">
            <label className="block font-semibold text-red-600 mb-1">
              Lost Message
            </label>

            <div className="text-red-700 whitespace-pre-wrap">
              {lead.failedMessage || "N/A"}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-red-600 mb-1">
              Lost Date
            </label>

            <div className="text-red-700">
              {lead.failedDate
                ? new Date(
                    lead.failedDate
                  ).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <SlNote
            size={34}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />

          <h3 className="text-xl font-bold text-gray-600">
            Lead Notes
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          {Array.isArray(lead.notes) &&
          lead.notes.length > 0 ? (
            lead.notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-100 rounded-xl p-3"
              >
                <div className="font-medium text-gray-700">
                  {note.text}
                </div>

                <div className="text-xs text-gray-600 text-end mt-2">
                  By {note.author} on{" "}
                  {new Date(
                    note.createdAt
                  ).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(
                    note.createdAt
                  ).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No notes for this lead yet.
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            rows={2}
            className="flex-1 p-3 bg-orange-50 rounded-xl outline-none border border-orange-200 text-gray-700"
            placeholder="Add a note about this lead..."
            value={newNote}
            onChange={(e) =>
              setNewNote(e.target.value)
            }
            disabled={noteSaving}
          />

          <button
            className="bg-[#FB6514] text-white px-4 py-2 rounded-md font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              noteSaving ||
              saving ||
              !newNote.trim()
            }
            onClick={handleAddNote}
          >
            {noteSaving ? "Adding..." : "Add Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Input Component
const Input = ({ label, ...props }) => (
  <div className="flex flex-col mb-2">
    <label className="text-sm font-semibold mb-1 text-gray-500">
      {label}
    </label>

    <input
      {...props}
      className="p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-amber-400"
    />
  </div>
);

// Select Component
const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col mb-2">
    <label className="text-sm font-semibold mb-1 text-gray-500">
      {label}
    </label>

    <select
      {...props}
      className="p-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-amber-400"
    >
      <option value="">
        {`Select ${label}`}
      </option>

      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  </div>
);

export default LeadView;