import React, { useEffect, useState } from "react";
import {
  FaTasks, FaFileAlt, FaToggleOn, FaUserPlus, FaSignInAlt, FaFilter, FaCalendar
} from "react-icons/fa";
import axiosInstance from '../api/axiosInstance.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { setLogs } from "../redux/logSclice.jsx";
import { FaUserXmark } from "react-icons/fa6";
import { FaUserPen } from "react-icons/fa6";

const ActivityLogs = () => {

  const dispatch = useDispatch()
  
  const activityLogs = useSelector((state) => state.logs.logs)
  console.log(activityLogs)

  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const activityTypes = [
    { key: "all", label: "All Activities", icon: FaTasks },
    { key: "lead_created", label: "Lead Created", icon: FaFileAlt },
    { key : "lead_deleted", label: "Lead Deleted", icon: FaFileAlt },
    { key: "status_change", label: "Status Changes", icon: FaToggleOn },
    { key: "note_added", label: "Notes Added", icon: FaFileAlt },
    { key: "user_login", label: "User Login", icon: FaSignInAlt },
    { key: "user_created", label: "User Created", icon: FaUserPlus },
    { key: "user_updated", label: "User Updated", icon: FaUserPen },
    { key : "user_deleted", label: "User Deleted", icon: FaUserXmark },
  ];

  const filteredLogs = [...activityLogs]
  .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
  .filter((log) => {
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesUser = filterUser === "all" || log.user === filterUser;
    const matchesSearch =
      searchTerm === "" ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesUser && matchesSearch;
  });

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find((at) => at.key === type);
    if (activityType) {
      const IconComponent = activityType.icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return <FaTasks className="w-5 h-5" />;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "lead_created":
        return "text-green-600 bg-green-100";
      case "lead_deleted":
        return "text-red-600 bg-red-100";
      case "status_change":
        return "text-blue-600 bg-blue-100";
      case "note_added":
        return "text-yellow-600 bg-yellow-100";
      case "user_login":
        return "text-gray-600 bg-gray-100";
      case "user_created":
        return "text-purple-600 bg-purple-100";
      case "user_updated":
        return "text-sky-600 bg-sky-100";
      case "user_deleted":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const logTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - logTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;

    return logTime.toLocaleDateString();
  };

  useEffect(()=>{
    
  },[])

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            Complete audit trail of all system activities
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredLogs.length} of {activityLogs.length} activities
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Activities
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search descriptions..."
              className="input-field w-full border rounded border-gray-300 px-3 py-2 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field w-full border rounded border-gray-300 px-3 py-2 focus:outline-hidden"
            >
              {activityTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="input-field w-full border rounded border-gray-300 px-3 py-2 focus:outline-hidden"
            >
              <option value="all">All Users</option>
              {[...new Set(activityLogs.map((log) => log.user))].map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Activity Timeline
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log._id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(
                      log.type
                    )}`}
                  >
                    {getActivityIcon(log.type)}
                  </div>

                  <div className="flex-1 min-w-0 mt-3 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {log.user}
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.type === "lead_created"
                              ? "bg-green-100 text-green-800"
                              : log.type === "lead_deleted"
                              ? "bg-red-100 text-red-800"
                              : log.type === "status_change"
                              ? "bg-blue-100 text-blue-800"
                              : log.type === "note_added"
                              ? "bg-yellow-100 text-yellow-800"
                              : log.type === "user_created"
                              ? "bg-purple-100 text-purple-800"
                              : log.type === "user_login"
                              ? "bg-gray-100 text-gray-800"
                              : log.type === "user_updated"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {activityTypes.find((at) => at.key === log.type)
                            ?.label || log.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2 sm:mt-0">
                        <FaCalendar className="w-3 h-3" />
                        <span>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(log.createdAt)}</span>
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-gray-700">
                      {log.description}
                    </p>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between gap-2"
                            >
                              <span className="text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span className="text-gray-900 font-medium">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <FaTasks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activities found
              </h3>
              <p className="text-gray-500">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
