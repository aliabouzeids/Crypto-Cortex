import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
// === Build Params ===
export function build_params(wallet_balance, prices, price_when_bought, market_state, hold_position) {
    return {
        agent: {
            wallet_balance,
            prices,
            price_when_bought,
            market_state,
            hold_position,
            final_decision: "",
        },
    };
}
// === Fetch Prices ===
export async function fetch_prices() {
    const res = await fetch("https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5");
    const data = await res.json();
    return data.map((candle) => parseFloat(candle[4])); // close prices
}
// === Fetch Chart Prices ===
export async function fetch_charts_prices() {
    const res = await fetch("https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5");
    return res.json();
}
// === Position Check ===
export function has_position(balance, boughtPrice) {
    return balance <= 0 && boughtPrice > 0;
}
// === Market State ===
export async function calculate_market_state(symbol = "ETHUSDT", interval = "1h", limit = 100) {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();
    const prices = data.map((candle) => parseFloat(candle[4]));
    if (prices.length < 2)
        return "neutral";
    const first = prices[0];
    const last = prices[prices.length - 1];
    if (last > first)
        return "bullish";
    if (last < first)
        return "bearish";
    return "neutral";
}
// === Wallet Balance ===
const client = createPublicClient({
    chain: mainnet,
    transport: http("https://mainnet.infura.io/v3/cf1b77a759114db3a815944536bc117b"),
});
export async function get_wallet_balance() {
    const res = await fetch("http://localhost:3000/api/set_account");
    if (!res.ok) {
        console.error("API not reachable:", res.status);
        return null;
    }
    const data = await res.json();
    const account = data.account;
    if (!account) {
        console.error("No account connected yet");
        return null;
    }
    const balanceWei = await client.getBalance({ address: account });
    const balanceEth = Number(balanceWei) / 1e18;
    return balanceEth;
}
//# sourceMappingURL=data_feed.js.map