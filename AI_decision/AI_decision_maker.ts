import finalAI from "./AI_Brain.js";
import {
  build_params,
  calculate_market_state,
  fetch_price,
  hasWeth,
  get_wallet_balance,
} from "./data_feed.js";
import {buy as swapBuy , sell as swapSell} from "../Interactions/calls.js";

let interval_time: number = 1 * 60 * 1000;
let last_price:number=0;
let price_when_bought : number=2000
let buy_amount:number=50
let tolerance:number=10
let loopId: NodeJS.Timeout | null = null;


export function setBoughtPrice(){
  if(last_price>0)price_when_bought=last_price;
}
export function setAmount(amount:number){
  if(amount>0)buy_amount=amount;
  else alert("amount is not enough");
}
export function setTolerance(_tolerance:number){
  if(_tolerance>0)tolerance=_tolerance;
  else alert("tolerance is not enough");
}
export function setIntervalTime(_interval:number){
  if(_interval>=1 * 60 * 1000)interval_time=_interval;
}
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


///================STOP BOT=================

export function stopAgent() {
  if (loopId) {
    clearInterval(loopId);
    loopId = null;
    console.log("Agent loop stopped.");
  } else {
    console.log("Agent loop is not running.");
  }
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
    last_price=price;
    const{market_state: market_state, confidence:confidence}= await calculate_market_state();
    const {hold_position,balanceEth} = await hasWeth();
    if(!hold_position)price_when_bought=0;
    const params = build_params(
      wallet_balance,
      buy_amount,
      price,
      price_when_bought,
      tolerance,
      market_state,
      confidence,
      hold_position
    );
    const result = await finalAI.invoke(params);

    console.log(
      `Weth balance: ${balanceEth} so does it Hold Position? ${result.agent.hold_position} Market state: ${result.agent.market_state} [${new Date().toLocaleTimeString()}] Decision: ${result.agent.final_decision} | Latest Price: ${price}`
    );


    const decision = result.agent.final_decision;

    if (decision === "buy") {
      console.log("buying...");
      await buy(1000);
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

make_decision();
loopId = setInterval(make_decision, interval_time);
