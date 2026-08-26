import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { UsersService } from '../users/users.service';
import { UserStatus } from '../common/enums/user-status.enum';

// Presence only: connecting/disconnecting on this namespace marks a user
// online/offline and broadcasts it, so friends can see live status.
// (Real-time chat messaging itself still goes through the REST /conversations API.)
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  // Tracks how many open sockets (tabs) each user currently has.
  private readonly connectionsByUser = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;

    let userId: string;
    try {
      if (!token) throw new Error('Token manquant.');
      const payload = this.jwtService.verify<{ sub: string }>(token);
      userId = payload.sub;
    } catch {
      client.disconnect(true);
      return;
    }

    client.data.userId = userId;
    const count = (this.connectionsByUser.get(userId) || 0) + 1;
    this.connectionsByUser.set(userId, count);

    if (count === 1) {
      await this.usersService.setStatus(userId, UserStatus.ONLINE);
      this.server.emit('presenceUpdate', { userId, status: 'ONLINE' });
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (!userId) return;

    const count = (this.connectionsByUser.get(userId) || 1) - 1;
    if (count <= 0) {
      this.connectionsByUser.delete(userId);
      await this.usersService.setStatus(userId, UserStatus.OFFLINE);
      this.server.emit('presenceUpdate', { userId, status: 'OFFLINE' });
    } else {
      this.connectionsByUser.set(userId, count);
    }
  }
}
