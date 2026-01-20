"use client";
import { useState, useEffect } from "react";
import EthCandleChart from "../components/candles";
import TradingControls from "../components/trading_control";
import {buy,sell} from "./interaction"
import {fetch_charts_prices}from "../../AI_decision/data_feed.js"

export default function Home() {
  const [account, setAccount] = useState(null);
  const [ohlc, setOhlc] = useState([]);
  const [latestPrice, setLatestPrice] = useState(null);

 async function connectWallet() {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);

    // NEW: send account to backend API
    await fetch("/api/set_account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: accounts[0] }),
    });
  } else {
    alert("MetaMask not found");
  }
}

  async function buy_eth() {
    buy(0)
    alert("Buying ETH… (logic to be added)");
  }

  async function sell_eth() {
    sell(0)
    alert("Selling ETH… (logic to be added)");
  }

  // Fetch OHLC candles + volume from Binance
  useEffect(() => {
    async function fetchOHLC() {
      try {
        const data = await fetch_charts_prices();

        const formatted = data.map((candle) => ({
          time: new Date(candle[0]),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5]),
        }));

        setOhlc(formatted);
        setLatestPrice(formatted.at(-1)?.close?.toFixed(2));
      } catch (err) {
        console.error("OHLC fetch failed:", err);
      }
    }

    fetchOHLC();
    const interval = setInterval(fetchOHLC, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
      <main style={{
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#000",
    color: "#ffffff",
    margin: 0,
    padding:"1rem",
  }}>


      <h1> Crypto Cortex</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected to  {account}</p>
      )}

      {latestPrice && <p>ETH/USD: ${latestPrice}</p>}

      <EthCandleChart ohlc={ohlc} />
      <TradingControls onBuy={buy_eth} onSell={sell_eth} />
    </main>
  );
}