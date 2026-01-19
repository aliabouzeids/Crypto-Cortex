

export function build_params(prices, balance, boughtPrice) {
  return {
    agent: {
      wallet_balance: balance,
      prices,
      price_when_bought: boughtPrice,
      market_previous_state: "bullish",
      hold_position: true,
      signal: "",
      final_decision: "",
    }
  };
}
export async function fetch_prices() {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
  const data = await res.json();
  return data.map((candle) => parseFloat(candle[4])); // close prices
}
export async function fetch_charts_prices() {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
   return res.json()
}


