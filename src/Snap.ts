import "./util/time";

import { Connection, createConnection, getConnectionOptions } from "typeorm";
import { EventEmitter } from "typeorm/platform/PlatformTools";

import { HistoricalDataManager } from "./HistoricDataManager";
import { ProductManager } from "./ProductManager";
import { Transaction, TransactionCache } from "./TransactionCache";
import { createLogger } from "./util/logging";
import { SocketClient } from "./ws/SocketClient";

/**
 * Represents the base snap bot.
 */
export class Snap extends EventEmitter {
    readonly logger = createLogger("snap");

    readonly ws = new SocketClient();
    readonly history = new HistoricalDataManager(this);
    readonly cache = new TransactionCache(this);
    readonly products = new ProductManager(this);

    connection!: Connection;

    constructor() {
        super();
        this.logger.level = "debug";
    }

    /**
     * Start the bot.
     */
    async start() {
        try {
            this.connection = await createConnection(
                await getConnectionOptions()
            );
        } catch (err) {
            this.logger.error("Failed to connect to PostgreSQL");
            this.logger.error(err);
            process.exit(1);
        }

        this.logger.info("Connected to PostgreSQL database");

        this.history.loadHistoricalData();

        // await this.ws.connect();
        // this.ws.subscribe("BTC-GBP", "BTC-EUR");
        this.ws.on("ticker", (t) => {
            this.logger.debug(
                `${t.side.toUpperCase()} ${t.product_id} ${t.price} ${
                    t.best_bid
                } ${t.best_ask} | ${this.cache.calculateMovingAverage(
                    t.product_id,
                    24
                )}`
            );

            this.cache.addTransaction(
                new Transaction({
                    time: new Date(t.time).getTime(),
                    product: t.product_id,
                    price: parseInt(t.price),
                    type: t.side as "buy" | "sell",
                })
            );
        });
    }
}
