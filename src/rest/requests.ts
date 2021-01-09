import axios from "axios";

/**
 * The default axios requester for coinbase.
 */
export const coinbase = axios.create({
    baseURL: "https://api.pro.coinbase.com",
});
