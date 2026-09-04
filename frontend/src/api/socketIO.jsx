// socket.js
import { io } from "socket.io-client";

let socket;

export const initSocket = (userId, role) => {
   socket = io("http://localhost:5002", {
  // socket = io("https://crmsmie.smiv.in", {
    auth: { userId, role },
  });
  socket.on("connect", () => {
    console.log("Connected to socket server with ID:", socket.id);
  });
  return socket;
};

export const getSocket = () => socket;
