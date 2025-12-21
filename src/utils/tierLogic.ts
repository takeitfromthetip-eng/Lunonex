// Simple getUserTier utility placeholder
export async function getUserTier(userId: string): Promise<string[]> {
  // Placeholder: return mock tiers
  if (userId === 'legacy') return ['Legacy'];
  if (userId === 'mythic') return ['Mythic'];
  return ['Standard'];
}
