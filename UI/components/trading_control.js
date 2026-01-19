"use client";

export default function TradingControls({ onBuy, onSell }) {
  return (
    <div style={{ marginTop: "2rem", textAlign: "center" }}>
      <button
        onClick={onBuy}
        style={{ marginRight: "1rem", padding: "0.5rem 1rem", background: "green", color: "white" }}
      >
        ↑ Buy ETH
      </button>
      <button
        onClick={onSell}
        style={{ padding: "0.5rem 1rem", background: "red", color: "white" }}
      >
        ↓ Sell ETH
      </button>
    </div>
  );
}