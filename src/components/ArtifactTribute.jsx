import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ArtifactTribute({ artifactId }) {
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtifact() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/artifact/${artifactId}`);
        setArtifact(res.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (artifactId) fetchArtifact();
  }, [artifactId]);

  if (loading) return <p className="text-white">Loading tribute...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!artifact) return <p className="text-white">No artifact found.</p>;

  return (
    <section className="bg-black text-white py-12 px-6 md:px-24">
      <h2 className="text-4xl font-bold mb-6">{artifact.metadata?.title || 'Untitled Artifact'}</h2>
      {artifact.imageUrl && (
        <img src={artifact.imageUrl} alt={artifact.metadata?.title || 'Artifact'} className="w-full h-auto rounded-lg mb-6" />
      )}
      <div className="text-sm text-gray-400 space-y-2">
        <p><strong>Ritual Tag:</strong> {artifact.metadata?.ritualTag || 'N/A'}</p>
        <p><strong>Vault Tier:</strong> {artifact.metadata?.vaultTier || 'N/A'}</p>
        <p><strong>Unlocked At:</strong> {artifact.unlockedAt ? new Date(artifact.unlockedAt).toLocaleString() : 'N/A'}</p>
        <p><strong>Description:</strong> {artifact.metadata?.description || 'No description.'}</p>
      </div>
    </section>
  );
}
