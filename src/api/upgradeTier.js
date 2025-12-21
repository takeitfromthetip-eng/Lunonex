// Client-side API utility for /api/upgrade-tier
// @ts-ignore
import { tutorialSteps } from '../tutorial.js';
export async function upgradeTier(userId) {
  const res = await fetch('/api/upgrade-tier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Upgrade failed');
  const { welcomeArtifact, tribute } = await res.json();
  return {
    welcome: await welcomeArtifact.json(),
    tribute,
    legacyId: `ONB-${userId}-${Date.now()}`,
    tutorial: tutorialSteps,
  };
}
