export class ConversationRoom {
  state: DurableObjectState;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
  }

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const { 0: client, 1: server } = new WebSocketPair();

    this.state.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message === 'string') {
      try {
        const data = JSON.parse(message);
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'message') {
          this.broadcast(ws, JSON.stringify(data));
        }
      } catch (err) {
        console.error('Invalid message format', err);
      }
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {}

  webSocketError(ws: WebSocket, error: unknown) {}

  broadcast(sender: WebSocket, message: string) {
    const webSockets = this.state.getWebSockets();
    for (const ws of webSockets) {
      if (ws !== sender) {
        ws.send(message);
      }
    }
  }
}
