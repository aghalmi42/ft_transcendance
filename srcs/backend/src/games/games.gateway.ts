import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { GamesService } from './games.service';

type GameEvent = { gameId: string };
type MoveEvent = GameEvent & { position: number };

type GameState = ReturnType<GamesService['getGameState']>;
type MoveResult = GameState | { error: string };

@WebSocketGateway({
  namespace: '/games',
  cors: { origin: true, credentials: true },
})
export class GamesGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly gamesService: GamesService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token as string | undefined;

    try {
      if (!token) throw new Error('Token manquant.');
      const payload = this.jwtService.verify<{ sub: string }>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('game:join')
  joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: GameEvent,
  ): GameState {
    const state = this.getAuthorizedGameState(client, event.gameId);
    client.join(event.gameId);
    this.server.to(event.gameId).emit('game:state', state);
    return state;
  }

  @SubscribeMessage('game:move')
  async makeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: MoveEvent,
  ): Promise<MoveResult> {
    try {
      this.getAuthorizedGameState(client, event.gameId);
      const state = await this.gamesService.makeMove(
        event.gameId,
        client.data.userId,
        event.position,
      );
      this.server.to(event.gameId).emit('game:state', state);
      return state;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action impossible.';
      return { error: message };
    }
  }

  private getAuthorizedGameState(client: Socket, gameId: string): GameState {
    const state = this.gamesService.getGameState(gameId);
    if (state.playerXId !== client.data.userId && state.playerOId !== client.data.userId) {
      throw new WsException("Vous ne participez pas à cette partie.");
    }
    return state;
  }
}
