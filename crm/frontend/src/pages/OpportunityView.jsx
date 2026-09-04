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

const OpportunityView = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const section =
    location.state?.fromSection || "Opportunities";

  const lead = useSelector(
    (state) =>
      state.leads.leads.find(
        (lead) => lead._id === id
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
      setOriginalFields({
        assignedTo:
          leadData.assignedTo || "",
        status: leadData.status || "",
        quoteAmount:
          leadData.quoteAmount || "",
      });
    }
  }, [lead, id]);

  // ✅ Detect changes only for editable fields
  useEffect(() => {
    if (!fields || !originalFields) return;

    const currentEditableFields = {
      assignedTo:
        fields.assignedTo || "",
      status: fields.status || "",
      quoteAmount:
        fields.quoteAmount || "",
    };

    const changed =
      JSON.stringify(
        currentEditableFields
      ) !== JSON.stringify(originalFields);

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
    // ✅ Prevent unnecessary update
    if (!isChanged) {
      toast.error("No changes detected.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        assignedTo: fields.assignedTo,
        status: fields.status,
        quoteAmount: fields.quoteAmount,
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
        status: fields.status || "",
        quoteAmount:
          fields.quoteAmount || "",
      });

      // ✅ Reset changed state
      setIsChanged(false);

      toast.success(
        "Opportunity updated!"
      );
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : "Update failed!"
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

  // ✅ Cancel Button
  const handleCancel = () => {
    navigate(`/${section}`);
  };

  const handleAddQuote = (lid) => {
    navigate(`/addQuotation/${lid}`);
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

      {/* Breadcrumbs */}
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
          {section}
        </Link>{" "}
        /
        <span className="text-[#C2410C]">
          {" "}
          {lead.name} Detail
        </span>
      </div>

      {/* Opportunity Details */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-600 mb-4 md:mb-0">
            <SlNote
              className="bg-orange-100 text-orange-500 rounded p-2"
              size={38}
            />
            Opportunity Information
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
                : "Update Opportunity"}
            </button>

            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-500 transition cursor-pointer"
            >
              Cancel
            </button>

            {(lead.status ===
              "Quotation" ||
              lead.status ===
                "Quotation Sent") && (
              <button
                type="button"
                onClick={() =>
                  handleAddQuote(
                    lead._id
                  )
                }
                className="bg-[#FB6514] text-white px-4 py-2 rounded-md font-semibold shadow cursor-pointer hover:brightness-110 transition"
              >
                Make Quotation
              </button>
            )}
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
            label="Lead Name"
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
              className="p-2 rounded-md border-2 border-orange-400 bg-white focus:outline-amber-400"
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

      {/* Lost Details */}
      {lead.status === "Lost" && (
        <div className="bg-red-50 border border-red-300 p-5 rounded-lg mt-6 shadow-sm">
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
              {lead.failedReason ||
                "N/A"}
            </div>
          </div>

          <div className="mb-3">
            <label className="block font-semibold text-red-600 mb-1">
              Lost Message
            </label>

            <div className="text-red-700 whitespace-pre-wrap">
              {lead.failedMessage ||
                "N/A"}
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

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center mb-6 gap-3">
          <SlNote
            size={34}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />

          <h3 className="text-xl font-bold text-gray-600">
            Opportunity Notes
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
              No notes for this
              opportunity yet.
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            rows={2}
            className="flex-1 p-3 bg-orange-50 rounded-xl outline-none border border-orange-200 text-gray-700"
            placeholder="Add a note about this opportunity..."
            value={newNote}
            onChange={(e) =>
              setNewNote(
                e.target.value
              )
            }
            disabled={noteSaving}
          />

          <button
            className="bg-[#FB6514] text-white px-4 py-2 rounded-md font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              noteSaving ||
              saving ||
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

// Input Component
const Input = ({
  label,
  className = "",
  ...props
}) => (
  <div className="flex flex-col mb-2">
    <label className="text-sm font-semibold mb-1 text-gray-500">
      {label}
    </label>

    <input
      {...props}
      className={`p-2 rounded-md border border-gray-200 bg-gray-100 focus:outline-none ${className}`}
    />
  </div>
);

export default OpportunityView;