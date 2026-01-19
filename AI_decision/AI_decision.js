import { StateGraph, END } from "@langchain/langgraph";

// === Agent type ===
/**
 * @typedef {Object} CryptoAgent
 * @property {number} wallet_balance
 * @property {number[]} prices
 * @property {number} price_when_bought
 * @property {string} market_previous_state
 * @property {boolean} hold_position
 * @property {string} signal
 * @property {string} final_decision
 */

const threshold = 3;
const TOLERANCE = 0;

// === Nodes ===
function entry(agent) {
  return agent;
}

function checkWalletBalance(agent) {
  if (agent.wallet_balance < threshold) return "not_enough_balance";
  return "continue";
}

function decideGoal(agent) {
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

function buy(agent) {
  agent.final_decision = "buy";
  return agent;
}

function sell(agent) {
  agent.final_decision = "sell";
  return agent;
}

function hold(agent) {
  agent.final_decision = "hold";
  return agent;
}

// === Build the graph ===
const graph = new StateGraph();

graph.addNode("Entry", entry);
graph.addNode("goal", (agent) => agent);
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

// === Example run ===
const params = {
  wallet_balance: 5,
  prices: [100, 101],
  price_when_bought: 101,
  market_previous_state: "bullish",
  hold_position: true,
  signal: "",
  final_decision: "",
};

const result = finalAI.invoke(params);
console.log(result.final_decision); // should print "hold"