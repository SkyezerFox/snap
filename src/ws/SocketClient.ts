import { EventEmitter } from "typeorm/platform/PlatformTools";
import WebSocket from "ws";

import { Product } from "../types/products";
import { createLogger } from "../util/logging";
import { Listener } from "../util/types";
import { HeartbeatEvent, SocketCommands, SocketEvents, TickerEvent } from "./types";

interface ClientEvents {
    ticker: [TickerEvent];
    heartbeat: [HeartbeatEvent];
}

export declare interface SocketClient {
    on<K extends keyof ClientEvents>(
        eventName: K,
        listener: Listener<ClientEvents[K]>
    ): this;
}

/**
 * Handles the connection between the coinbase socket API and snap.
 */
export class SocketClient extends EventEmitter {
    readonly logger = createLogger("ws");

    ws!: WebSocket;

    private sequence: number;

    connect() {
        return new Promise((r, rj) => {
            this.ws = new WebSocket("wss://ws-feed.pro.coinbase.com");
            this.ws
                .on("error", (err) => {
                    this.logger.error(
                        "Experienced a WebSocket error while connecting to Coinbase"
                    );
                    this.logger.error(err);
                    rj(err);
                })
                .on("close", () =>
                    this.logger.info("WebSocket connection closed")
                )
                .on("open", () => this.handleConnectionOpen(r))
                .on("message", (d) => this.handleIncomingMessage(d as string));
        });
    }

    /**
     * Send a socket message to Coinbase.
     * @param message
     */
    send(message: SocketCommands) {
        this.ws.send(JSON.stringify(message));
    }

    subscribe(...product_ids: Product[]) {
        this.send({
            type: "subscribe",
            product_ids,
            channels: ["level2", "ticker", "heartbeat"],
        });
    }

    /**
     * Handle the connection being opened.
     */
    protected handleConnectionOpen(r: (value?: unknown) => void) {
        this.logger.info("Connected to Coinbase WebSocket");
        r();
    }

    /**
     * Handle a message received from Coinbase.
     * @param d
     */
    protected handleIncomingMessage(d: string) {
        const message: SocketEvents = JSON.parse(d);

        if (message["sequence"]) {
            this.sequence = message["sequence"];
        }

        switch (message.type) {
            case "error": {
                this.logger.error("Got an error from the Coinbase WebSocket");
                this.logger.error(message.message);
                break;
            }

            case "ticker": {
                this.emit("ticker", message);
                break;
            }
        }
    }
}
