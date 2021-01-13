import { Snap } from "./Snap";
import { Product } from "./types/products";
import { createLogger } from "./util/logging";

interface TransactionData {
    time: number;
    product: Product;
    type: "buy" | "sell";
    price: number;
}

export class Transaction {
    constructor(private readonly data: TransactionData) {}
    get product() {
        return this.data.product;
    }
    get price() {
        return this.data.price;
    }
}

/**
 * Stores data about transactions occuring.
 */
export class TransactionCache {
    readonly logger = createLogger("cache");

    transactionHistory: Transaction[] = [];

    constructor(readonly snap: Snap) {
        setInterval(() => this.storeTransactions(), 60e3);
        this.logger.info("Scheduled transaction store for 60 seconds time");
    }

    /**
     * Add a transaction to the cache.
     * @param transaction
     */
    addTransaction(transaction: Transaction) {
        this.transactionHistory.push(transaction);
    }

    storeTransactions() {
        this.logger.info("Storing transactions...");
        this.logger.info(
            `Stored ${this.transactionHistory.length} into database`
        );
        this.transactionHistory = [];
    }

    /**
     * Calculate the moving average for the target product.
     * @param product
     * @param n
     */
    calculateMovingAverage(product: Product, n = 24) {
        const selection = this.transactionHistory
            .filter((v) => v.product == product)
            .slice(-n);
        return (
            selection.reduce((acc, v) => (acc += v.price), 0) / selection.length
        );
    }
}
