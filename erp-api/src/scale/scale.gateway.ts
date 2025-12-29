import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ScaleService } from './scale.service';
import { ScaleReadingDto, StartScaleSessionDto } from './dto/scale.dto';
import { MarkaDepartment } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  department?: MarkaDepartment;
}

@WebSocketGateway({
  namespace: '/scale',
  cors: {
    origin: [
      'http://localhost:3100',
      'http://localhost:3101',
      'http://localhost:3102',
      'http://localhost:3103',
      'http://192.168.1.100:3100'
    ],
    credentials: true,
  },
})
export class ScaleGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ScaleGateway.name);
  private connectedScales = new Map<string, string>(); // scaleId -> socketId
  private activeSessions = new Map<string, any>(); // sessionId -> session data

  constructor(private scaleService: ScaleService) { }

  afterInit(server: Server) {
    this.logger.log('Scale WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Scale client connected: ${client.id}`);

    // Send current scale status to new client
    this.sendScaleOverview(client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Scale client disconnected: ${client.id}`);

    // Remove from connected scales if it was a scale connection
    for (const [scaleId, socketId] of this.connectedScales.entries()) {
      if (socketId === client.id) {
        this.connectedScales.delete(scaleId);
        this.broadcastScaleDisconnected(scaleId);
        break;
      }
    }

    // Clean up active sessions
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.socketId === client.id) {
        this.activeSessions.delete(sessionId);
        this.broadcastSessionEnded(sessionId);
        break;
      }
    }
  }

  // Scale Registration
  @SubscribeMessage('scale:register')
  async handleScaleRegister(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { scaleId: string; department: MarkaDepartment },
  ) {
    try {
      const { scaleId, department } = data;

      // Update scale connection status
      await this.scaleService.updateScaleConfig(scaleId, {
        connectionStatus: 'connected',
      });

      // Register this socket as the scale connection
      this.connectedScales.set(scaleId, client.id);
      client.department = department;

      this.logger.log(`Scale registered: ${scaleId} in department ${department}`);

      // Broadcast to all clients that scale is connected
      this.server.emit('scale:connected', {
        scaleId,
        department,
        timestamp: new Date(),
      });

      return { success: true, message: 'Scale registered successfully' };
    } catch (error) {
      this.logger.error(`Failed to register scale: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Real-time weight readings
  @SubscribeMessage('scale:reading')
  async handleScaleReading(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { scaleId: string } & ScaleReadingDto,
  ) {
    try {
      const { scaleId, ...readingData } = data;

      // 1. BROADCAST IMMEDIATELY to all clients for real-time UI
      // This is the CRITICAL fix for the 30s delay - don't wait for DB
      this.server.emit('scale:reading', {
        scaleId,
        weight: Number(readingData.weight),
        isStable: readingData.isStable,
        unit: readingData.unit || 'kg',
        markaId: (readingData as any).markaId || (readingData as any).toyId,
        timestamp: new Date().toISOString(),
      });

      // 2. RECORD IN DATABASE ASYNCHRONOUSLY
      // We only save important readings (stable or significant changes) to avoid DB bloat
      // But for now, we just make it async so it doesn't block the response
      this.scaleService.recordReading(scaleId, readingData).catch(err => {
        this.logger.error(`Background DB record failed: ${err.message}`);
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process scale reading: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Scale session management
  @SubscribeMessage('scale:session:start')
  async handleSessionStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { scaleId: string } & StartScaleSessionDto,
  ) {
    try {
      const { scaleId, sessionId, markaId } = data;

      // Check if session can be started (conflict prevention)
      const canStart = await this.scaleService.startScaleSession(scaleId, sessionId);

      if (!canStart) {
        client.emit('scale:session:conflict', {
          scaleId,
          sessionId,
          message: 'Another scale in this department is currently active',
          timestamp: new Date(),
        });

        return { success: false, error: 'Session conflict' };
      }

      // Store active session
      this.activeSessions.set(sessionId, {
        scaleId,
        markaId,
        socketId: client.id,
        startedAt: new Date(),
      });

      // Broadcast session started
      this.server.emit('scale:session:started', {
        scaleId,
        sessionId,
        markaId,
        timestamp: new Date(),
      });

      this.logger.log(`Scale session started: ${sessionId} on scale ${scaleId}`);

      return { success: true, sessionId };
    } catch (error) {
      this.logger.error(`Failed to start scale session: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('scale:session:end')
  handleSessionEnd(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    const { sessionId } = data;
    const session = this.activeSessions.get(sessionId);

    if (session) {
      this.activeSessions.delete(sessionId);

      // Broadcast session ended
      this.server.emit('scale:session:ended', {
        sessionId,
        scaleId: session.scaleId,
        duration: Date.now() - session.startedAt.getTime(),
        timestamp: new Date(),
      });

      this.logger.log(`Scale session ended: ${sessionId}`);
    }

    return { success: true };
  }

  // Heartbeat for keeping connections alive
  @SubscribeMessage('scale:heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { scaleId: string },
  ) {
    try {
      await this.scaleService.updateScaleHeartbeat(data.scaleId);

      client.emit('scale:heartbeat:ack', {
        scaleId: data.scaleId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get department scales with active markas
  @SubscribeMessage('scale:department:info')
  async handleDepartmentInfo(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { department: MarkaDepartment },
  ) {
    try {
      const info = await this.scaleService.getScalesWithActiveMarkas(data.department);

      client.emit('scale:department:info:response', {
        ...info,
        connectedScales: Array.from(this.connectedScales.keys()),
        activeSessions: Array.from(this.activeSessions.values()),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to get department info: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Utility methods for broadcasting
  private async sendScaleOverview(client: AuthenticatedSocket) {
    try {
      const configs = await this.scaleService.getScaleConfigs();

      client.emit('scale:overview', {
        scales: configs,
        connectedScales: Array.from(this.connectedScales.keys()),
        activeSessions: Array.from(this.activeSessions.values()),
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to send scale overview: ${error.message}`);
    }
  }

  private broadcastScaleDisconnected(scaleId: string) {
    this.server.emit('scale:disconnected', {
      scaleId,
      timestamp: new Date(),
    });
  }

  private broadcastSessionEnded(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.server.emit('scale:session:ended', {
        sessionId,
        scaleId: session.scaleId,
        reason: 'client_disconnected',
        timestamp: new Date(),
      });
    }
  }

  // Public methods for external use
  public async broadcastScaleReading(scaleId: string, reading: any) {
    this.server.emit('scale:reading', {
      scaleId,
      ...reading,
      timestamp: new Date(),
    });
  }

  public async broadcastScaleStatus(scaleId: string, status: string) {
    this.server.emit('scale:status', {
      scaleId,
      status,
      timestamp: new Date(),
    });
  }
}