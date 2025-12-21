import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CouncilLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/council-log');
        setLogs(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <section className="p-6 bg-black text-white">
      <h2 className="text-3xl font-bold mb-6">Council Log Archive</h2>
      {loading && <div>Loading logs...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log._id} className="border border-pink-600 p-4 rounded-lg">
            <p><strong>User:</strong> {log.userId}</p>
            <p><strong>Action:</strong> {log.action}</p>
            <p><strong>Verdict:</strong> {log.verdict}</p>
            <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
            <p><strong>Reviewed By:</strong> {log.reviewer}</p>
            <p><strong>Synced:</strong> {log.synced ? 'Yes' : 'Pending'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
