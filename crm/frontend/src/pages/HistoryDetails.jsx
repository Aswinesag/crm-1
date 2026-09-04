import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const HistoryDetails = () => {
  const location = useLocation()
  const navigate = useNavigate();

  const history = location.state?.historyObj

  if (!history) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-800 font-semibold mb-4">No leads data found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition duration-150 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>

    <div className=" text-end">
        {/* <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        {/* / <Link to='/leadsHistory'><span className="hover:text-[#C2410C]"> Leads History </span></Link> */}
        {/* / <span className="text-[#C2410C]"> View Leads </span> */} 
        <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded mr-3 bg-orange-500 text-white hover:bg-orange-600 transition duration-150 cursor-pointer"
          >
            Go Back
          </button>
    </div>

    <div className="min-h-screen bg-gray-100 py-5 px-4 mt-[-50px] mb-[-20px]">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{`Details for ${history.name}`}</h2>
        </header>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Lead Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 text-sm">
            <div className="sm:col-span-2">
              <dt className="font-medium">Name:</dt>
              <dd>{history.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Email:</dt>
              <dd className="break-words">{history.email || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Phone:</dt>
              <dd>{history.phone || "N/A"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium">Company:</dt>
              <dd>{history.company || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Created By:</dt>
              <dd>{history.createdBy || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Assigned To:</dt>
              <dd>{history.assignedTo || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Status:</dt>
              <dd>{history.status || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Source:</dt>
              <dd>{history.source || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Priority:</dt>
              <dd>{history.priority || "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium">Created Date:</dt>
              <dd>{new Date(history.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium">Last Modified:</dt>
              <dd>{new Date(history.updatedAt).toLocaleDateString()}</dd>
            </div>
            {history.quoteAmount && (
              <div className="sm:col-span-2">
                <dt className="font-medium">Quote Amount:</dt>
                <dd>${history.quoteAmount.toLocaleString()}</dd>
              </div>
            )}
            {(history.status === "Lost" || history.status === "deleted" && history.failedReason) && (
              <>
                <div className="sm:col-span-2">
                  <dt className="font-medium">Lost Reason:</dt>
                  <dd>{history.failedReason}</dd>
                </div>
                {history.failedMessage && (
                  <div className="sm:col-span-2">
                    <dt className="font-medium">Lost Message:</dt>
                    <dd>{history.failedMessage}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Notes ({history.notes ? history.notes.length : 0})
          </h3>
          {history.notes && history.notes.length > 0 ? (
            <ul className="space-y-4 max-h-72 overflow-y-auto text-gray-700 text-sm">
              {history.notes
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((note) => (
                  <li key={note.id} className="bg-gray-50 rounded-md p-3">
                    <p>{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By {note.author} on {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No notes for this lead.</p>
          )}
        </section>
      </div>
    </div>
    </div>
  );
};

export default HistoryDetails;
