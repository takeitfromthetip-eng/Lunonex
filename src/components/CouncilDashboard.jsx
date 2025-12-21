import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CouncilDashboard() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProposals() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/ban-proposals');
        setProposals(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProposals();
  }, []);

  async function handleVerdict(id, verdict) {
    try {
      await axios.post('/api/ban-verdict', { proposalId: id, verdict });
      setProposals((prev) =>
        prev.map((p) => (p._id === id ? { ...p, verdict, reviewed: true } : p))
      );
    } catch (e) {
      alert('Failed to submit verdict: ' + (e.response?.data?.error || e.message));
    }
  }

  return (
    <section className="p-6 bg-black text-white">
      <h2 className="text-3xl font-bold mb-6">AI Council Ban Proposals</h2>
      {loading && <div>Loading proposals...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="space-y-6">
        {proposals.map((p) => (
          <div key={p._id} className="border border-pink-600 p-4 rounded-lg">
            <p><strong>User:</strong> {p.userId}</p>
            <p><strong>Reason:</strong> {p.reason}</p>
            <p><strong>Status:</strong> {p.reviewed ? `Verdict: ${p.verdict}` : 'Pending'}</p>
            {!p.reviewed && (
              <div className="space-x-2 mt-4">
                {['approved', 'rejected', 'crowned', 'graveyarded'].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleVerdict(p._id, v)}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-1 px-3 rounded"
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
