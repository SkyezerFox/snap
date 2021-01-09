import { Product } from "../types/products";

type EventChannels = "heartbeat" | "level2" | "ticker" | "full";

interface SocketMessage {
    type: string;
}

export interface SocketError extends SocketMessage {
    type: "error";
    message: string;
}

export interface SubscribeCommand extends SocketMessage {
    type: "subscribe";
    product_ids?: Product[];
    channels?: (
        | EventChannels
        | { name: EventChannels; product_ids: Product[] }
    )[];
}

export interface SubscriptionEvent extends SocketMessage {
    type: "subscriptions";
    channels: { name: EventChannels; product_ids: Product[] }[];
}

export interface TickerEvent extends SocketMessage {
    type: "ticker";
    trade_id: number;
    sequence: number;
    time: string;
    product_id: Product;
    price: string;
    side: string; // Taker side
    last_size: string;
    best_bid: string;
    best_ask: string;
}

export interface HeartbeatEvent extends SocketMessage {
    type: "heartbeat";
    sequence: number;
    last_trade_id: number;
    product_id: Product;
    time: string;
}

export type SocketCommands = SubscribeCommand;
export type SocketEvents =
    | SocketError
    | SubscriptionEvent
    | TickerEvent
    | HeartbeatEvent;
