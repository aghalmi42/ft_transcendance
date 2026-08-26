export interface SocketMessageCallback {
  (data: any): void;
}

class SimpleSocketIOSocket {
  private ws: WebSocket | null = null;
  public connected: boolean = false;
  private namespace: string;
  private url: string;
  private token: string;
  private retryTimer: any = null;
  private retryCount = 0;
  private maxRetries = 0;
  private listeners: Map<string, Set<SocketMessageCallback>> = new Map();

  constructor(url: string, namespace: string, token: string) {
    this.url = url;
    this.namespace = namespace.startsWith('/') ? namespace : `/${namespace}`;
    this.token = token;
    this.connect();
  }

  private connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsBaseUrl = this.url.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl}/socket.io/?EIO=4&transport=websocket`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.retryCount = 0;
      };

      this.ws.onmessage = (event) => {
        const msg = String(event.data);
        if (!msg) return;

        if (msg.startsWith('0')) {
          const authPayload = JSON.stringify({ token: this.token });
          const connectPacket = `40${this.namespace !== '/' ? this.namespace + ',' : ''}${authPayload}`;
          this.ws?.send(connectPacket);
        }

        else if (msg === '2') {
          this.ws?.send('3');
        }

        else if (msg.startsWith('4')) {
          const type = msg.charAt(1);

          if (type === '0') {
            this.connected = true;
            this.trigger('connect', {});
          } else if (type === '1') {
            this.connected = false;
            this.trigger('disconnect', {});
          } else if (type === '2') {
            let payloadStr = msg.substring(2);
            if (payloadStr.startsWith(this.namespace + ',')) {
              payloadStr = payloadStr.substring(this.namespace.length + 1);
            }
            try {
              const parsed = JSON.parse(payloadStr);
              if (Array.isArray(parsed) && parsed.length >= 1) {
                const eventName = parsed[0];
                const eventData = parsed[1];
                this.trigger(eventName, eventData);
              }
            } catch {}
          }
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.trigger('disconnect', {});
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          clearTimeout(this.retryTimer);
          this.retryTimer = setTimeout(() => this.connect(), 15000);
        }
      };

      this.ws.onerror = () => {
        this.connected = false;
      };
    } catch {
      this.connected = false;
    }
  }

  public emit(event: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify([event, data]);
      const packet = `42${this.namespace !== '/' ? this.namespace + ',' : ''}${payload}`;
      this.ws.send(packet);
    }
  }

  public on(event: string, callback: SocketMessageCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: SocketMessageCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private trigger(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[SocketIO] Error handling event ${event}:`, err);
      }
    });
  }

  public disconnect() {
    clearTimeout(this.retryTimer);
    if (this.ws) {
      try {
        if (this.connected) {
          this.ws.send(`41${this.namespace !== '/' ? this.namespace + ',' : ''}`);
        }
        this.ws.close();
      } catch {}
      this.ws = null;
      this.connected = false;
    }
  }
}

class SocketManager {
  private chatSocket: SimpleSocketIOSocket | null = null;
  private gameSocket: SimpleSocketIOSocket | null = null;
  private ticTacToeSocket: SimpleSocketIOSocket | null = null;
  private listeners: Map<string, Set<SocketMessageCallback>> = new Map();
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  public connectChat(token: string) {
    if (this.chatSocket) return;

    this.chatSocket = new SimpleSocketIOSocket(this.baseUrl, '/chat', token);

    const chatEvents = [
      'directMessage',
      'channelMessage',
      'channelJoined',
      'chatError',
      'presenceUpdate',
      'incomingGameChallenge',
    ];

    chatEvents.forEach((ev) => {
      this.chatSocket?.on(ev, (data) => {
        this.trigger(ev, data);
      });
    });
  }

  public connectGame(token: string) {
    if (this.gameSocket) return;

    this.gameSocket = new SimpleSocketIOSocket(this.baseUrl, '/game', token);

    const gameEvents = [
      'matchFound',
      'gameSnapshot',
      'gameOver',
      'playerForfeited',
      'queueStatus',
      'duelRoomStatus',
    ];

    gameEvents.forEach((ev) => {
      this.gameSocket?.on(ev, (data) => {
        this.trigger(ev, data);
      });
    });
  }

  // The backend's TicTacToe gateway lives on its own '/games' namespace and
  // only emits 'game:state' — it is unrelated to the Pong '/game' duel socket
  // above, so it gets its own connection instead of being merged into connectGame().
  public connectTicTacToe(token: string) {
    if (this.ticTacToeSocket) return;

    this.ticTacToeSocket = new SimpleSocketIOSocket(this.baseUrl, '/games', token);

    ['game:state', 'game:opponentDisconnected'].forEach((ev) => {
      this.ticTacToeSocket?.on(ev, (data) => {
        this.trigger(ev, data);
      });
    });
  }

  public sendChat(event: string, data: any) {
    this.chatSocket?.emit(event, data);
  }

  public sendGame(event: string, data: any) {
    this.gameSocket?.emit(event, data);
  }

  public sendTicTacToe(event: string, data: any) {
    this.ticTacToeSocket?.emit(event, data);
  }

  public on(event: string, callback: SocketMessageCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: SocketMessageCallback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  private trigger(event: string, data: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[SocketManager] Callback error on event ${event}:`, err);
        }
      });
    }
  }

  public disconnectAll() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
    if (this.gameSocket) {
      this.gameSocket.disconnect();
      this.gameSocket = null;
    }
    if (this.ticTacToeSocket) {
      this.ticTacToeSocket.disconnect();
      this.ticTacToeSocket = null;
    }
    this.listeners.clear();
  }
}

export const socketService = new SocketManager();
export default socketService;
