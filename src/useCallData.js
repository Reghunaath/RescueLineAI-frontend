import { useState, useEffect, useCallback, useRef } from "react";
import { USE_MOCK_DATA, WS_URL, API_BASE_URL } from "./config";
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
      console.log("[WS] ✅ Connected successfully");
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
      console.log("[WS] Disconnected - WebSocket not available with ngrok");
      wsRef.current = null;
      // Don't show disconnected banner if we have data from REST API
      // setConnected(false);

      // Don't auto-reconnect - ngrok blocks WebSocket
      // const delay = Math.min(reconnectDelayRef.current, 30000);
      // reconnectTimeoutRef.current = setTimeout(() => {
      //   reconnectDelayRef.current = delay * 2;
      //   connectWebSocket();
      // }, delay);
    };

    ws.onerror = (err) => {
      console.warn("[WS] WebSocket not available (ngrok limitation)");
      console.log("[WS] Falling back to REST API polling");
      ws.close();
    };
  }, [addCall, updateCallStatus]);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setCalls(MOCK_CALLS);
      return;
    }

    let pollInterval;

    // Load data from REST API
    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/calls`);
        const data = await response.json();
        console.log("[API] ✅ Loaded", data.total, "calls");
        setCalls(data.calls || []);
        setConnected(true);
      } catch (err) {
        console.error("[API] ❌ Failed to load data:", err);
        setConnected(false);
      }
    };

    // Initial load
    console.log("[API] Loading initial data...");
    loadData();

    // Poll every 3 seconds for updates (since WebSocket doesn't work with ngrok)
    pollInterval = setInterval(() => {
      loadData();
    }, 3000);

    // Try WebSocket (will fail silently with ngrok)
    connectWebSocket();

    return () => {
      clearInterval(pollInterval);
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

  const assignToAgent = async (callId) => {
    if (USE_MOCK_DATA) {
      console.warn('[API] Cannot assign - using mock data mode');
      alert('Please enable live backend (USE_MOCK_DATA = false) to assign calls');
      return;
    }

    try {
      console.log('[API] Assigning call to agent:', callId);
      const response = await fetch(`${API_BASE_URL}/api/calls/${callId}/assign`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to assign call');
      }

      console.log('[API] ✅ Call assigned to agent:', callId);
    } catch (err) {
      console.error('[API] ❌ Failed to assign call:', err);
      alert('Failed to assign call. Check console for details.');
    }
  };

  return { calls, callsByStatus, stats, connected, assignToAgent };
}
