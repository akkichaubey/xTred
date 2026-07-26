import { DeltaWSMessageSchema, type DeltaWSMessage } from "./types";

export type MessageHandler = (msg: DeltaWSMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;

// ─── Resolve WS URL per environment ─────────────────────────────────────────

function getWsUrl(): string {
  const env = process.env.NEXT_PUBLIC_DELTA_ENV || "india";
  if (env === "testnet") return "wss://socket-ind.testnet.deltaex.org";
  if (env === "india") return "wss://socket.india.delta.exchange";
  return "wss://socket.delta.exchange"; // global mainnet fallback
}

// ─── Production-Grade Delta Exchange WebSocket Manager ──────────────────────

class DeltaWebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private isConnecting = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempt = 0;
  private readonly maxReconnectDelay = 30_000;
  private readonly maxReconnectAttempts = 20;
  private isManuallyDisconnected = false;

  // ─── Public: Connect ───────────────────────────────────────────────────────

  connect() {
    if (this.isManuallyDisconnected) return;
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
        // Re-subscribe to all registered channels after reconnect
        this.subscriptions.forEach((channel) => this.sendSubscribe(channel));
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = JSON.parse(event.data as string);

          // Absorb server pong / heartbeat silently
          if (raw?.type === "pong" || raw?.type === "heartbeat") return;

          const parsed = DeltaWSMessageSchema.safeParse(raw);
          if (parsed.success) {
            this.messageHandlers.forEach((h) => h(parsed.data));
          }
        } catch {
          // Ignore malformed frames silently
        }
      };

      ws.onerror = () => {
        // Error always precedes onclose — handled there
      };

      ws.onclose = (event) => {
        this.isConnecting = false;
        this.stopHeartbeat();
        this.notifyConnection(false);

        if (!this.isManuallyDisconnected) {
          this.scheduleReconnect();
        }

        if (process.env.NODE_ENV === "development") {
          console.debug(`[DeltaWS] Closed. Code=${event.code} Attempt=${this.reconnectAttempt}`);
        }
      };
    } catch (err) {
      this.isConnecting = false;
      if (!this.isManuallyDisconnected) {
        this.scheduleReconnect();
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[DeltaWS] Connection error:", err);
      }
    }
  }

  // ─── Public: Disconnect ────────────────────────────────────────────────────

  disconnect() {
    this.isManuallyDisconnected = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempt = 0;
  }

  // ─── Public: Reconnect ─────────────────────────────────────────────────────

  reconnect() {
    this.isManuallyDisconnected = false;
    this.reconnectAttempt = 0;
    this.disconnect();
    setTimeout(() => {
      this.isManuallyDisconnected = false;
      this.connect();
    }, 100);
  }

  // ─── Public: Subscribe to a channel ───────────────────────────────────────

  subscribe(channel: string) {
    if (this.subscriptions.has(channel)) return; // Prevent duplicate subscriptions
    this.subscriptions.add(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(channel);
    }
  }

  // ─── Public: Unsubscribe from a channel ───────────────────────────────────

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendUnsubscribe(channel);
    }
  }

  // ─── Public: Register message handler ────────────────────────────────────

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // ─── Public: Register connection state handler ────────────────────────────

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    // Immediately emit current state so caller knows the status
    handler(this.isOpen());
    return () => this.connectionHandlers.delete(handler);
  }

  // ─── Public: Getters ──────────────────────────────────────────────────────

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getReconnectAttempt(): number {
    return this.reconnectAttempt;
  }

  // ─── Private: Send subscribe payload ─────────────────────────────────────

  private sendSubscribe(channel: string) {
    const payload = {
      type: "subscribe",
      payload: { channels: [{ name: channel }] },
    };
    this.ws?.send(JSON.stringify(payload));
  }

  // ─── Private: Send unsubscribe payload ───────────────────────────────────

  private sendUnsubscribe(channel: string) {
    const payload = {
      type: "unsubscribe",
      payload: { channels: [{ name: channel }] },
    };
    this.ws?.send(JSON.stringify(payload));
  }

  // ─── Private: Heartbeat (keep-alive ping every 15s) ─────────────────────

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 15_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // ─── Private: Exponential backoff reconnect ───────────────────────────────

  private scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.warn("[DeltaWS] Max reconnect attempts reached. Giving up.");
      return;
    }

    this.clearReconnectTimer();
    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), this.maxReconnectDelay);
    // Add jitter (±20%) to prevent thundering herd
    const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
    const delay = Math.round(baseDelay + jitter);
    this.reconnectAttempt++;

    if (process.env.NODE_ENV === "development") {
      console.debug(`[DeltaWS] Reconnecting in ${delay}ms (attempt #${this.reconnectAttempt})`);
    }

    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // ─── Private: Notify all connection handlers ──────────────────────────────

  private notifyConnection(connected: boolean) {
    this.connectionHandlers.forEach((h) => h(connected));
  }
}

// ─── Singleton instance (client-side only) ───────────────────────────────────

let wsManagerInstance: DeltaWebSocketManager | null = null;

export function getDeltaWS(): DeltaWebSocketManager {
  if (!wsManagerInstance) {
    wsManagerInstance = new DeltaWebSocketManager();
  }
  return wsManagerInstance;
}

// ─── Channel name helpers ────────────────────────────────────────────────────

export const DeltaChannels = {
  ticker: (symbol: string) => `v2/ticker:${symbol}`,
  candles: (symbol: string, resolution: string) => `v2/candlestick_${resolution}:${symbol}`,
  l2Orderbook: (symbol: string) => `v2/l2orderbook:${symbol}`,
  trades: (symbol: string) => `v2/all_trades:${symbol}`,
  markPrice: (symbol: string) => `v2/mark_price:${symbol}`,
};
