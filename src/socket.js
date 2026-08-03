import { io } from "socket.io-client";
import { baseUrl } from "./components/endpoints";

const socket = io(baseUrl, {
  autoConnect: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("⚡ Real-time Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from Real-time Socket server");
});

export default socket;
