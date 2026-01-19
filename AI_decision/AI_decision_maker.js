import finalAI from "./AI_Brain.js";
import {build_params,fetch_prices} from "./data_feed.js"


var interval_time= 0.01 * 60 * 1000



async function make_decision() {
  try {
    const price = await fetch_prices();
    const params = await build_params(price,0,3224);
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