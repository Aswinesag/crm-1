import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

Modal.setAppElement("#root");

const CalendarComponent = () => {
  const currentUser = useSelector((state) => state.users.currentUser);
  const currentUserRole = currentUser?.role || "";
  const remainders = useSelector((state) => state.remainders.remainders);
  const users = useSelector((state) => state.users.users);

  // Filter reminders by date - only today or upcoming
  const filteredremainders = remainders.filter(
    (r) => r.date >= new Date().toISOString().split("T")[0]
  );

  // Optionally apply role-based filtering (uncomment if needed)
  const filteredEvents = filteredremainders.filter((event) => {
    if (currentUserRole === "Admin" || currentUserRole === "Super Admin" || currentUserRole === "Engineer")
      return true;
    // return event.assignedTo === currentUser?._id;
  });

  // For now just use all filtered reminders
  // const filteredEvents = filteredremainders;

  // Map events to FullCalendar format including extendedProps
  const enrichedEvents = filteredEvents.map((event) => ({
    title: event.title,
    start: event.date,
    extendedProps: {
      // assignedTo: event.assignedTo, // Custom field must be here
      createby: users.find((u) => u._id === event.userId)?.name || "Unknown",
      leadId: event.leadId,
      // Include any other needed custom props here
    },
  }));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const renderEventContent = (eventInfo) => {
    const viewType = eventInfo.view.type;
    if (viewType === "dayGridMonth") {
      return (
        <span
          className="font-semibold p-1 w-full overflow-hidden rounded"
          style={{ backgroundColor: "#3b82f6", color: "white" }}
        >
          {eventInfo.event.title}
        </span>
      );
    } else if (viewType === "listMonth") {
      return (
        <div className="flex flex-col">
          <span className="font-semibold">
            {eventInfo.event.start.toLocaleString()} – {eventInfo.event.title}
          </span>
          <span className="text-sm text-gray-500">
            Created By: {eventInfo.event.extendedProps.createby}
          </span>
        </div>
      );
    }
  };

  // Safely get assigned user name for the modal display
  // const assignedUserName =
  //   selectedEvent && selectedEvent.extendedProps
  //     ? users.find((u) => u._id === selectedEvent.extendedProps.assignedTo) ||
  //       "Unknown"
  //     : "";

  return (
    <div className="bg-white p-2 md:p-4 rounded-md shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listMonth",
        }}
        height={600}
        events={enrichedEvents}
        eventContent={renderEventContent}
        eventDidMount={(info) => {
          tippy(info.el, {
            content: `<strong>${info.event.title}</strong><br/>${info.event.start.toLocaleString()}
            <br/>CreatedBy: ${info.event.extendedProps.createby}
             `,
            allowHTML: true,
          });
        }}
        eventClick={(info) => {
          setSelectedEvent(info.event);
          setModalOpen(true);
        }}
      />

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Event Details"
        className="bg-white rounded-lg p-6 max-w-md w-full mx-2 md:mx-auto my-10 md:my-20 shadow-xl relative"
        overlayClassName="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50"
      >
        {selectedEvent && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
            <p className="mb-2">
              <strong>Date:</strong> {selectedEvent.start.toLocaleString()}
            </p>
            <p className="mb-4">
              <strong>Created By:</strong> {selectedEvent.extendedProps.createby}
            </p>
            {/* <p className="mb-4">
              <strong>Assigned To:</strong> {assignedUserName}
            </p> */}
            <p>
              <strong>Lead:</strong>{" "}
              <Link
                to={`/opportunityView/${selectedEvent.extendedProps.leadId}`}
                className="hover:text-[#C2410C]"
              >
                Lead Info
              </Link>
            </p>
            <div className="flex justify-end w-full">
              <button
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarComponent;
