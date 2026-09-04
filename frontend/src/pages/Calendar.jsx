import React, { useState } from 'react';
import CalendarComponent from '../components/CalendarComponent.jsx';
import ReminderPopup from '../components/ReminderPopup.jsx';

const Calendar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full p-2 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-lg md:text-xl font-semibold">
          {new Date().toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
        </h1>
        <button
          className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 transition cursor-pointer"
          onClick={() => setOpen(true)}
        >
          + Add Reminder
        </button>
      </div>

      {/* Calendar */}
      <div className="w-full">
        <CalendarComponent />
      </div>

      {/* Reminder Popup */}
        {open && <ReminderPopup setOpen={setOpen} />}
    </div>
  );
};

export default Calendar;
