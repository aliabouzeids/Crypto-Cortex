import { number } from "zod";
import finalAI from "./AI_Brain.js";
import {
  build_params,
  calculate_market_state,
  fetch_price,
  has_position,
  get_wallet_balance,
} from "./data_feed.js";


const interval_time: number = 0.1 * 60 * 1000;
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
let price_when_bought : number=299
let buy_amount:number=50
let tolerance:number=10


///==========core functions==================
async function buy(amount:number) {}
async function sell() {}
function unknown_error(){}
function insufficient_balance(){}




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
    const hold_position = has_position(wallet_balance, 3225);

    const params = build_params(
      wallet_balance,
      buy_amount,
      price,
      price_when_bought, // price_when_bought
      tolerance,
      market_state,
      false
    );

    const result = await finalAI.invoke(params);
    
    console.log(
      ` the market state is ${result.agent.market_state}  [${new Date().toLocaleTimeString()}] Decision: ${
        result.agent.final_decision
      } | Latest Price: ${price}`
    );
    if(result.agent.final_decision=="buy"){buy(result.buy_amount)}
    else if(result.agent.final_decision=="sell"){sell()}
    else if(result.agent.final_decision=="hold"){/**do nothing just chill :)) */}
    else {
      if(result.agent.final_decision=="not_enough_balance")insufficient_balance()
      else unknown_error()
    }
  } catch (err) {
    unknown_error()
  }
}

// loop
make_decision();
setInterval(make_decision, interval_time);