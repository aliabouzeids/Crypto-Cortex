"use client";
import { useState } from "react";
import { createWalletClient, custom } from "viem";
import { mainnet } from "viem/chains";
import "./globals.css"
import  {apis} from "./backend_apis.json"
import {useEffect}from"react"


  const api = process.env.API_MODE === "development"
    ? apis.local
    : apis.public;

export default function page() {
  const [address, setAddress] = useState(null);
  const [agent_on, set_agent] = useState(false);
  const [interval, set_interval] = useState(3);
  const [tolerance, set_tolerance] = useState(50);
  const [buy_amount, set_buy_amount] = useState(20);
  let minutes=60000;
  let market_state="neutral";
  let ai_decision="hold";

async function connect_wallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const account = accounts[0];
  setAddress(account);

  await send_address_to_backend(account);
}

async function send_address_to_backend(account) {
  const res = await fetch(`${api}/api/set_account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account }),
  });
  if (!res.ok) {
    console.error("Backend error:", res.status);
  } 
}
async function send_agent_state() {
  const res = await fetch(`${api}/api/agent_state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_on }),
  });
  if (!res.ok) {
    console.error("Backend error:", res.status);
  } 
}
async function send_tolerance() {
  const res = await fetch(`${api}/api/tolerance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tolerance }),
  });
  if (!res.ok) {
    console.error("Backend error:", res.status);
  } 
}
async function send_buy_amount() {
  const res = await fetch(`${api}/api/buy_amount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buy_amount }),
  });
  if (!res.ok) {
    console.error("Backend error:", res.status);
  } 
}
async function update_informations(){
  await send_tolerance();
  await send_buy_amount();
  fetch(`${api}/make_decision`);
}
useEffect(() => {
  const id = setInterval(update_informations, interval * minutes);
  return () => clearInterval(id);
}, [interval]);

function agent(){
  set_agent(!agent_on);
  send_agent_state();
}
async function buy(){
  const res = await fetch(`${api}/buy`, { method: "POST" });
  const data = await res.json();
  console.log(data.status, data.amount);

}
async function sell(){
  const res = await fetch(`${api}/sell`, { method: "POST" });
  const data = await res.json();
  console.log(data.status);
}

  return (
    <>
    <div style={{ textAlign: "center", marginTop: "50px"}}>
      <h1>Crypto Cortex Agent</h1>

      {!address ? (
        <button className="button" onClick={connect_wallet}>Connect MetaMask</button>
      ) : (
        <>
          <p>Connected: {address}</p>
        </>

      )}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <label>
              Agent Interval: {interval} min
              <input
                type="range"
                min="3"
                max="30"
                value={interval}
                onChange={(e) => set_interval(e.target.value)}
              />
            </label>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <label>
                Tolerance: {tolerance} %
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tolerance}
                  onChange={(e) => set_tolerance(Number(e.target.value))}
                />
              </label>
            </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <label>
              Buy Amount: {buy_amount} USDT
              <input
                type="number"
                min="1"
                value={buy_amount}
                onChange={(e) => set_buy_amount(Number(e.target.value))}
              />
            </label>
          </div>
        </div>


    </div>
    <div>  
    <button className={`button ${agent_on?"button-on":"button-off"}`} onClick={agent}>{agent_on ? "Agent On" : "Agent Off"}</button></div>
    <button className="button" onClick={buy}>Buy</button>
    <button className="button" onClick={sell}> Sell</button>
    </>
  );
}