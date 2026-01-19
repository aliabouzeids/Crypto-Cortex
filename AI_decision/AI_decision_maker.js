import finalAI from "./AI_Brain.js";
import {build_params,calculate_market_state,fetch_prices, has_position,get_wallet_balance} from "./data_feed.js"


var interval_time= 0.01 * 60 * 1000



async function make_decision() {
  try {
    

    const wallet_balance=get_wallet_balance()
    console.log(wallet_balance)
    const price = await fetch_prices();
    const market_state=await calculate_market_state()
    const hold_position=has_position(wallet_balance,3225)

    const params = await build_params(wallet_balance,price,0,3224,market_state,hold_position);
    
    
    const result = await finalAI.invoke(params);

    console.log(
      `[${new Date().toLocaleTimeString()}] Decision: ${result.agent.final_decision} | Latest Price: ${price.at(-1)}`
    );
  } 
  catch (err) {
    console.error("Decision loop failed:", err);
  }
}


//loop
make_decision();
setInterval(make_decision,interval_time);