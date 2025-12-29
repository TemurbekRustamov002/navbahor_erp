"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { scaleService } from '../services/scale.service';
import { WebSerialScale, ParsedReading } from '../utils/serial';

export interface ScaleReading {
  scaleId: string;
  weight: number;
  isStable: boolean;
  unit: string;
  markaId?: string;
  timestamp: string;
}

export interface ScaleConfig {
  id: string;
  name: string;
  department: 'ARRALI_SEX' | 'VALIKLI_SEX' | 'UNIVERSAL';
  isActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastHeartbeat?: string;
  settings?: any;
}

export interface ScaleSession {
  sessionId: string;
  scaleId: string;
  markaId?: string;
  startedAt: string;
}

export interface ActiveMarka {
  id: string;
  number: number;
  productType: string;
  used: number;
  capacity: number;
  status: string;
}

interface UseScaleReturn {
  // Current reading data
  currentReading: ScaleReading | null;

  // Connection status
  isConnected: boolean;
  connectionError: string | null;

  // Scale management
  availableScales: ScaleConfig[];
  activeScale: ScaleConfig | null;

  // Session management
  activeSession: ScaleSession | null;

  // Department data
  activeMarkas: ActiveMarka[];
  departmentInfo: any;

  // Actions
  connect: () => void;
  disconnect: () => void;
  selectScale: (scaleId: string, department: string) => Promise<boolean>;
  startSession: (scaleId: string, markaId?: string) => Promise<boolean>;
  endSession: () => void;
  sendReading: (weight: number, isStable?: boolean, markaId?: string) => void;

  // Department info
  loadDepartmentScales: (department: string) => Promise<void>;

  // Mock functionality for testing
  simulateReading: (weight: number, isStable?: boolean) => void;
  startMockReadings: () => void;
  stopMockReadings: () => void;

  // Manual input when scale is offline
  recordManualReading: (weight: number, markaId?: string) => Promise<void>;

  // Web Serial Actions
  connectLocalSerial: (baudRate?: number) => Promise<boolean>;
  disconnectLocalSerial: () => Promise<void>;
  isSerialSupported: boolean;
  isSerialConnected: boolean;

  // Hardware overview
  hardwareConnectedCount: number;
}

export const useScaleProfessional = (): UseScaleReturn => {
  // State management
  const [currentReading, setCurrentReading] = useState<ScaleReading | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availableScales, setAvailableScales] = useState<ScaleConfig[]>([]);
  const [activeScale, setActiveScale] = useState<ScaleConfig | null>(null);
  const [activeSession, setActiveSession] = useState<ScaleSession | null>(null);
  const [activeMarkas, setActiveMarkas] = useState<ActiveMarka[]>([]);
  const [departmentInfo, setDepartmentInfo] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mockReadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [connectedScaleIds, setConnectedScaleIds] = useState<Set<string>>(new Set());

  // Web Serial State
  const serialRef = useRef<WebSerialScale | null>(null);
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const [isSerialSupported, setIsSerialSupported] = useState(false);

  useEffect(() => {
    setIsSerialSupported(WebSerialScale.isSupported());
  }, []);

  // WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('⚠️ Scale WebSocket already connected');
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      console.log('🔄 Connecting to Scale WebSocket:', wsUrl);

      socketRef.current = io(`${wsUrl}/scale`, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('✅ Scale WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);

        // Request initial data
        socketRef.current?.emit('scale:overview:request');

        // Start heartbeat
        startHeartbeat();
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Scale WebSocket disconnected:', reason);
        setIsConnected(false);
        setActiveScale(null);
        setActiveSession(null);
        stopHeartbeat();
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🔥 Scale WebSocket connection error:', error);
        setIsConnected(false);
        setConnectionError(error.message);
      });

      // Scale data events
      socketRef.current.on('scale:reading', (data: ScaleReading) => {
        console.log('📊 Scale reading received:', data);
        setCurrentReading(data);
        if (data?.scaleId) {
          setConnectedScaleIds((prev) => new Set(prev).add(data.scaleId));
        }
      });
      // Backward compat with backend 'scale-data' event
      socketRef.current.on('scale-data', (data: any) => {
        const mapped: ScaleReading = {
          scaleId: data.scaleId || 'rs232',
          weight: data.weight,
          isStable: !!data.stable,
          unit: data.unit || 'kg',
          timestamp: data.timestamp || new Date().toISOString(),
        };
        console.log('📊 Scale data (legacy) received:', data, '=>', mapped);
        setCurrentReading(mapped);
      });

      socketRef.current.on('scale:overview', (data: any) => {
        console.log('📋 Scale overview received:', data);
        setAvailableScales(data.scales || []);
      });

      socketRef.current.on('scale:department:info:response', (data: any) => {
        console.log('🏢 Department info received:', data);
        setAvailableScales(data.scales || []);
        setActiveMarkas(data.activeMarkas || []);
        setDepartmentInfo(data.departmentInfo);
      });

      // Scale status events
      socketRef.current.on('scale:connected', (data: any) => {
        console.log('📡 Scale hardware connected:', data.scaleId);
        setConnectedScaleIds((prev) => new Set(prev).add(data.scaleId));
        if (departmentInfo?.department) {
          loadDepartmentScales(departmentInfo.department);
        }
      });

      socketRef.current.on('scale:disconnected', (data: any) => {
        console.log('📡 Scale hardware disconnected:', data.scaleId);
        setConnectedScaleIds((prev) => {
          const next = new Set(prev);
          next.delete(data.scaleId);
          return next;
        });
        if (activeScale?.id === data.scaleId) {
          setActiveScale(null);
          setActiveSession(null);
        }
      });

      // Session events
      socketRef.current.on('scale:session:started', (data: any) => {
        console.log('🎯 Scale session started:', data);
        setActiveSession({
          sessionId: data.sessionId,
          scaleId: data.scaleId,
          markaId: data.markaId,
          startedAt: data.timestamp,
        });
      });

      socketRef.current.on('scale:session:ended', (data: any) => {
        console.log('🏁 Scale session ended:', data);
        if (activeSession?.sessionId === data.sessionId) {
          setActiveSession(null);
        }
      });

      socketRef.current.on('scale:session:conflict', (data: any) => {
        console.warn('⚠️ Scale session conflict:', data);
        alert(`Tarozi konflikt: ${data.message}`);
        setConnectionError(data.message);
      });

      // Error events
      socketRef.current.on('scale:error', (data: any) => {
        console.error('🔥 Scale error:', data);
        setConnectionError(data.error);
      });

      // Heartbeat acknowledgment
      socketRef.current.on('scale:heartbeat:ack', (data: any) => {
        // console.log('💓 Heartbeat acknowledged for scale:', data.scaleId);
      });

    } catch (error) {
      console.error('❌ Failed to connect to scale WebSocket:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  }, [activeScale?.id, activeSession?.sessionId, departmentInfo?.department]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting Scale WebSocket');

    stopHeartbeat();
    stopMockReadings();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Reset all state
    setIsConnected(false);
    setConnectionError(null);
    setCurrentReading(null);
    setActiveScale(null);
    setActiveSession(null);
    setAvailableScales([]);
    setActiveMarkas([]);
    setDepartmentInfo(null);
  }, []);

  // Scale selection
  const selectScale = useCallback(async (scaleId: string, department: string): Promise<boolean> => {
    if (!socketRef.current?.connected) {
      setConnectionError('WebSocket is not connected');
      return false;
    }

    console.log('🎯 Selecting scale:', scaleId, 'in department:', department);

    try {
      // Register with the scale
      const result = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);

        socketRef.current?.emit('scale:register',
          { scaleId, department },
          (response: any) => {
            clearTimeout(timeout);
            console.log('📝 Scale registration response:', response);
            resolve(response?.success || false);
          }
        );
      });

      if (result) {
        const scale = availableScales.find(s => s.id === scaleId);
        if (scale) {
          setActiveScale(scale);
          console.log('✅ Scale selected successfully:', scale.name);
        }
      } else {
        console.error('❌ Failed to select scale');
        setConnectionError('Failed to select scale');
      }

      return result;
    } catch (error) {
      console.error('❌ Error selecting scale:', error);
      setConnectionError('Scale selection failed');
      return false;
    }
  }, [socketRef, availableScales]);

  // Session management
  const startSession = useCallback(async (scaleId: string, markaId?: string): Promise<boolean> => {
    if (!socketRef.current?.connected) {
      setConnectionError('WebSocket is not connected');
      return false;
    }

    console.log('🚀 Starting scale session for scale:', scaleId, 'marka:', markaId);

    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);

        socketRef.current?.emit('scale:session:start',
          { scaleId, sessionId, markaId },
          (response: any) => {
            clearTimeout(timeout);
            console.log('📝 Session start response:', response);
            resolve(response?.success || false);
          }
        );
      });

      if (!result) {
        console.error('❌ Failed to start scale session');
        setConnectionError('Failed to start session');
      }

      return result;
    } catch (error) {
      console.error('❌ Error starting scale session:', error);
      setConnectionError('Session start failed');
      return false;
    }
  }, [socketRef]);

  const endSession = useCallback(() => {
    if (activeSession && socketRef.current?.connected) {
      console.log('🛑 Ending scale session:', activeSession.sessionId);
      socketRef.current.emit('scale:session:end', {
        sessionId: activeSession.sessionId,
      });
    }
  }, [activeSession, socketRef]);

  // Send reading
  const sendReading = useCallback((weight: number, isStable = false, markaId?: string) => {
    if (!activeScale || !socketRef.current?.connected) {
      console.warn('⚠️ Cannot send reading: No active scale or connection');
      return;
    }

    const reading = {
      scaleId: activeScale.id,
      weight: Number(weight.toFixed(3)),
      isStable,
      unit: 'kg',
      markaId: markaId || activeSession?.markaId,
      sessionId: activeSession?.sessionId,
    };

    console.log('📤 Sending scale reading:', reading);
    socketRef.current.emit('scale:reading', reading);
  }, [activeScale, activeSession, socketRef]);

  // Load department scales
  const loadDepartmentScales = useCallback(async (department: string) => {
    if (!socketRef.current?.connected) {
      console.warn('⚠️ Cannot load department scales: Not connected');
      return;
    }

    console.log('📂 Loading scales for department:', department);
    socketRef.current.emit('scale:department:info', { department });
  }, [socketRef]);

  // Mock functionality for testing
  const simulateReading = useCallback((weight: number, isStable = true) => {
    if (!activeScale) {
      console.warn('⚠️ Cannot simulate reading: No active scale');
      return;
    }

    const mockReading: ScaleReading = {
      scaleId: activeScale.id,
      weight: Number(weight.toFixed(3)),
      isStable,
      unit: 'kg',
      markaId: activeSession?.markaId,
      timestamp: new Date().toISOString(),
    };

    console.log('🎭 Simulating reading:', mockReading);
    setCurrentReading(mockReading);

    // Also send to backend if connected
    if (socketRef.current?.connected) {
      sendReading(weight, isStable);
    }
  }, [activeScale, activeSession, sendReading]);

  const startMockReadings = useCallback(() => {
    stopMockReadings();

    console.log('🎭 Starting mock readings');
    mockReadingIntervalRef.current = setInterval(() => {
      const baseWeight = 185; // Base weight
      const variation = (Math.random() - 0.5) * 10; // ±5kg variation
      const weight = Math.max(0, baseWeight + variation);
      const isStable = Math.random() > 0.3; // 70% chance stable

      simulateReading(weight, isStable);
    }, 1000); // Every second
  }, [simulateReading]);

  const stopMockReadings = useCallback(() => {
    if (mockReadingIntervalRef.current) {
      console.log('🛑 Stopping mock readings');
      clearInterval(mockReadingIntervalRef.current);
      mockReadingIntervalRef.current = null;
    }
  }, []);

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    stopHeartbeat();

    heartbeatIntervalRef.current = setInterval(() => {
      if (activeScale && socketRef.current?.connected) {
        socketRef.current.emit('scale:heartbeat', {
          scaleId: activeScale.id,
        });
      }
    }, 30000); // Every 30 seconds
  }, [activeScale]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Web Serial Connections
  const connectLocalSerial = useCallback(async (baudRate = 9600): Promise<boolean> => {
    try {
      if (!serialRef.current) {
        serialRef.current = new WebSerialScale();
      }

      let lastEmitTime = 0;
      serialRef.current.onData((reading: ParsedReading) => {
        const now = Date.now();

        // 1. Update local UI (ALWAYS immediate for local user)
        const mappedReading: ScaleReading = {
          scaleId: 'local_serial',
          weight: reading.weight,
          isStable: reading.isStable,
          unit: reading.unit,
          timestamp: new Date().toISOString(),
          markaId: activeSession?.markaId
        };
        setCurrentReading(mappedReading);

        // 2. Broadcast to backend with THROTTLE
        // Only emit if:
        // - It's STABLE (crucial for weighing)
        // - It's been > 200ms since last emit (smooth UI for others)
        const shouldEmit = reading.isStable || (now - lastEmitTime > 200);

        if (socketRef.current?.connected && activeScale && shouldEmit) {
          lastEmitTime = now;
          socketRef.current.emit('scale:reading', {
            scaleId: activeScale.id,
            weight: reading.weight,
            isStable: reading.isStable,
            unit: reading.unit,
            sessionId: activeSession?.sessionId,
            markaId: activeSession?.markaId
          });
        }
      });

      serialRef.current.onError((error) => {
        console.error('Serial Error:', error);
        setConnectionError(`Tarozi xatosi: ${error.message}`);
        setIsSerialConnected(false);
      });

      const connected = await serialRef.current.connect({ baudRate });
      setIsSerialConnected(connected);
      return connected;
    } catch (error: any) {
      console.error('Failed to connect local serial:', error);
      setConnectionError(error.message);
      return false;
    }
  }, [activeScale, activeSession, socketRef]);

  const disconnectLocalSerial = useCallback(async () => {
    if (serialRef.current) {
      await serialRef.current.disconnect();
      setIsSerialConnected(false);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
      if (serialRef.current) {
        serialRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array for mount/unmount only

  // Update heartbeat when active scale changes
  useEffect(() => {
    if (isConnected && activeScale) {
      startHeartbeat();
    } else {
      stopHeartbeat();
    }
  }, [isConnected, activeScale, startHeartbeat, stopHeartbeat]);

  return {
    // Current reading data
    currentReading,

    // Connection status
    isConnected,
    connectionError,

    // Scale management
    availableScales,
    activeScale,

    // Session management
    activeSession,

    // Department data
    activeMarkas,
    departmentInfo,

    // Hardware overview
    hardwareConnectedCount: connectedScaleIds.size,

    // Actions
    connect,
    disconnect,
    selectScale,
    startSession,
    endSession,
    sendReading,

    // Department info
    loadDepartmentScales,

    // Mock functionality
    simulateReading,
    startMockReadings,
    stopMockReadings,

    // Manual reading function
    recordManualReading,

    // Web Serial 
    connectLocalSerial,
    disconnectLocalSerial,
    isSerialSupported,
    isSerialConnected,
  };

  // Manual reading implementation
  async function recordManualReading(weight: number, markaId?: string): Promise<void> {
    try {
      console.log('📝 Recording manual reading:', weight, 'kg for marka:', markaId);

      // Call backend API
      const result = await scaleService.recordManualReading({
        weight,
        markaId,
        unit: 'kg',
      });

      // Create manual reading object
      const manualReading: ScaleReading = {
        scaleId: 'manual_input',
        weight,
        isStable: true,
        unit: 'kg',
        markaId,
        timestamp: new Date().toISOString(),
      };

      // Update current reading state
      setCurrentReading(manualReading);

      console.log('✅ Manual reading recorded successfully');
    } catch (error) {
      console.error('❌ Failed to record manual reading:', error);
      setConnectionError('Failed to record manual reading');
      throw error;
    }
  }
};