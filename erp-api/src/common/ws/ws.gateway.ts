import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3100',
      'http://192.168.0.149:3100',
      /^http:\/\/192\.168\.\d+\.\d+:3100$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:3100$/,
    ],
  },
  path: '/scale',
})
export class ScaleWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ScaleWebSocketGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Server initialized for scale integration');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Scale client connected: ${client.id}`);
    
    // Send initial mock scale data
    client.emit('scaleData', {
      weight: 0,
      stable: false,
      unit: 'kg',
      model: 'Mock Scale'
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Scale client disconnected: ${client.id}`);
  }

  // Simulate scale data for demo purposes
  broadcastMockScaleData() {
    setInterval(() => {
      const mockData = {
        weight: Math.random() * 100 + 50, // Random weight between 50-150kg
        stable: Math.random() > 0.3, // 70% chance of stable
        unit: 'kg',
        model: 'Demo Scale',
        timestamp: new Date().toISOString()
      };
      
      this.server.emit('scaleData', mockData);
    }, 2000); // Every 2 seconds
  }
}