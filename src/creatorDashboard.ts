// creatorDashboard.ts
export async function getCreatorProfile(userId: string) {
  const response = await fetch(`/api/creator/${userId}/profile`);
  if (!response.ok) throw new Error('Profile fetch failed');
  return await response.json(); // returns tier, artifacts, vault stats, campaign history
}
