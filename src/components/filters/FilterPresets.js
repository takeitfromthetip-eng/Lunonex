/**
 * FilterPresets - Better than Instagram, Snapchat, and Facebook combined
 * 
 * This is our "fuck you" to the big platforms.
 * - More filters than Instagram
 * - More unique than Snapchat
 * - Actually useful unlike Facebook's trash
 */

export const FILTER_LIBRARY = {
  // FREE TIER - Available to everyone (better than Instagram's free filters)
  free: {
    vintage: {
      name: 'Vintage',
      description: 'Old-school film look',
      icon: '📷',
      tier: 'FREE',
      category: 'Classic'
    },
    blackwhite: {
      name: 'Black & White',
      description: 'Timeless monochrome',
      icon: '⚫',
      tier: 'FREE',
      category: 'Classic'
    },
    sepia: {
      name: 'Sepia',
      description: 'Nostalgic brown tone',
      icon: '🟫',
      tier: 'FREE',
      category: 'Classic'
    },
    bright: {
      name: 'Bright',
      description: 'Boost brightness',
      icon: '☀️',
      tier: 'FREE',
      category: 'Basic Adjustments'
    },
    contrast: {
      name: 'Contrast',
      description: 'Pop your colors',
      icon: '⚡',
      tier: 'FREE',
      category: 'Basic Adjustments'
    }
  },

  // BASIC TIER ($50) - More than Instagram Pro
  basic: {
    cool: {
      name: 'Cool',
      description: 'Blue-tinted chill vibes',
      icon: '❄️',
      tier: 'BASIC',
      category: 'Temperature'
    },
    warm: {
      name: 'Warm',
      description: 'Sunset orange glow',
      icon: '🔥',
      tier: 'BASIC',
      category: 'Temperature'
    },
    dreamy: {
      name: 'Dreamy',
      description: 'Soft ethereal glow',
      icon: '☁️',
      tier: 'BASIC',
      category: 'Artistic'
    },
    crisp: {
      name: 'Crisp',
      description: 'Sharp and clear',
      icon: '💎',
      tier: 'BASIC',
      category: 'Enhancement'
    },
    pastel: {
      name: 'Pastel',
      description: 'Soft candy colors',
      icon: '🍬',
      tier: 'BASIC',
      category: 'Artistic'
    }
  },

  // PRO TIER ($1000) - Filters you can't find anywhere else
  pro: {
    neon: {
      name: 'Neon',
      description: 'Electric cyberpunk glow',
      icon: '💜',
      tier: 'PRO',
      category: 'Futuristic'
    },
    cyberpunk: {
      name: 'Cyberpunk',
      description: 'High-tech dystopia',
      icon: '🤖',
      tier: 'PRO',
      category: 'Futuristic'
    },
    anime: {
      name: 'Anime',
      description: 'Cartoon posterize effect',
      icon: '🎌',
      tier: 'PRO',
      category: 'Anime/Manga'
    },
    glitch: {
      name: 'Glitch',
      description: 'Digital corruption art',
      icon: '📺',
      tier: 'PRO',
      category: 'Digital Art'
    },
    vaporwave: {
      name: 'Vaporwave',
      description: 'A E S T H E T I C vibes',
      icon: '🌴',
      tier: 'PRO',
      category: 'Retro Digital'
    },
    holographic: {
      name: 'Holographic',
      description: 'Rainbow iridescent',
      icon: '🌈',
      tier: 'PRO',
      category: 'Futuristic'
    },
    manga: {
      name: 'Manga',
      description: 'Black & white manga style',
      icon: '📖',
      tier: 'PRO',
      category: 'Anime/Manga'
    },
    lofi: {
      name: 'Lo-Fi',
      description: 'Chill study vibes',
      icon: '🎧',
      tier: 'PRO',
      category: 'Retro Digital'
    }
  },

  // AR CAMERA FILTERS (Pro tier only) - Snapchat who?
  ar: {
    catEars: {
      name: 'Cat Ears',
      description: 'Cute anime cat ears',
      icon: '🐱',
      tier: 'PRO',
      category: 'AR Overlays',
      requiresFaceTracking: true
    },
    glasses: {
      name: 'Cool Glasses',
      description: 'Anime sunglasses',
      icon: '😎',
      tier: 'PRO',
      category: 'AR Overlays',
      requiresFaceTracking: true
    },
    sparkles: {
      name: 'Sparkles',
      description: 'Magical sparkle effect',
      icon: '✨',
      tier: 'PRO',
      category: 'AR Effects',
      requiresFaceTracking: true
    },
    hearts: {
      name: 'Floating Hearts',
      description: 'Kawaii hearts around you',
      icon: '💕',
      tier: 'PRO',
      category: 'AR Effects',
      requiresFaceTracking: true
    },
    devil: {
      name: 'Devil Horns',
      description: 'Devilish horns and tail',
      icon: '😈',
      tier: 'PRO',
      category: 'AR Overlays',
      requiresFaceTracking: true
    },
    angel: {
      name: 'Angel Halo',
      description: 'Angelic halo and wings',
      icon: '😇',
      tier: 'PRO',
      category: 'AR Overlays',
      requiresFaceTracking: true
    },
    cyborg: {
      name: 'Cyborg',
      description: 'Cybernetic enhancements',
      icon: '🦾',
      tier: 'PRO',
      category: 'AR Overlays',
      requiresFaceTracking: true
    },
    vtuber: {
      name: 'VTuber Avatar',
      description: 'Full VTuber face tracking',
      icon: '🎭',
      tier: 'PRO',
      category: 'AR Avatars',
      requiresFaceTracking: true
    }
  }
};

// Get filters by tier
export function getFiltersByTier(tier) {
  const allFilters = [];

  // Everyone gets free filters
  allFilters.push(...Object.entries(FILTER_LIBRARY.free));

  // Basic tier and up get basic filters
  if (['BASIC', 'CREATOR', 'PRO', 'PRO_VIP', 'OWNER'].includes(tier)) {
    allFilters.push(...Object.entries(FILTER_LIBRARY.basic));
  }

  // Pro tier gets everything including AR
  if (['PRO', 'PRO_VIP', 'OWNER'].includes(tier)) {
    allFilters.push(...Object.entries(FILTER_LIBRARY.pro));
    allFilters.push(...Object.entries(FILTER_LIBRARY.ar));
  }

  return allFilters.map(([key, value]) => ({
    id: key,
    ...value
  }));
}

// Get filters by category
export function getFiltersByCategory(tier, category) {
  const filters = getFiltersByTier(tier);
  return filters.filter(f => f.category === category);
}

// Get all available categories for user's tier
export function getAvailableCategories(tier) {
  const filters = getFiltersByTier(tier);
  const categories = [...new Set(filters.map(f => f.category))];
  return categories;
}

// Check if user can use a specific filter
export function canUseFilter(tier, filterId) {
  const filters = getFiltersByTier(tier);
  return filters.some(f => f.id === filterId);
}

// Get upgrade message for locked filters
export function getUpgradeMessage(currentTier, filterId) {
  const allFilters = [
    ...Object.entries(FILTER_LIBRARY.free),
    ...Object.entries(FILTER_LIBRARY.basic),
    ...Object.entries(FILTER_LIBRARY.pro),
    ...Object.entries(FILTER_LIBRARY.ar)
  ];

  const filter = allFilters.find(([key]) => key === filterId);
  if (!filter) return null;

  const [, filterData] = filter;
  const requiredTier = filterData.tier;

  if (currentTier === 'FREE' && requiredTier === 'BASIC') {
    return '💎 Upgrade to BASIC ($50) to unlock this filter';
  }

  if (['FREE', 'BASIC'].includes(currentTier) && requiredTier === 'PRO') {
    return '🚀 Upgrade to PRO ($1000) to unlock this filter + AR camera effects';
  }

  return null;
}

export default FILTER_LIBRARY;
