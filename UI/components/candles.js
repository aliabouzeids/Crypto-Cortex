"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function EthCandleChart({ ohlc }) {
  if (!Array.isArray(ohlc) || ohlc.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#9ca3af" }}>
        Loading ETH/USD chart…
      </p>
    );
  }

  const series = useMemo(
    () => [
      {
        name: "ETH / USD",
        data: ohlc.map((c) => ({
          x: c.time, // Date object from your existing code
          y: [c.open, c.high, c.low, c.close],
        })),
      },
    ],
    [ohlc]
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "candlestick",
        toolbar: { show: false },
        background: "transparent",
      },
      theme: { mode: "dark" },
      xaxis: {
        type: "datetime",
        labels: {
          style: { colors: "#9ca3af" },
        },
      },
      yaxis: {
        tooltip: { enabled: true },
        labels: {
          style: { colors: "#9ca3af" },
        },
      },
      grid: { borderColor: "rgba(55,65,81,0.6)" },
      plotOptions: {
        candlestick: {
          colors: {
            upward: "#4ade80",
            downward: "#f97373",
          },
          wick: { useFillColor: true },
        },
      },
      tooltip: { theme: "dark" },
    }),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        height: "360px",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="candlestick"
        height={"100%"}
        width={"100%"}
      />
    </div>
  );
}
