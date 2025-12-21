import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function CampaignPulse() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPulse() {
      try {
        const res = await axios.get('/api/pulse-analytics');
        setData(res.data);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchPulse();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-white">Loading pulse metrics...</p>;

  const chartData = {
    labels: data.campaignStats.map((c) => c._id),
    datasets: [
      {
        label: 'Campaigns (last 7d)',
        data: data.campaignStats.map((c) => c.count),
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
      },
      {
        label: 'Unlocks (last 7d)',
        data: data.unlockStats.map((u) => u.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
      y: { ticks: { color: '#fff' }, grid: { color: '#444' } },
    },
  };

  return (
    <section className="bg-black text-white py-20 px-6 md:px-24">
      <h2 className="text-4xl font-bold text-center mb-12">Campaign Pulse (Last 7 Days)</h2>
      <div className="bg-gray-900 rounded-lg p-8">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}
