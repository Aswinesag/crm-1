import React, { useState } from "react";
import { FiBell, FiLogOut, FiInbox } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaBarsStaggered } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import NotificationPopup from "./NotificationPopup";
import { markAllNotificationsRead } from "../redux/logSclice";
import { markAllLogsAsReadApi } from "../api/fetchdata";
import { getLogout } from "../redux/userSlice";

const Navbar = ({ menuOpen, setMenuOpen }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const me = useSelector((state) => state.users.currentUser);
  const logs = useSelector((state) => state.logs.logs);

  const filteredNotifications = logs.filter((log) => {
    return (
      (log.type === "lead_created" ||
        log.type === "lead_deleted" ||
        log.type === "user_created" ||
        log.type === "user_deleted" ||
        log.type === "leads_uploaded" ||
        (log.type === "status_change" &&
          log.details?.toStatus === "Converted")) &&
      log.userId !== me._id
    );
  });

  const unviewedCount = filteredNotifications.filter(
    (n) => !(n.readBy || []).includes(me._id)
  ).length;

  // 🔔 Notification click
  const handleNotificationClick = async () => {
    const willOpen = !openNotifications;
    setOpenNotifications(willOpen);

    if (willOpen && me?._id) {
      try {
        await markAllLogsAsReadApi(me._id);
        dispatch(markAllNotificationsRead(me._id));
      } catch (err) {
        console.error("Failed to mark logs as read:", err);
      }
    }
  };

  // 👤 Profile click
  const handleClickProfile = () => {
    setOpenProfile(!openProfile);
    navigate("/profile");
  };

  // 🎫 Support Ticket Click
  const handleTicketClick = () => {
    navigate("/tickets");
  };

  // 🔴 Logout
  const handleLogout = () => {
    dispatch(getLogout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="relative w-full border-b border-gray-300 shadow-xs h-[90px] top-0 z-50 bg-white">
      <div className="p-6 flex flex-row justify-between sm:justify-between md:justify-end">

        {/* ☰ Mobile menu */}
        <div className="block sm:block md:hidden">
          <FaBarsStaggered
            onClick={() => setMenuOpen(!menuOpen)}
            size={40}
            className="bg-orange-100 text-orange-500 rounded p-2"
          />
        </div>

        <div className="flex gap-4 items-center relative">

          {/* 🎫 Support Ticket Icon */}
          <div
            onClick={handleTicketClick}
            className="p-2 bg-orange-100 text-orange-500 rounded-full cursor-pointer hover:bg-orange-500 hover:text-white transition duration-300 relative group"
          >
            <FiInbox size={22} />

            {/* Tooltip */}
            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Tickets
            </span>
          </div>

          {/* 🔔 Notifications */}
          <div
            className="p-2 bg-orange-100 text-orange-500 rounded-full cursor-pointer hover:bg-orange-500 hover:text-white transition duration-300 relative group"
            onClick={handleNotificationClick}
          >
            <FiBell size={22} />

            {/* Tooltip */}
            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Notifications
            </span>

            {unviewedCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                {unviewedCount}
              </span>
            )}
          </div>

          <NotificationPopup
            setOpenNotifications={setOpenNotifications}
            visible={openNotifications}
          />

          {/* 👤 Profile */}
          <div
            className="relative cursor-pointer group"
            onClick={() => setOpenProfile(!openProfile)}
          >
            {me?.avatar ? (
              <img
                src={me.avatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <FaUserCircle className="text-orange-500" size={30} />
            )}

            {/* Tooltip */}
            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Profile
            </span>
          </div>

          {/* Dropdown */}
          {openProfile && (
            <div className="p-3 bg-white rounded-md z-20 absolute top-20 right-12 shadow-md cursor-pointer w-[160px]">
              <div
                className="flex gap-2 items-center cursor-pointer hover:text-orange-500 transition"
                onClick={handleClickProfile}
              >
                <IoMdSettings />
                Profile Setting
              </div>
            </div>
          )}

          {/* 👤 Username */}
          <div className="text-xl font-medium">
            {me?.name}
          </div>

          {/* 🔴 Logout Icon Button */}
          <div
            onClick={handleLogout}
            className="ml-3 p-2 bg-red-100 text-red-500 rounded-full cursor-pointer hover:bg-red-500 hover:text-white transition duration-300 relative group"
          >
            <FiLogOut size={22} />

            {/* Tooltip */}
            <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Logout
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Navbar;