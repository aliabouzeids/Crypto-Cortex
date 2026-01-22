import { z } from "zod";
import { StateGraph, END } from "@langchain/langgraph";

// === Define schema ===
const AgentSchema = z.object({
  wallet_balance: z.number(),
  buy_amount:z.number(),
  last_price: z.number(),
  price_when_bought: z.number(),
  tolerance:z.number(),
  market_state: z.string(),
  hold_position: z.boolean(),
  final_decision: z.string(),
});

// Infer TypeScript type from Zod schema
type Agent = z.infer<typeof AgentSchema>;
interface State {
  agent: Agent;
}


// === Nodes ===
function entry(state: State): State {
  return state;
}

function checkWalletBalance(state: State): string {
  if (state.agent.hold_position) {
    return "continue";
  } else {
    if (state.agent.wallet_balance < state.agent.buy_amount) return "not_enough_balance";
    return "continue";
  }
}

function decideGoal(state: State): string {
  const agent = state.agent;
  
  if (agent.hold_position) {
    if(agent.market_state=="bullish"){
      if(agent.price_when_bought>agent.last_price+agent.tolerance)return "hold"
      else if(agent.price_when_bought<=agent.last_price+agent.tolerance)return "sell"
    }
    else if(agent.market_state=="bearish"){
      if(agent.last_price +agent.tolerance<=agent.price_when_bought)return "hold"
      else if(agent.last_price>=agent.price_when_bought)return "sell"
    }
    else{
      return "hold"
    }
  }
  return "buy";//buy at first
}

function buy(state: State): State {
  return { agent: { ...state.agent, final_decision: "buy" } };
}

function sell(state: State): State {
  return { agent: { ...state.agent, final_decision: "sell" } };
}

function hold(state: State): State {
  return { agent: { ...state.agent, final_decision: "hold" } };
}

function not_enough_balance(state: State): State {
  return { agent: { ...state.agent, final_decision: "not_enough_balance" } };
}

// === Build graph ===
const graph = new StateGraph({
  channels: {
    agent: AgentSchema,
  } as any,
});

graph.addNode("Entry", entry);
graph.addNode("goal", (state: State) => state);
graph.addNode("buy", buy);
graph.addNode("sell", sell);
graph.addNode("hold", hold);
graph.addNode("not_enough_balance", not_enough_balance);

graph.setEntryPoint("Entry" as any);

graph.addEdge("buy" as any, END);
graph.addEdge("sell" as any, END);
graph.addEdge("hold" as any, END);
graph.addEdge("not_enough_balance" as any, END);

graph.addConditionalEdges("Entry" as any, checkWalletBalance as any, {
  not_enough_balance: "not_enough_balance",
  continue: "goal",
} as any);

graph.addConditionalEdges("goal" as any, decideGoal as any, {
  buy: "buy",
  sell: "sell",
  hold: "hold",
} as any);

// === Export compiled graph ===
const finalAI:any= graph.compile();
export default finalAI;

// Example usage:
// const params: State = {
//   agent: {
//     wallet_balance: 5,
//     prices: [100, 101],
//     price_when_bought: 101,
//     market_state: "bullish",
//     hold_position: true,
//     final_decision: "",
//   },
// };
// const result = await finalAI.invoke(params);
// console.log(result.agent.final_decision); // "hold"