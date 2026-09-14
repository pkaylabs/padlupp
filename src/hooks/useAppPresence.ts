import { WS_BASE_URL } from "@/constants";
import { useAuthStore } from "@/features/auth/authStore";
import { useEffect } from "react";

const HEARTBEAT_MS = 30_000;
const MAX_RECONNECT_DELAY_MS = 20_000;

export function useAppPresence() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    let socket: WebSocket | null = null;
    let heartbeatTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let retryCount = 0;
    let disposed = false;

    const clearTimers = () => {
      if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      heartbeatTimer = null;
      reconnectTimer = null;
    };

    const connect = () => {
      if (disposed || socket?.readyState === WebSocket.OPEN) return;

      socket?.close();
      socket = new WebSocket(
        `${WS_BASE_URL}/ws/presence/?token=${encodeURIComponent(token)}`,
      );

      socket.onopen = () => {
        retryCount = 0;
        heartbeatTimer = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "heartbeat" }));
          }
        }, HEARTBEAT_MS);
      };

      socket.onclose = () => {
        if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        if (disposed) return;

        retryCount += 1;
        const delay = Math.min(
          1_000 * 2 ** Math.min(retryCount, 5),
          MAX_RECONNECT_DELAY_MS,
        );
        reconnectTimer = window.setTimeout(connect, delay);
      };

      socket.onerror = () => socket?.close();
    };

    const reconnectWhenVisible = () => {
      if (document.visibilityState === "visible" && socket?.readyState !== WebSocket.OPEN) {
        clearTimers();
        connect();
      }
    };

    connect();
    window.addEventListener("online", reconnectWhenVisible);
    document.addEventListener("visibilitychange", reconnectWhenVisible);

    return () => {
      disposed = true;
      clearTimers();
      window.removeEventListener("online", reconnectWhenVisible);
      document.removeEventListener("visibilitychange", reconnectWhenVisible);
      socket?.close();
    };
  }, [token]);
}
