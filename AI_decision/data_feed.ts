import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import type { Address} from "viem";
/** 

-agent schema params::
const AgentSchema = z.object({
  wallet_balance: z.number(),
  expected_future_market_price:z.number(),
  buy_amount:z.number(),
  last_price: z.number(),
  price_when_bought: z.number(),
  tolerance:z.number(),
  market_state: z.string(),
  hold_position: z.boolean(),
  final_decision: z.string(),
});
*/


// === Agent State Types ===
export interface AgentParams {
  wallet_balance: number;
  buy_amount:number,
  last_price: number;
  price_when_bought: number;
  tolerance:number,
  market_state: string;
  hold_position: boolean;
  final_decision: string;
}
// === Build Params ===
export function build_params(
  wallet_balance: number,
  buy_amount:number,
  last_price: number,
  price_when_bought: number,
  tolerance:number,
  market_state: string,
  hold_position: boolean
): { agent: AgentParams } {
  return {
    agent: {
      wallet_balance,
      buy_amount,
      last_price,
      price_when_bought,
      tolerance,
      market_state,
      hold_position,
      final_decision: "",
    },
  };
}


// === Fetch Price ===
export async function fetch_price(): Promise<number> {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
  const data: any[] = await res.json();

  // Grab the last candle in the array
  const lastCandle = data[data.length - 1];
  const lastPrice:number = parseFloat(lastCandle[4]); // close price

  return lastPrice;
}

// === Fetch Chart Prices ===
export async function fetch_charts_prices(): Promise<any[]> {
  const res = await fetch(
    "https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=5"
  );
  return res.json();
}

// === Position Check ===
export function has_position(balance: number, boughtPrice: number): boolean {
  return balance <= 0 ;
}

// === Market State ===
export async function calculate_market_state(
  symbol: string = "ETHUSDT",
  interval: string = "1h",
  limit: number = 100
): Promise<string> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  const data: any[] = await res.json();

  const prices = data.map((candle) => parseFloat(candle[4]));
    if (prices.length < 2) return "neutral";

  const first = prices[0]!;
  const last = prices[prices.length - 1]!;

  if (last > first) return "bullish";
  if (last < first) return "bearish";
  return "neutral";

}

// === Wallet Balance ===
const client = createPublicClient({
  chain: mainnet,
  transport: http(
    "https://virtual.mainnet.eu.rpc.tenderly.co/a6971ff8-2695-40e1-804b-e5fcf5478f8a"
  ),
});

export async function get_wallet_balance(): Promise<number | null> {
  const res = await fetch("http://localhost:3000/api/set_account");

  if (!res.ok) {
    console.error("API not reachable:", res.status);
    return null;
  }

  const data: { account?: string } = await res.json();
  const account = data.account;

  if (!account) {
    console.error("No account connected yet");
    return null;
  }
  

  const balanceWei = await client.getBalance({ address: account as Address });
  const balanceEth = Number(balanceWei) / 1e18;
  return balanceEth;
}




// WETH contract address on Ethereum mainnet
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const s_client = createPublicClient({
  chain: mainnet,
  transport: http("https://virtual.mainnet.eu.rpc.tenderly.co/a6971ff8-2695-40e1-804b-e5fcf5478f8a"),
});
const weth_balance_abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
];

export async function hasWeth():Promise<{ hold_position: boolean; balanceEth: number }>  {
  const res = await fetch("http://localhost:3000/api/set_account");

  if (!res.ok) {
    console.error("API not reachable:", res.status);
  }

  const data: { account?: string } = await res.json();
  const account = data.account;
  const balance = await s_client.readContract({
    address: WETH_ADDRESS,
    abi: weth_balance_abi,
    functionName: "balanceOf",
    args: [account],
  });
  const balanceEth = Number(balance) / 1e18;
  return { hold_position: balanceEth > 0, balanceEth };

}