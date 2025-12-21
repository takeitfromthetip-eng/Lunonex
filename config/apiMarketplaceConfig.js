/**
 * FORTHEWEEBS API MARKETPLACE - FEATURE ACCESS CONFIGURATION
 * 
 * Defines which features are available via API and which are LOCKED FOREVER.
 * Crown jewels protected. Your special sauce stays yours. 👑
 */

module.exports = {
  // ============================================================================
  // 🔒 PLATFORM-ONLY FEATURES (NEVER available via API)
  // ============================================================================
  platformExclusive: [
    'mico-ai',                    // Mico AI Assistant - YOUR proprietary chatbot
    'music-from-hum',             // Hum-to-Song - WORLD FIRST
    'comic-panel-generator',      // Comic panels - NO COMPETITOR HAS THIS
    'time-machine',               // Version control system
    'collaboration-ghosts',       // Multiplayer editing
    'gratitude-logger',           // Artifact tracking
    'template-marketplace',       // Template store
    'merchandise-store',          // Merch integration
    'creator-analytics',          // Analytics dashboard
    'social-feed',                // Social features
    'social-posts',
    'social-comments',
    'social-messages',
    'social-notifications',
    'fan-rewards',                // Loyalty program
    'community-moderation',       // Moderation tools
    'copyright-requests',         // Copyright system
    'ai-auto-review'              // AI copyright validation
  ],

  // ============================================================================
  // ✅ API-ACCESSIBLE FEATURES (60-70% of features)
  // ============================================================================
  
  // Free Tier (Hook to get devs started)
  freeTierFeatures: [
    'background-removal',
    'photo-enhancer',
    'image-search',
    'video-clipper',
    'thumbnail-generator'
  ],

  // Hobby Tier ($29/mo - Indie developers)
  hobbyTierFeatures: [
    // Photo Tools (5)
    'background-removal',
    'photo-enhancer',
    'image-search',
    
    // Video Tools (3)
    'video-upscale',
    'video-clipper',
    'color-grading',
    
    // Productivity (3)
    'thumbnail-generator',
    'subtitle-emoji',
    'script-writer',
    
    // Audio (1)
    'voice-isolation',
    
    // Marketing (4)
    'screen-recorder',
    'ad-generator',
    'social-scheduler',
    'meme-generator',
    
    // Web/SaaS (2)
    'product-photography',
    'website-builder',
    'seo-optimizer'
  ],

  // Pro Tier ($149/mo - Serious businesses)
  proTierFeatures: [
    // All Hobby features, plus:
    ...['background-removal', 'photo-enhancer', 'image-search', 'video-upscale', 'video-clipper', 
        'color-grading', 'thumbnail-generator', 'subtitle-emoji', 'script-writer', 'voice-isolation',
        'screen-recorder', 'ad-generator', 'social-scheduler', 'meme-generator', 'product-photography',
        'website-builder', 'seo-optimizer'],
    
    // Additional Pro features
    'video-effects',
    'voice-cloning',
    'podcast-studio',
    'live-streaming',
    'meeting-summarizer',
    'cloud-storage',
    'email-marketing',
    'form-builder',
    'deepfake-detector'
  ],

  // Enterprise Tier ($999/mo - The whales)
  enterpriseTierFeatures: [
    // All Pro features, plus:
    ...['background-removal', 'photo-enhancer', 'image-search', 'video-upscale', 'video-clipper', 
        'video-effects', 'live-streaming', 'color-grading', 'thumbnail-generator', 'voice-cloning',
        'voice-isolation', 'podcast-studio', 'screen-recorder', 'motion-capture', 'avatar',
        'subtitle-emoji', 'script-writer', 'meeting-summarizer', 'ad-generator', 'social-scheduler',
        'meme-generator', 'product-photography', 'website-builder', 'cloud-storage', 'email-marketing',
        'form-builder', 'seo-optimizer', 'deepfake-detector'],
    
    // Enterprise exclusive
    'motion-capture',
    'avatar',
    'generative-fill',
    'object-removal',
    'image-extension',
    'psd-support',
    'vr-ar-production'
  ],

  // ============================================================================
  // 💰 PRICING CONFIGURATION (Per-request costs)
  // ============================================================================
  pricing: {
    // Photo Tools
    'background-removal': { cost: 0.002, price: 0.05 },      // We pay $0.002, charge $0.05 (2400% profit!)
    'photo-enhancer': { cost: 0.003, price: 0.06 },
    'image-search': { cost: 0.001, price: 0.02 },
    
    // Video Tools
    'video-upscale': { cost: 0.05, price: 0.25 },            // Expensive but high margin
    'video-clipper': { cost: 0.01, price: 0.10 },
    'video-effects': { cost: 0.02, price: 0.15 },
    'color-grading': { cost: 0.005, price: 0.08 },
    'live-streaming': { cost: 0.10, price: 0.50 },
    
    // Audio Tools
    'voice-cloning': { cost: 0.02, price: 0.15 },
    'voice-isolation': { cost: 0.01, price: 0.08 },
    'podcast-studio': { cost: 0.03, price: 0.20 },
    
    // AI Features
    'subtitle-emoji': { cost: 0.01, price: 0.10 },
    'script-writer': { cost: 0.005, price: 0.05 },
    'thumbnail-generator': { cost: 0.01, price: 0.08 },
    'ad-generator': { cost: 0.01, price: 0.12 },
    'deepfake-detector': { cost: 0.015, price: 0.10 },
    
    // Productivity
    'screen-recorder': { cost: 0.02, price: 0.15 },
    'meeting-summarizer': { cost: 0.01, price: 0.10 },
    
    // Marketing
    'social-scheduler': { cost: 0.001, price: 0.03 },
    'meme-generator': { cost: 0.005, price: 0.05 },
    'product-photography': { cost: 0.02, price: 0.15 },
    
    // Web/SaaS
    'website-builder': { cost: 0.01, price: 0.10 },
    'cloud-storage': { cost: 0.005, price: 0.05 },
    'email-marketing': { cost: 0.002, price: 0.04 },
    'form-builder': { cost: 0.001, price: 0.02 },
    'seo-optimizer': { cost: 0.01, price: 0.08 },
    
    // Advanced
    'motion-capture': { cost: 0.05, price: 0.30 },
    'avatar': { cost: 0.03, price: 0.20 },
    'generative-fill': { cost: 0.02, price: 0.15 },
    'object-removal': { cost: 0.01, price: 0.10 },
    'image-extension': { cost: 0.015, price: 0.12 },
    'psd-support': { cost: 0.005, price: 0.05 },
    'vr-ar-production': { cost: 0.08, price: 0.50 }
  },

  // ============================================================================
  // 📊 FEATURE CATEGORIES (For docs organization)
  // ============================================================================
  categories: {
    photo: [
      'background-removal',
      'photo-enhancer',
      'image-search',
      'generative-fill',
      'object-removal',
      'image-extension'
    ],
    video: [
      'video-upscale',
      'video-clipper',
      'video-effects',
      'color-grading',
      'live-streaming'
    ],
    audio: [
      'voice-cloning',
      'voice-isolation',
      'podcast-studio'
    ],
    ai: [
      'subtitle-emoji',
      'script-writer',
      'thumbnail-generator',
      'ad-generator',
      'deepfake-detector',
      'meeting-summarizer'
    ],
    productivity: [
      'screen-recorder',
      'cloud-storage',
      'form-builder'
    ],
    marketing: [
      'social-scheduler',
      'meme-generator',
      'product-photography',
      'email-marketing',
      'seo-optimizer',
      'website-builder'
    ],
    advanced: [
      'motion-capture',
      'avatar',
      'psd-support',
      'vr-ar-production'
    ]
  },

  // ============================================================================
  // 🚦 RATE LIMITS (Per feature, overrides plan limits if stricter)
  // ============================================================================
  rateLimits: {
    // Expensive operations get stricter limits
    'video-upscale': { perMinute: 2, perHour: 20 },
    'live-streaming': { perMinute: 1, perHour: 10 },
    'voice-cloning': { perMinute: 5, perHour: 50 },
    'vr-ar-production': { perMinute: 1, perHour: 5 },
    
    // Standard operations
    'background-removal': { perMinute: 20, perHour: 500 },
    'photo-enhancer': { perMinute: 20, perHour: 500 },
    'thumbnail-generator': { perMinute: 30, perHour: 1000 }
  },

  // ============================================================================
  // 📝 DOCUMENTATION EXAMPLES (For auto-generated docs)
  // ============================================================================
  exampleRequests: {
    'background-removal': {
      curl: `curl -X POST https://api.fortheweebs.com/v1/background-remove \\
  -H "Authorization: Bearer ftw_live_your_key_here" \\
  -F "image=@photo.jpg"`,
      
      javascript: `const response = await fetch('https://api.fortheweebs.com/v1/background-remove', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ftw_live_your_key_here' },
  body: formData
});
const data = await response.json();`,
      
      python: `import requests
response = requests.post(
    'https://api.fortheweebs.com/v1/background-remove',
    headers={'Authorization': 'Bearer ftw_live_your_key_here'},
    files={'image': open('photo.jpg', 'rb')}
)
data = response.json()`
    }
  }
};
