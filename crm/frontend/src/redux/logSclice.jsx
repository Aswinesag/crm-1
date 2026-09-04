import { createSlice } from "@reduxjs/toolkit";

const logSlice = createSlice({
  name: "logs",
  initialState: {
    logs: [],
  },
  reducers: {
    setLogs: (state, action) => {
      // add isRead false if missing
      state.logs = action.payload.map((log) => ({
        ...log,
        isRead: log.isRead ?? false,
      }));
    },
    addlog: (state, action) => {
      const newLog = { ...action.payload, isRead: false }; // new logs start unread

      const exists = state.logs.some((log) => log._id === newLog._id);
      if (exists) return;

      state.logs.unshift(newLog);
      state.logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    markAllNotificationsRead: (state, action) => {
      const userId = action.payload;

      state.logs = state.logs.map((log) => {
        const shouldMark =
          [
            "lead_created",
            "lead_deleted",
            "user_created",
            "user_deleted",
            "leads_uploaded",
          ].includes(log.type) ||
          (log.type === "status_change" &&
            log.details?.toStatus === "Converted");

        if (shouldMark && !(log.readBy || []).includes(userId)) {
          return { ...log, readBy: [...(log.readBy || []), userId] }; // <-- only userId
        }
        return log;
      });
    },
  },
});

export const { setLogs, addlog, markAllNotificationsRead } = logSlice.actions;

export default logSlice.reducer;
