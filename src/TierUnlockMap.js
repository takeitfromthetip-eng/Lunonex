export function renderTierUnlocks(tier, unlocks) {
  return `
    <h3>${tier} Tier Unlocks</h3>
    <ul>
      ${unlocks.map(u => `<li>${u}</li>`).join("")}
    </ul>
  `;
}
