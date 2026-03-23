import finalAI from "./AI_Brain.js";
import {
  build_params,
  calculate_market_state,
  fetch_price,
  hasWeth,
  get_wallet_balance,
} from "./data_feed.js";
import {buy as swapBuy , sell as swapSell} from "../Interactions/calls.js";
import express from "express";


let last_price:number=0;
let price_when_bought : number=2000
let buy_amount:number=50
let tolerance:number=10
let agent_on:boolean=false;
let market_state:string="no state yet";
let confidence:number=0;
let decision:string="havent decided yet";


const app = express();
app.use(express.json());


//============sending apis====================
app.post("/make_decision", async (req, res) => {
const decision = await make_decision();
res.json({ decision });
});

app.post("/buy", async(req, res) => {
  await buy(buy_amount);
  res.json({ status: "buy executed" });
});

app.post("/sell",async (req, res) => {
  await sell();
  res.json({ status: "sell executed" });
});
app.post("/decision",(req,res)=>{
  res.json({decision});
});
app.post("/market_state",(req,res)=>{
  res.json({market_state})
});

  //=================receiving data======================
app.post("/api/agent_state", (req, res) => {
  agent_on = req.body.agent_on;
  console.log("Agent state:", agent_on);

  res.json({ received: agent_on });
});

app.post("/api/tolerance", (req, res) => {
  tolerance=req.body.tolerance;
  console.log("Tolerance:", tolerance);

  res.json({ received: tolerance });
});

app.post("/api/buy_amount", (req, res) => {
  buy_amount  = req.body.buy_amount;
  console.log("Buy amount:", buy_amount);

  res.json({ received: buy_amount });
});

///==========setters functions==================
export function setBoughtPrice(){
  if(last_price>0)price_when_bought=last_price;
}


///==========core functions==================
async function buy(amount: number) {
  const chain = process.env.ACTIVE_CHAIN ?? "tenderly";
  try {
    await swapBuy("9991", amount);
    console.log(`Executed BUY of ${amount} on ${chain}`);
  } catch (err) {
    console.error("Buy failed:", err);
  }
}

async function sell() {
  const chain = process.env.ACTIVE_CHAIN ?? "ethereum";
  try {
    await swapSell("9991");
    console.log(`Executed SELL (all balance) on ${chain}`);
  } catch (err) {
    console.error("Sell failed:", err);
  }
}


///==========helper functions==================
function unknown_error() {
  console.error("Unknown error occurred");
}
function insufficient_balance() {
  console.error("Not enough balance to execute trade");
}


//=======decision=================
async function make_decision(): Promise<void> {
  
  try {

    const wallet_balance = await get_wallet_balance();
    if (wallet_balance === null) {
      console.error("Wallet balance unavailable");
      return;
    }
    const price = await fetch_price();
    last_price=price;
    const{market_state: _market_state, confidence:_confidence}= await calculate_market_state();
    market_state=_market_state;
    confidence=_confidence;
    const {hold_position,balanceEth} = await hasWeth();
    if(!hold_position)price_when_bought=0;
    const params = build_params(
      wallet_balance,
      buy_amount,
      price,
      price_when_bought,
      tolerance,
      _market_state,
      _confidence,
      hold_position
    );
    const result = await finalAI.invoke(params);

    console.log(
      `Weth balance: ${balanceEth} so does it Hold Position? ${result.agent.hold_position} Market state: ${result.agent.market_state} [${new Date().toLocaleTimeString()}] Decision: ${result.agent.final_decision} | Latest Price: ${price}`
    );


    decision = result.agent.final_decision;
    if(agent_on){
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
  }
    
  } catch (err) {
    console.error("Unkown error:", err);// only Allah know
    unknown_error();
  }
}

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});

