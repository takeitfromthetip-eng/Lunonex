// Stub for getCreatorLedger for frontend chart demo
export function getCreatorLedger() {
  // Example stub data
  return [
    { timestamp: Date.now() - 86400000 * 3, tier: "Standard" },
    { timestamp: Date.now() - 86400000 * 2, tier: "MidTier" },
    { timestamp: Date.now() - 86400000, tier: "Founding25" },
    { timestamp: Date.now(), tier: "AdultAccess" },
  ];
}
// Stub for getRuntimeInfo used by GenesisProtocol
export const getRuntimeInfo = async () => {
  return {
    platform: 'web',
  version: '2.0.0',
  };
};
