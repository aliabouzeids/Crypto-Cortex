import { z } from "zod";
import { StateGraph, END } from "@langchain/langgraph";

const AgentSchema = z.object({
  wallet_balance: z.number(),
  prices: z.array(z.number()),
  price_when_bought: z.number(),
  market_previous_state: z.string(),
  hold_position: z.boolean(),
  signal: z.string(),
  final_decision: z.string(),
});

const threshold = 3;
const TOLERANCE = 0;

function entry(state) {
  return state;
}

function checkWalletBalance(state) {
  if (state.wallet_balance < threshold) return "not_enough_balance";
  return "continue";
}

function decideGoal(state) {
  if (state.hold_position) {
    const lastPrice = state.prices[state.prices.length - 1];
    if (lastPrice > state.price_when_bought + TOLERANCE) {
      return "sell";
    } else if (Math.abs(lastPrice - state.price_when_bought) <= TOLERANCE) {
      return "hold";
    } else if (state.price_when_bought > lastPrice + TOLERANCE) {
      return "sell";
    }
  } else {
    return "buy";
  }
}

function buy(state) {
  return { ...state, final_decision: "buy" };
}

function sell(state) {
  return { ...state, final_decision: "sell" };
}

function hold(state) {
  return { ...state, final_decision: "hold" };
}

const graph = new StateGraph(AgentSchema);

graph.addNode("Entry", entry);
graph.addNode("goal", (state) => state);
graph.addNode("buy", buy);
graph.addNode("sell", sell);
graph.addNode("hold", hold);

graph.setEntryPoint("Entry");

graph.addEdge("buy", END);
graph.addEdge("sell", END);
graph.addEdge("hold", END);

graph.addConditionalEdges("Entry", checkWalletBalance, {
  not_enough_balance: END,
  continue: "goal",
});

graph.addConditionalEdges("goal", decideGoal, {
  buy: "buy",
  sell: "sell",
  hold: "hold",
});

const finalAI = graph.compile();

const params = {
  wallet_balance: 5,
  prices: [100, 101],
  price_when_bought: 101,
  market_previous_state: "bullish",
  hold_position: true,
  signal: "",
  final_decision: "",
};

const result = await finalAI.invoke(params);
console.log(result.final_decision); // should print "hold"