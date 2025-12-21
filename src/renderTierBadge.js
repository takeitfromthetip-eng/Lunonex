export function renderTierBadge(tier) {
  const colors = {
    general: "#ccc",
    supporter: "#8bc34a",
    legacy: "#2196f3",
    founder: "#ff9800",
    mythic: "#9c27b0"
  };
  return `<span style="background:${colors[tier]};padding:4px;border-radius:4px;color:white">${tier.toUpperCase()}</span>`;
}
