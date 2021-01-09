import { ProductCandle } from "./entity/ProductCandle";
import { getHistoricRates } from "./rest/products";
import { Snap } from "./Snap";
import { Product } from "./types/products";
import { createLogger } from "./util/logging";

/**
 * Manages historical data.
 */
export class HistoricalDataManager {
    readonly logger = createLogger("history");

    constructor(readonly snap: Snap) {}

    async loadHistoricalData() {
        this.downloadHistoricalData("BTC-GBP");
    }

    /**
     * Begin downloading historical data for the target product.
     * @param product
     */
    async downloadHistoricalData(product: Product) {
        const repository = this.snap.connection.getRepository(ProductCandle);
        const [candles, count] = await repository.findAndCount({
            order: { time: "ASC" },
            take: 1,
        });

        this.logger.info(
            `Retrieved ${count} historical entries from the database for product "${product}"`
        );

        const earliestCandleDate = candles[0]?.time || Date.now() / 1000;
        const candleData = await getHistoricRates(
            product,
            earliestCandleDate - 300 * 3600,
            earliestCandleDate,
            3600
        );

        this.logger.info(
            `In next batch, got ${candleData.length} historical entries`
        );

        repository.save(
            candleData.map(
                (data) =>
                    new ProductCandle(
                        data[0],
                        data[1],
                        data[2],
                        data[3],
                        data[4],
                        data[5]
                    )
            )
        );

        this.logger.info("Downloaded historical data");
    }
}
