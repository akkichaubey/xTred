import { DeltaWSMessageSchema, type DeltaWSMessage } from "./types";

export type MessageHandler = (msg: DeltaWSMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;

function getWsUrl(): string {
  const isTestnet = process.env.NEXT_PUBLIC_DELTA_ENV === "testnet";
  return isTestnet
    ? "wss://socket-ind.testnet.deltaex.org"
    : "wss://socket.delta.exchange";
}

class DeltaWebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempt = 0;
  private maxReconnectDelay = 30_000;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const url = getWsUrl();

    try {
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempt = 0;
        this.notifyConnection(true);
        this.startHeartbeat();
        this.subscriptions.forEach((channel) => this.sendSubscribe(channel));
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = JSON.parse(event.data as string);
          const parsed = DeltaWSMessageSchema.safeParse(raw);
          if (parsed.success) {
            this.messageHandlers.forEach((h) => h(parsed.data));
          }
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onerror = () => {
        // Error will be followed by onclose
      };

      ws.onclose = () => {
        this.isConnecting = false;
        this.notifyConnection(false);
        this.stopHeartbeat();
        this.scheduleReconnect();
      };
    } catch {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnect on explicit disconnect
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.notifyConnection(false);
  }

  subscribe(channel: string) {
    this.subscriptions.add(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(channel);
    } else {
      this.connect();
    }
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendUnsubscribe(channel);
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    // Emit current state immediately
    handler(this.ws?.readyState === WebSocket.OPEN);
    return () => this.connectionHandlers.delete(handler);
  }

  private sendSubscribe(channel: string) {
    this.send({
      type: "subscribe",
      payload: { channels: [{ name: channel }] },
    });
  }

  private sendUnsubscribe(channel: string) {
    this.send({
      type: "unsubscribe",
      payload: { channels: [{ name: channel }] },
    });
  }

  private send(msg: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: "ping" });
    }, 30_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, this.maxReconnectDelay);
    this.reconnectAttempt++;
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private notifyConnection(connected: boolean) {
    this.connectionHandlers.forEach((h) => h(connected));
  }
}

let instance: DeltaWebSocketManager | null = null;

export function getDeltaWS(): DeltaWebSocketManager {
  if (typeof window === "undefined") {
    return new DeltaWebSocketManager(); // SSR stub
  }
  if (!instance) {
    instance = new DeltaWebSocketManager();
  }
  return instance;
}

export const DeltaChannels = {
  ticker: (symbol: string) => `v2/ticker:${symbol}`,
  candles: (symbol: string, resolution: string) => `candlestick_${resolution}:${symbol}`,
  l2: (symbol: string) => `l2_updates:${symbol}`,
};
