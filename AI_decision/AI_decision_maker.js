import finalAI from "./AI_Brain.js";
import { build_params, calculate_market_state, fetch_prices, has_position, get_wallet_balance, } from "./data_feed.js";
const interval_time = 0.1 * 60 * 1000;
async function make_decision() {
    try {
        const wallet_balance = await get_wallet_balance();
        if (wallet_balance === null) {
            console.error("Wallet balance unavailable");
            return;
        }
        const prices = await fetch_prices();
        const market_state = await calculate_market_state();
        const hold_position = has_position(wallet_balance, 3225);
        const params = build_params(wallet_balance, prices, 3100, // price_when_bought
        market_state, hold_position);
        const result = await finalAI.invoke(params);
        console.log(`[${new Date().toLocaleTimeString()}] Decision: ${result.agent.final_decision} | Latest Price: ${prices.at(-1)}`);
    }
    catch (err) {
        console.error("Decision loop failed:", err);
    }
}
// loop
make_decision();
setInterval(make_decision, interval_time);
//# sourceMappingURL=AI_decision_maker.js.map