import { z } from "zod";
import { StateGraph, END } from "@langchain/langgraph";

// === Define schema ===
const AgentSchema = z.object({
  wallet_balance: z.number(),
  prices: z.array(z.number()),
  price_when_bought: z.number(),
  market_previous_state: z.string(),
  hold_position: z.boolean(),
  signal: z.string(),
  final_decision: z.string(),
});

// === Parameters ===
const threshold = 0;
const TOLERANCE = 0;

// === Nodes ===
function entry(state) {
  return state;
}

function checkWalletBalance(state) {
  if (state.agent.wallet_balance < threshold) return "not_enough_balance";
  return "continue";
}

function decideGoal(state) {
  const agent = state.agent;
  if (agent.hold_position) {
    const lastPrice = agent.prices[agent.prices.length - 1];
    if (lastPrice > agent.price_when_bought + TOLERANCE) {
      return "sell";
    } else if (Math.abs(lastPrice - agent.price_when_bought) <= TOLERANCE) {
      return "hold";
    } else if (agent.price_when_bought > lastPrice + TOLERANCE) {
      return "sell";
    }
  } else {
    return "buy";
  }
}

function buy(state) {
  return { agent: { ...state.agent, final_decision: "buy" } };
}

function sell(state) {
  return { agent: { ...state.agent, final_decision: "sell" } };
}

function hold(state) {
  return { agent: { ...state.agent, final_decision: "hold" } };
}

// === Build graph ===
const graph = new StateGraph({
  channels: {
    agent: AgentSchema,
  },
});

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

// === Export compiled graph ===
const finalAI = graph.compile();
export default finalAI;

// const params = {
//   wallet_balance: 5,
//   prices: [100, 101],
//   price_when_bought: 101,
//   market_previous_state: "bullish",
//   hold_position: true,
//   signal: "",
//   final_decision: "",
// };

// const result = await finalAI.invoke(params);
// console.log(result.final_decision); // should print "hold"