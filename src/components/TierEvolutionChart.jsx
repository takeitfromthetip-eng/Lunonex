import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * @typedef {Object} TierEntry
 * @property {number} timestamp
 * @property {string} tier
 */

/**
 * @param {{ entries: TierEntry[] }} props
 */
export const TierEvolutionChart = ({ entries }) => {
  const tierColorMap = {
    Founding25: "#FFD700",
    Standard: "#00BFFF",
    MidTier: "#32CD32",
    AdultAccess: "#FF69B4",
  };

  const labels = entries.map((e) => new Date(e.timestamp).toLocaleDateString());
  const data = entries.map((e) => Object.keys(tierColorMap).indexOf(e.tier));

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Tier Evolution",
            data,
            borderColor: "#888",
            backgroundColor: "#ccc",
            pointBackgroundColor: entries.map((e) => tierColorMap[e.tier]),
            pointRadius: 6,
            fill: false,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            ticks: {
              callback: (value) => Object.keys(tierColorMap)[value],
            },
            beginAtZero: true,
            stepSize: 1,
          },
        },
        plugins: {
          legend: { display: false },
        },
      }}
    />
  );
};
