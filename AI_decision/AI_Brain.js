"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var langgraph_1 = require("@langchain/langgraph");
// === Define schema ===
var AgentSchema = zod_1.z.object({
    wallet_balance: zod_1.z.number(),
    buy_amount: zod_1.z.number(),
    last_price: zod_1.z.number(),
    price_when_bought: zod_1.z.number(),
    tolerance: zod_1.z.number(),
    market_state: zod_1.z.string(),
    confidence: zod_1.z.number(),
    hold_position: zod_1.z.boolean(),
    final_decision: zod_1.z.string(),
});
// === Nodes ===
function entry(state) {
    return state;
}
function checkWalletBalance(state) {
    if (state.agent.hold_position) {
        return "continue";
    }
    else {
        if (state.agent.wallet_balance < state.agent.buy_amount)
            return "not_enough_balance";
        return "continue";
    }
}
function decideGoal(state) {
    var agent = state.agent;
    if (agent.hold_position) {
        if (agent.market_state == "bullish") {
            if (agent.price_when_bought > agent.last_price + agent.tolerance)
                return "hold";
            else if (agent.price_when_bought <= agent.last_price + agent.tolerance)
                return "sell";
        }
        else if (agent.market_state == "bearish") {
            if (agent.last_price + agent.tolerance <= agent.price_when_bought)
                return "hold";
            else if (agent.last_price >= agent.price_when_bought)
                return "sell";
        }
        else {
            return "hold";
        }
    }
    if (agent.market_state == "bullish" && agent.confidence > 0.8)
        return "buy"; //buy at first
    else
        return "hold"; //dont buy when the market is bearish
}
function buy(state) {
    return { agent: __assign(__assign({}, state.agent), { final_decision: "buy" }) };
}
function sell(state) {
    return { agent: __assign(__assign({}, state.agent), { final_decision: "sell" }) };
}
function hold(state) {
    return { agent: __assign(__assign({}, state.agent), { final_decision: "hold" }) };
}
function not_enough_balance(state) {
    return { agent: __assign(__assign({}, state.agent), { final_decision: "not_enough_balance" }) };
}
// === Build graph ===
var graph = new langgraph_1.StateGraph({
    channels: {
        agent: AgentSchema,
    },
});
graph.addNode("Entry", entry);
graph.addNode("goal", function (state) { return state; });
graph.addNode("buy", buy);
graph.addNode("sell", sell);
graph.addNode("hold", hold);
graph.addNode("not_enough_balance", not_enough_balance);
graph.setEntryPoint("Entry");
graph.addEdge("buy", langgraph_1.END);
graph.addEdge("sell", langgraph_1.END);
graph.addEdge("hold", langgraph_1.END);
graph.addEdge("not_enough_balance", langgraph_1.END);
graph.addConditionalEdges("Entry", checkWalletBalance, {
    not_enough_balance: "not_enough_balance",
    continue: "goal",
});
graph.addConditionalEdges("goal", decideGoal, {
    buy: "buy",
    sell: "sell",
    hold: "hold",
});
// === Export compiled graph ===
var finalAI = graph.compile();
exports.default = finalAI;
