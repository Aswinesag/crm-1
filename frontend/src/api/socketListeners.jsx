import { updateLead, createLead } from "../redux/leadSlice.jsx";
import { addlog } from "../redux/logSclice.jsx";
import { postUser, putUser, getonlineUsers } from "../redux/userSlice.jsx";
import { setEngineerTaskCounts } from "../redux/leadSlice.jsx";
import { useSelector } from "react-redux";
import store from "../redux/store.jsx";

export const registerSocketListeners = (socket, dispatch) => {
  socket.on("leadUpdated", (lead) => {
    // get current redux leads
    const leads = store.getState().leads.leads;
    const exists = leads.some((l) => l._id === lead._id);
    if (!exists) {
      dispatch(createLead(lead)); // This will add new lead for engineer
    } else {
      dispatch(updateLead({ id: lead._id, changes: lead }));
    }
  });

  socket.on("newLead", (lead) => {
    dispatch(createLead(lead));
  });

  socket.on("newLog", (log) => {
    console.log("New log received via socket:", log);
    dispatch(addlog(log));
  });

  socket.on("newUser", (user) => {
    console.log("New user connected :", user._id);
    dispatch(postUser({ data: user }));
  });

  socket.on("userUpdated", (user) => {
    console.log("User updated :", user);
    dispatch(putUser({ data: user }));
  });
  socket.on("engineerTaskCountsUpdated", (data) => {
    console.log("Engineer task counts updated via socket:", data);
    dispatch(setEngineerTaskCounts(data));

    // dispatch(setEngineerTaskCounts(data));
  });

  socket.on("userOnline", (onlineUsers) => {
    console.log("Online users updated via socket:", onlineUsers);
    dispatch(getonlineUsers(onlineUsers));
  });
};
