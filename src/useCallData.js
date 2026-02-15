import { useState, useEffect, useCallback, useRef } from "react";
import { USE_MOCK_DATA, WS_URL } from "./config";
import { MOCK_CALLS } from "./mockData";

export function useCallData() {
  const [calls, setCalls] = useState([]);
  const [connected, setConnected] = useState(USE_MOCK_DATA);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(1000);

  const addCall = useCallback((call) => {
    setCalls((prev) => {
      if (prev.some((c) => c.id === call.id)) return prev;
      return [call, ...prev];
    });
  }, []);

  const updateCallStatus = useCallback((id, newStatus) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  }, []);

  const connectWebSocket = useCallback(() => {
    if (USE_MOCK_DATA) return;

    console.log(`[WS] Connecting to ${WS_URL}...`);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      setConnected(true);
      reconnectDelayRef.current = 1000;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[WS] Message:", message.type);

        switch (message.type) {
          case "initial_state":
            setCalls(message.data);
            break;
          case "new_call":
            addCall(message.data);
            break;
          case "status_update":
            updateCallStatus(message.data.id, message.data.status);
            break;
          default:
            console.warn("[WS] Unknown message type:", message.type);
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      setConnected(false);
      wsRef.current = null;

      const delay = Math.min(reconnectDelayRef.current, 30000);
      console.log(`[WS] Reconnecting in ${delay}ms...`);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = delay * 2;
        connectWebSocket();
      }, delay);
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      ws.close();
    };
  }, [addCall, updateCallStatus]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setCalls(MOCK_CALLS);
      // const response = await fetch(`${API_BASE_URL}/api/calls`);
      // const calls = await response.json();
      return;
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connectWebSocket]);

  const callsByStatus = {
    ai_agent: calls.filter((c) => c.status === "ai_agent"),
    waitlist: calls.filter((c) => c.status === "waitlist"),
    human_agent: calls.filter((c) => c.status === "human_agent"),
    completed: calls.filter((c) => c.status === "completed"),
  };

  const stats = {
    total: calls.filter((c) => c.status !== "completed").length,
    p0: calls.filter((c) => c.priority === "P0" && c.status !== "completed")
      .length,
    p1: calls.filter((c) => c.priority === "P1" && c.status !== "completed")
      .length,
    waitlist: callsByStatus.waitlist.length,
  };

  return { calls, callsByStatus, stats, connected };
}
