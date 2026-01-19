"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, TimeScale, Tooltip, Legend, BarElement);

export default function EthCandleChart({ ohlc }) {
  if (!Array.isArray(ohlc) || ohlc.length === 0) {
    return <p style={{ textAlign: "center" }}>Loading ETH/USD bars…</p>;
  }

  const data = {
    labels: ohlc.map((c) => c.time),
    datasets: [
      {
        label: "ETH/USD Price Range",
        data: ohlc.map((c) => ({
          x: c.time,
          y: c.high - c.low,   // bar height
          base: c.low,         // bar bottom
          open: c.open,
          close: c.close,
        })),
        backgroundColor: ohlc.map((c) =>
          c.close >= c.open ? "rgba(0, 200, 83, 0.7)" : "rgba(213, 0, 0, 0.7)"
        ),
        borderRadius: 0,
        barPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const raw = ctx.raw;
            return `O: ${raw.open}  H: ${raw.base + raw.y}  L: ${raw.base}  C: ${raw.close}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour" },
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#fff" },
      },
      y: {
        title: { display: true, text: "Price (USD)", color: "#fff" },
        ticks: { color: "#fff", callback: (val) => `$${val}` },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div style={{
      width: "1000px",
      height: "560px",
      margin: "2rem auto",
      background: "#000",
      border: "none",
    }}>
      <Bar data={data} options={options} />
    </div>
  );
}