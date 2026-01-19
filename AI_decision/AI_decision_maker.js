import finalAI from "./AI_Brain.js"; // import the compiled graph
import fetch from "node-fetch"; // Node v22 has native fetch, so you can drop this if you want

// Helper to build params
function buildParams(prices, balance = 0, boughtPrice = 3200) {
  return {
    agent: {
      wallet_balance: balance,
      prices,
      price_when_bought: boughtPrice,
      market_previous_state: "bullish",
      hold_position: false,
      signal: "",
      final_decision: "",
    }
  };
}

// Fetch ETH prices from Binance
async function fetchPrices() {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
  const data = await res.json();
  return data.map((candle) => parseFloat(candle[4])); // close prices
}

// Run decision loop
async function runDecision() {
  try {
    const prices = await fetchPrices();
    const params = buildParams(prices);
    const result = await finalAI.invoke(params);

    console.log(
      `[${new Date().toLocaleTimeString()}] Decision: ${result.agent.final_decision} | Latest Price: ${prices.at(-1)}`
    );
  } catch (err) {
    console.error("Decision loop failed:", err);
  }
}

// Run once, then every 5 minutes
runDecision();
setInterval(runDecision, 0.1 * 60 * 1000);