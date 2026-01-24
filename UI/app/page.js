"use client";
import { useState, useEffect } from "react";
import EthCandleChart from "../components/candles";
import TradingControls from "../components/trading_control";

import { fetch_charts_prices } from "../../AI_decision/data_feed";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [ohlc, setOhlc] = useState([]);
  const [latestPrice, setLatestPrice] = useState(null);

  // NEW agent UI state
  const [agentAddress, setAgentAddress] = useState("");
  const [agentPrivateKey, setAgentPrivateKey] = useState("");
  const [showPk, setShowPk] = useState(false);
  const [decisionMinutes, setDecisionMinutes] = useState(5);
  const [isAutoTrading, setIsAutoTrading] = useState(false);

  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      await fetch("/api/set_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: accounts[0] }),
      });
    } else {
      alert("MetaMask not found");
    }
  }

  function buy_eth() {
    alert("Buying ETH… (logic to be added)");
  }

  function sell_eth() {
    alert("Selling ETH… (logic to be added)");
  }

  // Mock: create agent wallet (replace with real backend/contract later)
  function handleCreateAgent() {
    // quick fake values so UI looks real
    const fakeAddr = "0x" + crypto.getRandomValues(new Uint8Array(20)).reduce(
      (acc, b) => acc + b.toString(16).padStart(2, "0"),
      ""
    );
    const fakePk = "0x" + crypto.getRandomValues(new Uint8Array(32)).reduce(
      (acc, b) => acc + b.toString(16).padStart(2, "0"),
      ""
    );
    setAgentAddress(fakeAddr);
    setAgentPrivateKey(fakePk);
  }

  function handleMinutesChange(e) {
    const v = Number(e.target.value || 0);
    if (v < 5) {
      setDecisionMinutes(5);
    } else {
      setDecisionMinutes(v);
    }
  }

  function handleToggleAutoTrade() {
    if (!agentAddress) {
      alert("Create and fund your agent first.");
      return;
    }
    setIsAutoTrading((prev) => !prev);
    // hook to your AI loop / backend trigger later
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
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        margin: 0,
        padding: "2.5rem 1.25rem 3rem",
        background:
          "radial-gradient(circle at top, #1f2937 0, #020617 40%, #020617 100%)",
        color: "#e5e7eb",
        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1024px" }}>
        {/* HERO */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
            gap: "2.5rem",
            alignItems: "center",
            marginBottom: "3rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                backgroundColor: "rgba(148,163,184,0.1)",
                border: "1px solid rgba(148,163,184,0.3)",
                fontSize: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              AI crypto trading agent on Cronos
            </div>
            <h1
              style={{
                fontSize: "2.75rem",
                lineHeight: 1.1,
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Create your agent. <br />
              Fund it.
              <br />
              Let it trade.
            </h1>
            <p
              style={{
                fontSize: "0.975rem",
                color: "#9ca3af",
                maxWidth: "32rem",
                marginBottom: "1rem",
              }}
            >
              Spin up an agent address with its own private key, fund it like a
              normal wallet, and let the AI decide whether to sell or hold your
              position over time.
            </p>
            <p
              style={{
                fontSize: "0.95rem",
                color: "#9ca3af",
                maxWidth: "32rem",
                marginBottom: "1.5rem",
              }}
            >
              The agent opens one position, then only chooses to sell or hold
              based on market state (bullish / bearish) and Binance price data,
              checking every N minutes (minimum 5 to save gas).
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
              <button
                onClick={() => {
                  const el = document.getElementById("agent-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  border: "none",
                  background:
                    "linear-gradient(135deg,#a855f7 0%,#22d3ee 100%)",
                  color: "#0b1120",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Create your agent
              </button>
              {!account ? (
                <button
                  onClick={connectWallet}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(148,163,184,0.5)",
                    backgroundColor: "transparent",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Connect wallet
                </button>
              ) : (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    maxWidth: "14rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    borderRadius: "9999px",
                    border: "1px solid rgba(148,163,184,0.4)",
                    padding: "0.4rem 0.75rem",
                  }}
                >
                  Connected: {account}
                </div>
              )}
            </div>
            {latestPrice && (
              <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                ETH/USD: ${latestPrice}
              </p>
            )}
          </div>

          <div
            style={{
              borderRadius: "1.25rem",
              padding: "1.25rem",
              background:
                "linear-gradient(145deg, rgba(248,250,252,0.08), rgba(15,23,42,0.9))",
              border: "1px solid rgba(148,163,184,0.3)",
              boxShadow:
                "0 20px 45px rgba(15,23,42,0.9), 0 0 60px rgba(56,189,248,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Agent preview
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(74,222,128,0.12)",
                  color: "#4ade80",
                }}
              >
                {isAutoTrading ? "Auto-trading ON" : "Idle"}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#9ca3af" }}>Market</span>
              <span>—</span>
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#9ca3af" }}>Next decision</span>
              <span>{decisionMinutes} min</span>
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                marginBottom: "0.5rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#9ca3af" }}>Last action</span>
              <span>—</span>
            </div>
            <div
              style={{
                marginTop: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(148,163,184,0.35)",
                padding: "0.75rem",
                fontSize: "0.75rem",
                color: "#9ca3af",
              }}
            >
              The agent tracks your entry price and live Binance data, aiming to
              limit big losses and lock in profit when the market moves.
            </div>
          </div>
        </section>

        {/* CREATE AGENT */}
        <section
          id="agent-section"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.6fr)",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              borderRadius: "1.25rem",
              padding: "1.5rem",
              backgroundColor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.35)",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Create your Agent Wallet
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#9ca3af",
                marginBottom: "1rem",
              }}
            >
              Each user gets a dedicated agent address with its own private key,
              just like a normal wallet. Once created, you can fund it and let
              the AI trade on your behalf.
            </p>

            {!agentAddress ? (
              <button
                onClick={handleCreateAgent}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "9999px",
                  border: "none",
                  background:
                    "linear-gradient(135deg,#a855f7 0%,#22d3ee 100%)",
                  color: "#0b1120",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Generate Agent Address
              </button>
            ) : (
              <>
                <div style={{ marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Agent address
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(148,163,184,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {agentAddress}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(agentAddress)
                      }
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: "transparent",
                        color: "#e5e7eb",
                        cursor: "pointer",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Agent private key
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.75rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(148,163,184,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {showPk
                        ? agentPrivateKey
                        : agentPrivateKey
                        ? "••••••••••••••••••••••••••••••"
                        : ""}
                    </span>
                    <button
                      onClick={() => setShowPk((p) => !p)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "9999px",
                        border: "1px solid rgba(248,113,113,0.8)",
                        backgroundColor: "transparent",
                        color: "#fecaca",
                        cursor: "pointer",
                      }}
                    >
                      {showPk ? "Hide" : "Reveal"}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#f97373",
                      marginTop: "0.35rem",
                    }}
                  >
                    Never share this key. It controls your agent funds like a
                    normal wallet.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* FUND + INTERVAL + AUTO TRADE */}
          <div
            style={{
              borderRadius: "1.25rem",
              padding: "1.5rem",
              backgroundColor: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.35)",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Fund, configure, and start auto‑trading
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#9ca3af",
                marginBottom: "1rem",
              }}
            >
              Send tokens on Cronos to your agent address, choose how often the
              AI should make a decision, then toggle auto‑trade on to let it run.
            </p>

            <div style={{ marginBottom: "0.9rem" }}>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  marginBottom: "0.25rem",
                }}
              >
                Funding address
              </div>
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.4)",
                  fontSize: "0.8rem",
                  color: agentAddress ? "#e5e7eb" : "#6b7280",
                }}
              >
                {agentAddress
                  ? agentAddress
                  : "Create your agent to get a funding address."}
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginTop: "0.3rem",
                }}
              >
                Send supported tokens to this address when you are ready to let
                the agent trade.
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.25rem",
                }}
              >
                <span
                  style={{ fontSize: "0.8rem", color: "#9ca3af" }}
                >
                  Decision interval (minutes)
                </span>
                <span style={{ fontSize: "0.8rem" }}>{decisionMinutes} min</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={decisionMinutes}
                onChange={handleMinutesChange}
                style={{ width: "100%" }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginTop: "0.3rem",
                }}
              >
                Minimum is 5 minutes to avoid wasting gas when the market is
                stable.
              </p>
            </div>

            <div
              style={{
                padding: "0.9rem 0.85rem",
                borderRadius: "0.9rem",
                backgroundColor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(148,163,184,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.7rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginBottom: "0.15rem",
                  }}
                >
                  Auto‑trade status
                </div>
                <div style={{ fontSize: "0.9rem" }}>
                  {isAutoTrading ? "Running" : "Stopped"}
                </div>
              </div>
              <button
                onClick={handleToggleAutoTrade}
                style={{
                  padding: "0.6rem 1.1rem",
                  borderRadius: "9999px",
                  border: "none",
                  background: isAutoTrading
                    ? "rgba(248,113,113,0.15)"
                    : "linear-gradient(135deg,#a855f7 0%,#22d3ee 100%)",
                  color: isAutoTrading ? "#fecaca" : "#0b1120",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {isAutoTrading ? "Stop auto‑trading" : "Start auto‑trading"}
              </button>
            </div>

            <p
              style={{
                fontSize: "0.78rem",
                color: "#9ca3af",
              }}
            >
              When auto‑trade is on, the agent periodically decides whether to
              sell or hold based on market state (bullish/bearish) from Binance
              history and the current token price.
            </p>
          </div>
        </section>

        {/* LIVE MARKET SECTION (your existing components) */}
        <section
          style={{
            borderRadius: "1.25rem",
            padding: "1.5rem",
            backgroundColor: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
              }}
            >
              Live market view
            </h2>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
              }}
            >
              Watch ETH candles while your agent runs.
            </span>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <EthCandleChart ohlc={ohlc} />
          </div>
          <TradingControls onBuy={buy_eth} onSell={sell_eth} />
        </section>
      </div>
    </main>
  );
}
