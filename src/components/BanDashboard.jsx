import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BanDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQueue() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/ban-queue');
        setQueue(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  async function handleVerdict(banId, verdict) {
    try {
      await axios.post('/api/ban-verdict', { banId, verdict });
      setQueue((prev) =>
        prev.map((b) => (b._id === banId ? { ...b, verdict, reviewed: true } : b))
      );
    } catch (e) {
      alert('Failed to submit verdict: ' + e.message);
    }
  }

  if (loading) return <div>Loading ban queue...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <section className="bg-black text-white py-20 px-6 md:px-24">
      <h2 className="text-4xl font-bold text-center mb-12">Ban Council Dashboard</h2>
      <div className="space-y-6">
        {queue.map((b) => (
          <div key={b._id} className="border border-pink-600 rounded-lg p-6">
            <p><strong>User:</strong> {b.userId}</p>
            <p><strong>Reason:</strong> {b.reason}</p>
            <p><strong>Status:</strong> {b.reviewed ? `Verdict: ${b.verdict}` : 'Pending'}</p>
            {!b.reviewed && (
              <div className="space-x-2 mt-4">
                {['approved', 'rejected', 'graveyarded'].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleVerdict(b._id, v)}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-1 px-4 rounded"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
