import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export function useSeatSocket(eventId, onSeatUpdated, enabled = true) {
  const socketRef   = useRef(null);
  const callbackRef = useRef(onSeatUpdated);

  console.log(`eventId: ${eventId}`);

  useEffect(() => {
    callbackRef.current = onSeatUpdated;
  }, [onSeatUpdated]);

  useEffect(() => {
    
    if (!enabled || !eventId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-event", eventId);
    });

    socket.on("seat_updated", (payload) => {
      callbackRef.current?.(payload);
    });

    return () => {
      socket.emit("leave-event", eventId);
      socket.disconnect();
    };
  }, [eventId, enabled]);
}