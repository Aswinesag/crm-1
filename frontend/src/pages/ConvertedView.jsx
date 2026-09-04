import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { SlNote } from "react-icons/sl";
import toast, { Toaster } from "react-hot-toast";

const ConvertedView = () => {
  const { id } = useParams();

  // Get lead data from Redux store
  const lead = useSelector(
    (state) => state.leads.leads.find((lead) => lead._id === id) || null
  );

  const [fields, setFields] = useState(null);

  useEffect(() => {
    if (lead) {
      setFields({
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
      });
    }
  }, [lead, id]);

  if (!lead || !fields)
    return <div className="p-8">Loading converted lead data...</div>;

  return (
    <div className="mt-4 max-w-5xl mx-auto">
      <Toaster />
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        /{" "}
        <Link to="/converted" className="hover:text-[#C2410C]">
          Converted Leads
        </Link>{" "}
        /<span className="text-[#C2410C]"> Converted Detail</span>
      </div>

      {/* Converted Opportunity Details */}
      <div className="bg-white mt-6 p-6 rounded-xl shadow-md">
        <div className="flex flex-col gap-2 md:flex-row justify-between items-center mb-6 ">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-600 mb-4 md:mb-0">
            <SlNote
              className="bg-orange-100 text-orange-500 rounded p-2"
              size={38}
            />
            Converted Lead Information (Read-Only)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <ReadOnlyInput label="Lead Name" value={fields.name} />
          <ReadOnlyInput label="Company" value={fields.company} />
          <ReadOnlyInput label="Priority" value={fields.priority} />
          <ReadOnlyInput label="Email" value={fields.email} />
          <ReadOnlyInput label="Phone" value={fields.phone} />
          <ReadOnlyInput label="Country" value={fields.country} />
          <ReadOnlyInput label="State" value={fields.state} />
          <ReadOnlyInput label="City" value={fields.city} />
          <ReadOnlyInput label="Address" value={fields.address} />
          <ReadOnlyInput label="First Name" value={fields.firstName} />
          <ReadOnlyInput label="Last Name" value={fields.lastName} />
          <ReadOnlyInput label="Assigned To" value={fields.assignedTo} />
          <ReadOnlyInput label="Status" value={fields.status} />
        </div>
      </div>

      {/* Notes (Read-only) */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center mb-6 gap-3">
          <SlNote
            size={34}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />
          <h3 className="text-xl font-bold text-gray-600">
            Converted Lead Notes
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          {Array.isArray(lead.notes) && lead.notes.length > 0 ? (
            lead.notes.map((note) => (
              <div key={note.id} className="bg-gray-100 rounded-xl p-3">
                <div className="font-medium text-gray-700">{note.text}</div>
                <div className="text-xs text-gray-600 text-end mt-2">
                  By {note.author} on{" "}
                  {new Date(note.createdAt).toLocaleDateString()} at{" "}
                  {new Date(note.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              No notes for this converted lead yet.
            </div>
          )}
        </div>

        {/* 🚫 No option to add notes */}
        <div className="text-gray-400 italic text-center">
          Notes are read-only in Converted View.
        </div>
      </div>
    </div>
  );
};

// Read-only field component
const ReadOnlyInput = ({ label, value }) => (
  <div className="flex flex-col mb-2">
    <label className="text-sm font-semibold mb-1 text-gray-500">{label}</label>
    <input
      value={value}
      disabled
      className="p-2 rounded-md border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
    />
  </div>
);

export default ConvertedView;
