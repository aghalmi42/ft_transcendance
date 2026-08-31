import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { UsersService } from '../users/users.service';
import { UserStatus } from '../common/enums/user-status.enum';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

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
    await client.join(userId);

    const count = (this.connectionsByUser.get(userId) || 0) + 1;
    this.connectionsByUser.set(userId, count);

    if (count === 1) {
      await this.usersService.setStatus(userId, UserStatus.ONLINE);
      this.server.emit('presenceUpdate', { userId, status: 'ONLINE' });
    }
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(userId).emit(event, payload);
  }

  @SubscribeMessage('sendGameChallenge')
  async handleGameChallenge(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { receiverId: string; gameType: string; roomId?: string; targetScore?: number },
  ): Promise<void> {
    const senderId = client.data.userId as string | undefined;
    if (!senderId || !body?.receiverId) return;

    const sender = await this.usersService.findOneById(senderId);
    this.emitToUser(body.receiverId, 'incomingGameChallenge', {
      sender: sender ? { id: sender.id, username: sender.username, avatar: sender.avatar } : { id: senderId },
      gameType: body.gameType,
      roomId: body.roomId,
      targetScore: body.targetScore,
    });
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
