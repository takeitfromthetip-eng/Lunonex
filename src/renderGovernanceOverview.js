import { generateTierAnalytics } from "./generateTierAnalytics.js";

export async function renderGovernanceOverview() {
  const analytics = await generateTierAnalytics();
  return `
    <h3>Governance Overview</h3>
    <ul>
      ${Object.entries(analytics).map(([tier, count]) =>
        `<li>${tier.toUpperCase()}: ${count} artifacts</li>`
      ).join("")}
    </ul>
  `;
}
