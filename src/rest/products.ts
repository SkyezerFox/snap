import { stringify } from "querystring";

import { Product } from "../types/products";
import { coinbase } from "./requests";

interface ProductResponse {
    id: string;
    base_currency: string;
    quote_currency: string;
    base_min_size: string;
    base_max_size: string;
    quote_increment: string;
    base_increment: string;
    display_name: string;
    min_market_funds: string;
    max_market_funds: string;
    margin_enabled: boolean;
    post_only: boolean;
    limit_only: boolean;
    cancel_only: boolean;
    trading_disabled: boolean;
    status: "online";
    status_message: string;
}

/**
 * Fetch an array of active products.
 */
export const getProducts = async () => {
    const { data } = await coinbase.get<ProductResponse[]>("/products");
    return data;
};

/**
 * Get historic rates for the target product.
 * @param product
 */
export const getHistoricRates = async (
    product: Product,
    start: number,
    end: number,
    granularity: number
) => {
    const params = stringify({
        start: new Date(start * 1e3).toISOString(),
        end: new Date(end * 1e3).toISOString(),
        granularity,
    });

    console.log(params);

    const { data } = await coinbase.get<
        [number, number, number, number, number, number][]
    >(`/products/${product}/candles`, {
        params,
    });
    return data;
};
