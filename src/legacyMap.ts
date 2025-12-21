// legacyMap.ts
export async function getLegacyMap(userId: string) {
  const response = await fetch(`/api/legacy/map/${userId}`);
  if (!response.ok) throw new Error('Legacy map fetch failed');
  return await response.json(); // returns artifact timeline, campaign lineage, tribute tree
}
