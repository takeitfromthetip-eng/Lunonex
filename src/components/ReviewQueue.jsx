import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReviewQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQueue() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/sealed-artifacts');
        setQueue(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
  }, []);

  async function handleReview(id, verdict) {
    try {
      await axios.post('/api/review-verdict', { artifactId: id, verdict });
      setQueue((prev) =>
        prev.map((a) => (a._id === id ? { ...a, reviewed: true, verdict } : a))
      );
    } catch (e) {
      alert('Failed to submit verdict: ' + e.message);
    }
  }

  if (loading) return <div>Loading review queue...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <section className="bg-black text-white py-20 px-6 md:px-24">
      <h2 className="text-4xl font-bold text-center mb-12">Sealed Artifact Review Queue</h2>
      <div className="space-y-6">
        {queue.map((a) => (
          <div key={a._id} className="border border-pink-600 rounded-lg p-6">
            <p><strong>Artifact ID:</strong> {a._id}</p>
            <p><strong>Fingerprint Hash:</strong> {a.fingerprintHash}</p>
            <p><strong>Reason:</strong> {a.sealReason}</p>
            <p><strong>Status:</strong> {a.reviewed ? `Verdict: ${a.verdict}` : 'Pending'}</p>
            {!a.reviewed && (
              <div className="space-x-2 mt-4">
                {['approve', 'reject', 'flag-illegal'].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleReview(a._id, v)}
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
