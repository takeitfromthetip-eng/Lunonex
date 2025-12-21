import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function VaultViewer({ userId, tier }) {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtifacts() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/vault?userId=${userId}&tier=${tier}`);
        setArtifacts(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (userId && tier) fetchArtifacts();
  }, [userId, tier]);

  if (loading) return <div>Loading artifacts...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <section className="bg-black text-white py-20 px-6 md:px-24">
      <h2 className="text-4xl font-bold text-center mb-12">Unlocked Vault Artifacts</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {artifacts.map((a, i) => (
          <div key={i} className="border border-pink-600 rounded-lg overflow-hidden">
            <img src={a.imageUrl} alt={a.metadata?.title || 'Artifact'} className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{a.metadata?.title || 'Untitled'}</h3>
              <p className="text-sm text-gray-400 mb-2">Unlocked: {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : 'N/A'}</p>
              <p className="text-sm text-pink-400 italic">{a.metadata?.ritualTag || ''}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
