/**
those components are simple and effective way to feed the agent the logic in them will be
 enhanced later in the debug and test phase 
NOTE: dont curse me guys okay!!
 */
import { createPublicClient, http, parseEther } from "viem";
import { mainnet } from "viem/chains";

//builds the parameters of the agent according to the below functions
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

//prices of the eth to feed the agent
export async function fetch_prices() {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
  const data = await res.json();
  return data.map((candle) => parseFloat(candle[4])); // close prices
}


//prices used in the charts in the front end
export async function fetch_charts_prices() {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
   return res.json()
}

//simple way to get if the agent hold a position or not
export function has_position(balance, boughtPrice) {
  return balance <= 0 && boughtPrice > 0;//simplest way possible :)
}


//calculate the market state in the past 
export async function calculate_market_state(
  symbol = "ETHUSDT",
  interval = "1h",
  limit = 100
) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();

  // Extract close prices into an array
  const prices = data.map(candle => parseFloat(candle[4]));

  if (!prices || prices.length < 2) return "neutral";

  const first = prices[0];
  const last = prices[prices.length - 1];

  if (last > first) return "bullish";
  if (last < first) return "bearish";
  return "neutral";
}


//the wallet balance of the address used in the agent


const client = createPublicClient({
  chain: mainnet,
  transport: http("https://mainnet.infura.io/v3/ur-infura-node-here"),
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
