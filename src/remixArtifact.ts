// remixArtifact.ts
export async function remixArtifact(artifactId: string, targetFormat: 'gif' | 'video' | 'image' | 'audio') {
  const response = await fetch(`/api/artifact/remix/${artifactId}?format=${targetFormat}`);
  if (!response.ok) throw new Error('Remix failed');
  return await response.json(); // returns remixed artifact, fingerprint, legacy sync
}
