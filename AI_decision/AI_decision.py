from typing import TypedDict , List
from langgraph.graph import StateGraph , END 


threshold=3#initial value...
TOLERANCE=0#initial value...
#==========================Agent=======================
class crypto_agent(TypedDict):
    wallet_balance:int 
    prices:List[int]
    price_when_bought:int
    market_previous_state:str 
    hold_position:bool
    signal:str 
    final_decision:str 




#=======================Nodes========================
def entry(agent:crypto_agent):
    return agent
def check_wallet_balance(agent:crypto_agent)->str:
    if( agent["wallet_balance"] < threshold):return "not_enough_balance"
    else:return "continue"

def decide_our_goal(agent:crypto_agent)->str:
    if(agent["hold_position"]):
        if(agent["prices"][len(agent["prices"])-1] > agent["price_when_bought"]+TOLERANCE):
            return "sell"# it only make sense to make profits :)
        
        elif(abs(agent["prices"][-1] - agent["price_when_bought"]) <= TOLERANCE):
            return "hold"#we hold when the market is quiet
        elif(agent["price_when_bought"]>agent["prices"][-1]+TOLERANCE):
            return "sell"# stop more losses
             
    else:return "buy"#if we dont hold a position meaning we havent bought any ETH then lets buy some:)


def buy(agent:crypto_agent)->crypto_agent:
    agent["final_decision"]="buy"
    return agent
def sell(agent:crypto_agent)->crypto_agent:
    agent["final_decision"]="sell"
    return agent
def hold(agent:crypto_agent)->crypto_agent:
    agent["final_decision"]="hold"
    return agent



#==================building the graph====================================

graph=StateGraph(crypto_agent)
graph.add_node("Entry",entry)
graph.add_node("check_balance",lambda agent:agent)
graph.add_node("goal",lambda agent:agent)
graph.add_node("buy",buy)
graph.add_node("sell",sell)
graph.add_node("hold",hold)


graph.set_entry_point("Entry")
graph.add_edge("buy",END)
graph.add_edge("sell",END)
graph.add_edge("hold",END)

graph.add_conditional_edges("Entry",check_wallet_balance,{"not_enough_balance":END,"continue":"goal"})
graph.add_conditional_edges("goal",decide_our_goal,{"buy":"buy","sell":"sell","hold":"hold"})

final_AI=graph.compile()



params = {
    "wallet_balance": 5,
    "prices": [100, 101],
    "price_when_bought": 101,
    "market_previous_state": "bullish",
    "hold_position": True,
    "signal": "",
    "final_decision": ""
}
result = final_AI.invoke(params)
print(result["final_decision"])





