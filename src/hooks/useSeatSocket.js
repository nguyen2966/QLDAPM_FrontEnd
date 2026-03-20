import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export function useSeatSocket(eventId, onSeatUpdated, enabled = true) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onSeatUpdated);

  useEffect(() => {
    callbackRef.current = onSeatUpdated;
  }, [onSeatUpdated]);

  useEffect(() => {
    if (!enabled || !eventId || Number.isNaN(eventId)) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] connected:", socket.id);
      socket.emit("join-event", eventId);
    });

    socket.on("seat_updated", (payload) => {
      callbackRef.current?.(payload);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] error:", error.message);
    });

    return () => {
      socket.emit("leave-event", eventId);
      socket.off("seat_updated");
      socket.disconnect();
    };
  }, [enabled, eventId]);
}
