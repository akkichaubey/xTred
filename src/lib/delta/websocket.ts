import { backoffDelay, sleep } from "@/lib/utils";
import { DeltaWSMessage, type DeltaWSMessageType } from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

const IS_TESTNET = process.env.NEXT_PUBLIC_DELTA_ENV === "testnet";
const WS_URL = IS_TESTNET
  ? "wss://socket.testnet.delta.exchange"
  : "wss://socket.delta.exchange";

type MessageHandler = (msg: DeltaWSMessageType) => void;
type ConnectionHandler = (connected: boolean) => void;

// ─── WebSocket Manager ────────────────────────────────────────────────────────

class DeltaWebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions = new Set<string>();
  private messageHandlers = new Set<MessageHandler>();
  private connectionHandlers = new Set<ConnectionHandler>();
  private reconnectAttempt = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isConnecting = false;
  private intentionalClose = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;
    this.intentionalClose = false;

    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempt = 0;
      this.notifyConnection(true);
      this.startHeartbeat();
      // Resubscribe all channels after reconnect
      this.subscriptions.forEach((channel) => this.sendSubscribe(channel));
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data as string);
        const parsed = DeltaWSMessage.safeParse(raw);
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
      this.stopHeartbeat();
      this.notifyConnection(false);
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect() {
    this.intentionalClose = true;
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }

  subscribe(channel: string) {
    this.subscriptions.add(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(channel);
    }
  }

  unsubscribe(channel: string) {
    this.subscriptions.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "unsubscribe", payload: { channels: [channel] } }));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private sendSubscribe(channel: string) {
    this.ws?.send(
      JSON.stringify({ type: "subscribe", payload: { channels: [channel] } })
    );
  }

  private async scheduleReconnect() {
    const delay = backoffDelay(this.reconnectAttempt, 1000, 30000);
    this.reconnectAttempt++;
    await sleep(delay);
    if (!this.intentionalClose) {
      this.connect();
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, 30_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyConnection(connected: boolean) {
    this.connectionHandlers.forEach((h) => h(connected));
  }
}

// Singleton — one WS connection for the entire app session
let manager: DeltaWebSocketManager | null = null;

export function getDeltaWS(): DeltaWebSocketManager {
  if (!manager) {
    manager = new DeltaWebSocketManager();
  }
  return manager;
}

// ─── Channel name helpers ─────────────────────────────────────────────────────

export const DeltaChannels = {
  ticker: (symbol: string) => `v2/ticker:${symbol}`,
  orderbook_l2: (symbol: string) => `l2_orderbook:${symbol}`,
  orderbook_l1: (symbol: string) => `l1_orderbook:${symbol}`,
  trades: (symbol: string) => `all_trades:${symbol}`,
  candles: (symbol: string, resolution: string) => `candlestick_${resolution}:${symbol}`,
  fundingRate: (symbol: string) => `funding_rate:${symbol}`,
  markPrice: (symbol: string) => `mark_price:${symbol}`,
} as const;
