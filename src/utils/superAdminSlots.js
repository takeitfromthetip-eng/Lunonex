/**
 * Super Admin Slot Management
 * Tracks $1,000 tier purchases with 100 slot limit
 * VIP list members don't count toward limit
 */

const SUPER_ADMIN_SLOT_LIMIT = 100;
const STORAGE_KEY = 'superAdminSlots';

/**
 * Get current super admin slot data
 */
export function getSuperAdminSlots() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return {
      purchased: [],
      remaining: SUPER_ADMIN_SLOT_LIMIT,
      limit: SUPER_ADMIN_SLOT_LIMIT
    };
  }
  
  const slots = JSON.parse(data);
  return {
    ...slots,
    remaining: SUPER_ADMIN_SLOT_LIMIT - (slots.purchased?.length || 0),
    limit: SUPER_ADMIN_SLOT_LIMIT
  };
}

/**
 * Purchase a super admin slot
 */
export function purchaseSuperAdminSlot(userEmail, userId, paymentDetails) {
  const slots = getSuperAdminSlots();
  
  if (slots.remaining <= 0) {
    return {
      success: false,
      message: '❌ All 100 Super Admin slots have been sold out!',
      slotsRemaining: 0
    };
  }

  // Check if user already purchased
  const alreadyPurchased = slots.purchased?.some(
    slot => slot.email === userEmail || slot.userId === userId
  );

  if (alreadyPurchased) {
    return {
      success: false,
      message: '✅ You already have Super Admin access!',
      slotsRemaining: slots.remaining
    };
  }

  // Add new purchase
  const newPurchase = {
    email: userEmail,
    userId: userId,
    purchaseDate: new Date().toISOString(),
    paymentDetails: paymentDetails,
    slotNumber: (slots.purchased?.length || 0) + 1
  };

  const updatedSlots = {
    purchased: [...(slots.purchased || []), newPurchase],
    lastUpdated: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSlots));

  return {
    success: true,
    message: `🎉 Super Admin slot #${newPurchase.slotNumber} purchased!`,
    slotsRemaining: SUPER_ADMIN_SLOT_LIMIT - updatedSlots.purchased.length,
    slotNumber: newPurchase.slotNumber
  };
}

/**
 * Check if user has super admin access
 */
export function hasSuperAdminAccess(userEmail, userId) {
  const slots = getSuperAdminSlots();
  
  return slots.purchased?.some(
    slot => slot.email === userEmail || slot.userId === userId
  ) || false;
}

/**
 * Get slot info for current user
 */
export function getUserSlotInfo(userEmail, userId) {
  const slots = getSuperAdminSlots();
  
  const userSlot = slots.purchased?.find(
    slot => slot.email === userEmail || slot.userId === userId
  );

  return userSlot || null;
}

export default {
  getSuperAdminSlots,
  purchaseSuperAdminSlot,
  hasSuperAdminAccess,
  getUserSlotInfo,
  SUPER_ADMIN_SLOT_LIMIT
};
