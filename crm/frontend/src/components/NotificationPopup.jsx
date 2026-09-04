import React from "react";
import { useSelector } from "react-redux";
import { SquareX } from "lucide-react";

const NotificationPopup = ({ visible, setOpenNotifications }) => {
  const logs = useSelector((state) => state.logs.logs);
  const me = useSelector((state) => state.users.currentUser);

  const filteredNotifications = logs.filter((log) => {
    return (
      (
        log.type === "lead_created" ||
        log.type === "lead_deleted" ||
        log.type === "user_created" ||
        log.type === "user_deleted" ||
        log.type === "leads_uploaded" ||
        (log.type === "status_change" &&
          log.details?.toStatus === "Converted")
      ) &&
      (log.userId !== me._id)
    );
  });

  if (!visible) return null;

  return (
    <div
      className="absolute right-6 top-full mt-2 w-80 max-h-96 overflow-y-auto 
      bg-gray-50 border border-orange-200 rounded-lg z-50 p-4"
      style={{
        boxShadow: "0 6px 20px rgba(251, 101, 20, 0.25)", // ✅ custom orange shadow
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h4 className="font-bold text-gray-700">
          Notifications
        </h4>

        <div className="cursor-pointer text-gray-500 hover:text-red-500 transition">
          <SquareX onClick={() => setOpenNotifications(false)} />
        </div>
      </div>

      {/* BODY */}
      {filteredNotifications.length === 0 ? (
        <p className="text-gray-500 text-center italic">
          No new notifications
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredNotifications.map((notif) => (
            <li
              key={notif._id}
              className="bg-white rounded-md p-3 border border-gray-100 
              shadow-sm hover:shadow-md transition"
            >
              <p className="text-gray-900 font-medium text-sm">
                {notif.type === "lead_created" && (
                  <>
                    Lead <strong>{notif.details.leadName}</strong> created and assigned to{" "}
                    <strong>{notif.details.assignedTo}</strong>.
                  </>
                )}

                {notif.type === "lead_deleted" && (
                  <>
                    Lead <strong>{notif.details.leadName}</strong> was deleted.
                  </>
                )}

                {(notif.type === "user_created" || notif.type === "user_deleted") && (
                  <>
                    User <strong>{notif.details.userName}</strong>{" "}
                    {notif.type === "user_created" ? "created" : "deleted"}.
                  </>
                )}

                {notif.type === "leads_uploaded" && (
                  <>
                    User <strong>{notif.user}</strong> uploaded{" "}
                    {notif.details.leadcount} leads.
                  </>
                )}

                {notif.type === "status_change" &&
                  notif.details?.toStatus === "Converted" && (
                    <>
                      Lead <strong>{notif.details.leadName}</strong> has been converted.
                    </>
                  )}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPopup;