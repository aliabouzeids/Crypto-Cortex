import { number } from "zod";
import finalAI from "./AI_Brain.js";
import {
  build_params,
  calculate_market_state,
  fetch_price,
  has_position,
  get_wallet_balance,
} from "./data_feed.js";
import {buy as swapBuy , sell as swapSell} from "../Interactions/calls.js";

const interval_time: number = 1 * 60 * 1000;
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
let price_when_bought : number=2000
let buy_amount:number=50
let tolerance:number=10


///==========core functions==================
async function buy(amount: number) {
  const chain = process.env.ACTIVE_CHAIN ?? "tenderly"; // choose chain dynamically
  try {
    await swapBuy(chain, amount);
    console.log(`Executed BUY of ${amount} on ${chain}`);
  } catch (err) {
    console.error("Buy failed:", err);
  }
}

async function sell() {
  const chain = process.env.ACTIVE_CHAIN ?? "ethereum";
  try {
    await swapSell(chain);
    console.log(`Executed SELL (all balance) on ${chain}`);
  } catch (err) {
    console.error("Sell failed:", err);
  }
}

function unknown_error() {
  console.error("Unknown error occurred");
}
function insufficient_balance() {
  console.error("Not enough balance to execute trade");
}





///================LOOP BOT=================

async function make_decision(): Promise<void> {
  try {
    const wallet_balance = await get_wallet_balance();
    if (wallet_balance === null) {
      console.error("Wallet balance unavailable");
      return;
    }
    const price = await fetch_price();
    const market_state = await calculate_market_state();
    const hold_position = has_position(wallet_balance, 0);

    const params = build_params(
      wallet_balance,
      buy_amount,
      price,
      price_when_bought,
      tolerance,
      market_state,
      true
    );

    const result = await finalAI.invoke(params);

    console.log(
      `Market state: ${result.agent.market_state} [${new Date().toLocaleTimeString()}] Decision: ${result.agent.final_decision} | Latest Price: ${price}`
    );


    const decision = result.agent.final_decision;

    if (decision === "buy") {
      console.log("buying...");
      await buy(result.buy_amount);
    } else if (decision === "sell") {
      console.log("selling...");
      try {
        await sell();
      } catch (err) {
        console.error("Sell failed:", err);
      }
    } else if (decision === "hold") {
      console.log("holding...");
    } else if (decision === "not_enough_balance") {
      insufficient_balance();
    } else {
      unknown_error();
    }
    
  } catch (err) {
    console.error("Unkown error:", err);// only Allah know
    unknown_error();
  }
}
// loop
make_decision();
setInterval(make_decision, interval_time);