import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DropScheduler({ tier }) {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDrops() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/drops?tier=${tier}`);
        setDrops(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (tier) fetchDrops();
  }, [tier]);

  if (loading) return <div>Loading drops...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <section className="bg-black text-white py-20 px-6 md:px-24">
      <h2 className="text-4xl font-bold text-center mb-12">Upcoming Drops</h2>
      <div className="space-y-6">
        {drops.map((drop, i) => (
          <div key={i} className="border border-pink-600 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">{drop.title}</h3>
            <p className="text-sm text-gray-400 mb-1">Tier Gate: {drop.tierGate}</p>
            <p className="text-sm text-pink-400 mb-1">Ritual Tag: {drop.ritualTag}</p>
            <p className="text-sm">Scheduled: {new Date(drop.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
