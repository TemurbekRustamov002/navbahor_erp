"use client";
import { useEffect, useState } from "react";

export type ScaleData = {
  weight: number;
  stable: boolean;
  model?: string;
  unit?: string;
};

export function useScale(wsUrl: string) {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<ScaleData>({
    weight: 0,
    stable: false,
    unit: "kg",
  });

  useEffect(() => {
    if (!wsUrl) return;
    
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 seconds
    
    const connectWebSocket = () => {
      try {
        console.log(`🔄 Attempting WebSocket connection to ${wsUrl}...`);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log(`✅ WebSocket connected to ${wsUrl}`);
          setConnected(true);
          reconnectAttempts = 0; // Reset on successful connection
        };
        
        ws.onclose = (event) => {
          console.log(`❌ WebSocket disconnected from ${wsUrl}:`, event.reason);
          setConnected(false);
          
          // Attempt reconnection if within limits
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${reconnectDelay}ms...`);
            reconnectTimer = setTimeout(connectWebSocket, reconnectDelay);
          } else {
            console.warn(`❌ Max reconnection attempts (${maxReconnectAttempts}) reached for ${wsUrl}`);
          }
        };
        
        ws.onerror = (error) => {
          console.warn(`❌ WebSocket error for ${wsUrl}:`, error);
        };
        
        ws.onmessage = (ev) => {
          try {
            const p = JSON.parse(ev.data as string);
            setData({
              weight: Number(p.weight ?? 0),
              stable: Boolean(p.stable),
              model: p.model,
              unit: p.unit ?? "kg",
            });
          } catch {
            const n = Number(ev.data);
            if (!Number.isNaN(n)) {
              setData((d) => ({ ...d, weight: n }));
            }
          }
        };
      } catch (error) {
        console.error(`❌ Failed to create WebSocket connection to ${wsUrl}:`, error);
        setConnected(false);
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      try {
        ws?.close();
      } catch {}
    };
  }, [wsUrl]);

  return { connected, data };
}