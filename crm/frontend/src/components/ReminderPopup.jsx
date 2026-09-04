import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addReminderApi } from "../api/fetchdata";
import { addReminder } from "../redux/remainderSlice";

const ReminderPopup = ({ setOpen }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.users.currentUser);
  const dummyLeads = useSelector((state) => state.leads.leads);

  // Assuming engineersWithTaskCount exists in redux (adjust selector as per your store)
  const engineers = useSelector((state) => state.leads.engineer_taskCounts || []);

  const Lead = dummyLeads.filter((lead) =>
    ["Enquiry", "Opportunity", "Quotation", "Follow-up"].includes(lead.status)
  );

  // Controlled inputs state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [leadId, setLeadId] = useState("");
  const [gmeetLink,setGmeetLink] = useState("");

  // For multi-select and emails
  const [selectedEngineers, setSelectedEngineers] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [customerEmails, setCustomerEmails] = useState([]);

  function getLocalDatetimeForMinInput() {
    const now = new Date();
    const pad = (num) => (num < 10 ? "0" + num : num);
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleAddEngineer = (e) => {
    if (selectedEngineers.length >= 4) {
    toast.error("Maximum 4 engineers can be added");
    e.target.value = ""; // Reset select
    return;
  }
    const selectedId = e.target.value;
    if (selectedId && !selectedEngineers.some((eng) => eng._id === selectedId)) {
      const eng = engineers.find((eng) => eng._id === selectedId);
      if (eng) setSelectedEngineers((prev) => [...prev, eng]);
    }
    e.target.value = ""; // Reset select
  };

  const removeEngineer = (id) => {
    setSelectedEngineers((prev) => prev.filter((eng) => eng._id !== id));
  };

  const handleAddCustomerEmail = () => {
    if (customerEmails.length >= 5) {
    toast.error("Maximum 5 customer emails can be added");
    return;
  }
    const email = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email) && !customerEmails.includes(email)) {
      setCustomerEmails((prev) => [...prev, email]);
      setEmailInput("");
    } else if (email && !emailRegex.test(email)) {
      toast.error("Invalid email address");
    }
  };

  const removeCustomerEmail = (email) => {
    setCustomerEmails((prev) => prev.filter((em) => em !== email));
  };

  const handleAddReminder = async () => {
    if (!title || !dateTime) {
      toast.error("Please provide both title and date/time");
      return;
    }
    const selectedTime = new Date(dateTime);
    if (selectedTime <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }
    try {
      const payload = {
        title,
        description,
        date: dateTime,
        leadId: leadId || null,
        userId: currentUser?._id,
        createby: currentUser?.name || "",
        // assignedTo: currentUser?.name || "Name are not provide",
        engineerIds: selectedEngineers.map((eng) => eng._id),
        customerEmails,
        gmeetLink
      };
      console.log("Adding Reminder with payload:", payload);
      await addReminderApi(payload);
      dispatch(addReminder(payload));
      toast.success("Reminder added successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error("Failed to add reminder");
    }
  };

  return (
    <div className="bg-gray-200 bg-opacity-30 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] max-h-[100vh] overflow-y-auto rounded-md p-5 relative shadow-lg">
        <h1 className="text-xl font-semibold">Add New Reminder</h1>
        <div className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-black" onClick={() => setOpen(false)}>✕</div>

        <div className="mt-3 flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Title</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
              placeholder="Enter Reminder Title here"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Description</label>
            <textarea
              className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {/* DateTime */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Date and Time</label>
            <input
              type="datetime-local"
              className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              min={getLocalDatetimeForMinInput()}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Meeting Link</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
              value={gmeetLink}
              onChange={(e) => setGmeetLink(e.target.value)}
              min={getLocalDatetimeForMinInput()}
              placeholder="Please give meet link"
            />
          </div>
          {/* Lead */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Lead</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
            >
              <option value="">None</option>
              {Lead.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name} ({lead.status})
                </option>
              ))}
            </select>
          </div>

          {/* Engineers multi-select */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Add Engineers</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
              onChange={handleAddEngineer}
              defaultValue=""
            >
              <option value="" disabled>
                Select Engineer
              </option>
              {engineers.map((eng) => (
                <option key={eng._id} value={eng._id}>
                  {eng.name} 
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedEngineers.map((eng) => (
                <div
                  key={eng._id}
                  className="bg-orange-200 text-orange-900 rounded-full px-3 py-1 flex items-center gap-2"
                >
                  <span>{eng.name}</span>
                  <button
                    onClick={() => removeEngineer(eng._id)}
                    className="text-orange-700 hover:text-orange-900 font-bold"
                    aria-label={`Remove ${eng.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer emails input */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 font-semibold">Add Customer Emails</label>
            <div className="flex gap-2">
              <input
                type="email"
                className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none flex-grow"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email"
              />
              <button
                className="bg-orange-500 text-white px-3 py-2 rounded-md cursor-pointer"
                onClick={handleAddCustomerEmail}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {customerEmails.map((email) => (
                <div
                  key={email}
                  className="bg-orange-200 text-orange-900 rounded-full px-3 py-1 flex items-center gap-2"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => removeCustomerEmail(email)}
                    className="text-orange-700 hover:text-orange-900 font-bold"
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              className="px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-orange-500 text-white px-3 py-2 rounded-md cursor-pointer"
              onClick={handleAddReminder}
            >
              Add Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup;
