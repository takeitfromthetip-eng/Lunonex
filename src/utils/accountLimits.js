// Account Creation Limits
// - Owner: Unlimited accounts (for monetization)
// - 12 VIPs: 3 accounts max
// - $1000 tier: 3 accounts max
// - Everyone else: 1 account only

import { isOwner, LIFETIME_VIP_EMAILS } from './vipHelper';

export function getAccountLimit(email) {
  if (!email) return 1;
  
  // Owner gets unlimited accounts
  if (isOwner(email)) {
    return Infinity;
  }
  
  // 12 VIPs and $1000 tier get 3 accounts
  const normalizedEmail = email.toLowerCase();
  if (LIFETIME_VIP_EMAILS.includes(normalizedEmail)) {
    return 3;
  }
  
  const userTier = localStorage.getItem('userTier');
  if (userTier === 'PREMIUM_1000' || userTier === 'ELITE_1000') {
    return 3;
  }
  
  // Everyone else gets 1 account
  return 1;
}

export function canCreateAnotherAccount(email) {
  const limit = getAccountLimit(email);
  
  // Owner has no limit
  if (limit === Infinity) return true;
  
  // Check how many accounts this email has created
  const accountCount = getAccountCount(email);
  
  return accountCount < limit;
}

export function getAccountCount(email) {
  // Get from localStorage for now (will move to backend/Supabase later)
  const accountsKey = `accounts_${email}`;
  const accountsData = localStorage.getItem(accountsKey);
  
  if (!accountsData) return 0;
  
  try {
    const accounts = JSON.parse(accountsData);
    return Array.isArray(accounts) ? accounts.length : 0;
  } catch {
    return 0;
  }
}

export function registerNewAccount(email, accountData) {
  const accountsKey = `accounts_${email}`;
  const existing = localStorage.getItem(accountsKey);
  
  let accounts = [];
  if (existing) {
    try {
      accounts = JSON.parse(existing);
    } catch {
      accounts = [];
    }
  }
  
  accounts.push({
    ...accountData,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem(accountsKey, JSON.stringify(accounts));
  
  return true;
}

export function getAccountCreationMessage(email) {
  const limit = getAccountLimit(email);
  const count = getAccountCount(email);
  
  if (limit === Infinity) {
    return `Unlimited accounts (${count} created)`;
  }
  
  const remaining = limit - count;
  
  if (remaining === 0) {
    return `Account limit reached (${count}/${limit})`;
  }
  
  return `${remaining} account${remaining === 1 ? '' : 's'} remaining (${count}/${limit} used)`;
}
