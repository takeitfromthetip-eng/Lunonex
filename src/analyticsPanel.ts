// analyticsPanel.ts
export async function getCreatorAnalytics(userId: string) {
  const response = await fetch(`/api/analytics/${userId}`);
  if (!response.ok) throw new Error('Analytics fetch failed');
  return await response.json(); // returns views, exports, vault usage, tier conversions
}
