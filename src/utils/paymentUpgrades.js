/* eslint-disable */
// Payment Upgrade Credit System
// Tracks payments and calculates upgrade costs

const TIER_PRICES = {
  'FREE': 0,
  'BASIC_50': 50,
  'STANDARD_100': 100,
  'PRO_250': 250,
  'PREMIUM_500': 500,
  'PREMIUM_1000': 1000,
  'ELITE_1000': 1000
};

export function getTierPrice(tierId) {
  return TIER_PRICES[tierId] || 0;
}

export function getCurrentTierValue() {
  const currentTier = localStorage.getItem('userTier') || 'FREE';
  return getTierPrice(currentTier);
}

export function calculateUpgradeCost(targetTierId) {
  const currentValue = getCurrentTierValue();
  const targetValue = getTierPrice(targetTierId);
  
  const upgradeCost = Math.max(0, targetValue - currentValue);
  
  return {
    currentValue,
    targetValue,
    upgradeCost,
    alreadyPaid: currentValue,
    discount: currentValue
  };
}

export function formatUpgradeMessage(targetTierId) {
  const { currentValue, upgradeCost, alreadyPaid } = calculateUpgradeCost(targetTierId);
  
  if (currentValue === 0) {
    return `Pay $${upgradeCost}`;
  }
  
  return `Pay $${upgradeCost} (You've already paid $${alreadyPaid})`;
}

export function canUpgradeToTier(targetTierId) {
  const currentValue = getCurrentTierValue();
  const targetValue = getTierPrice(targetTierId);
  
  return targetValue > currentValue;
}

export function getUpgradeOptions() {
  const currentTier = localStorage.getItem('userTier') || 'FREE';
  const currentValue = getCurrentTierValue();
  
  const allTiers = [
    { id: 'BASIC_50', name: '$50 Basic', price: 50 },
    { id: 'STANDARD_100', name: '$100 Standard', price: 100 },
    { id: 'PRO_250', name: '$250 Pro', price: 250 },
    { id: 'PREMIUM_500', name: '$500 Premium', price: 500 },
    { id: 'PREMIUM_1000', name: '$1000 VIP', price: 1000 }
  ];
  
  return allTiers
    .filter(tier => tier.price > currentValue)
    .map(tier => ({
      ...tier,
      upgradeCost: tier.price - currentValue,
      alreadyPaid: currentValue
    }));
}
