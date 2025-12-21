/* eslint-disable */
// Content Moderation & Legal Protection System

export const LEGAL_PROTECTIONS = {
  // Trademarked brands that cannot be used
  BLOCKED_TRADEMARKS: [
    // Trading Card Games
    'pokemon', 'pokémon', 'pikachu', 'nintendo', 'game freak',
    'yu-gi-oh', 'yugioh', 'konami',
    'magic the gathering', 'mtg', 'wizards of the coast', 'hasbro',
    'final fantasy', 'square enix',
    'digimon', 'bandai',
    'cardfight vanguard', 'bushiroad',

    // Anime/Manga Properties
    'naruto', 'shueisha', 'viz media',
    'dragon ball', 'dragonball', 'akira toriyama',
    'one piece', 'eiichiro oda',
    'bleach', 'tite kubo',
    'attack on titan', 'hajime isayama',
    'my hero academia', 'kohei horikoshi',
    'demon slayer', 'kimetsu no yaiba',
    'jujutsu kaisen', 'gege akutami',
    'sailor moon', 'naoko takeuchi',

    // Marvel/DC
    'marvel', 'spider-man', 'spiderman', 'iron man', 'avengers',
    'dc comics', 'superman', 'batman', 'wonder woman', 'justice league',

    // Disney
    'disney', 'mickey mouse', 'frozen', 'star wars', 'pixar',

    // Gaming
    'fortnite', 'epic games',
    'minecraft', 'mojang',
    'roblox',
    'league of legends', 'riot games',

    // Other Major IPs
    'harry potter', 'lord of the rings', 'game of thrones'
  ],

  // Content that requires age verification (18+)
  ADULT_CONTENT_FLAGS: [
    'nude', 'nudity', 'nsfw', 'explicit', '18+', 'adult only',
    'pornographic', 'hentai', 'ecchi', 'sex', 'pussy', 'cock',
    'gore', 'graphic violence', 'dismemberment', 'blood'
  ],

  // PROHIBITED CONTENT - Only truly illegal/harmful content
  PROHIBITED_CONTENT: [
    'child sexual', 'child porn', 'cp', 'pedo', 'loli', 'shota', 'minor sexual', // CSAM - ZERO TOLERANCE
    'terrorist', 'isis', 'al qaeda', 'bomb instructions', 'mass shooting plan', // Terrorism
    'counterfeit', 'fake id', 'stolen credit card', 'fraud', // Fraud
    'nigger', 'kike', 'faggot targeting' // Extreme racial/homophobic slurs (targeted harassment)
  ],

  // EXPLICITLY ALLOWED (with 18+ age gate)
  ALLOWED_ADULT_CONTENT: [
    'gore', 'violence', 'blood', 'dismemberment', 'graphic horror', // Horror/violence ALLOWED
    'fuck', 'shit', 'ass', 'bitch', 'damn', // Profanity ALLOWED
    'bdsm', 'fetish', 'kink', 'furry nsfw', 'monster girls' // Kink content ALLOWED
  ]
};

export function checkContentLegality(text, cardData = null) {
  const issues = [];
  const textLower = text.toLowerCase();

  // Check for trademarked content
  for (const trademark of LEGAL_PROTECTIONS.BLOCKED_TRADEMARKS) {
    if (textLower.includes(trademark)) {
      issues.push({
        type: 'trademark',
        severity: 'HIGH',
        message: `Contains trademarked content: "${trademark}". This violates copyright law.`,
        blocked: true
      });
    }
  }

  // Check for prohibited content (ONLY illegal/harmful content)
  for (const term of LEGAL_PROTECTIONS.PROHIBITED_CONTENT) {
    if (textLower.includes(term)) {
      issues.push({
        type: 'prohibited',
        severity: 'CRITICAL',
        message: `Contains prohibited content: "${term}". This is illegal and violates our Terms of Service.`,
        blocked: true
      });
    }
  }

  // Check for adult content (requires age gate, but NOT blocked)
  let hasAdultContent = false;
  for (const term of LEGAL_PROTECTIONS.ADULT_CONTENT_FLAGS) {
    if (textLower.includes(term)) {
      hasAdultContent = true;
      break;
    }
  }
  
  // ANTI-PIRACY: Block common piracy file patterns
  const piracyPatterns = [
    /S\d{2}E\d{2}/i, // Season/Episode format
    /\[.*subs.*\]/i, // Fansub groups
    /\d{3,4}p/i, // Resolution
    /x26[45]/i, // Video codec
    /complete series/i
  ];
  
  for (const pattern of piracyPatterns) {
    if (pattern.test(text)) {
      issues.push({
        type: 'piracy_indicator',
        severity: 'HIGH',
        message: 'Content appears to be pirated material. Only upload original content.',
        blocked: true
      });
    }
  }

  if (hasAdultContent) {
    issues.push({
      type: 'adult',
      severity: 'INFO',
      message: `Contains adult content. This is ALLOWED but requires 18+ age verification.`,
      requiresAgeVerification: true,
      blocked: false // NOT blocked, just needs age gate
    });
  }

  // Check for suspicious quantities (anti-counterfeit)
  if (cardData && cardData.quantity > 500) {
    issues.push({
      type: 'quantity',
      severity: 'MEDIUM',
      message: `Large quantity order (${cardData.quantity} cards) flagged for manual review.`,
      requiresReview: true
    });
  }

  return {
    isLegal: !issues.some(i => i.blocked),
    issues,
    requiresReview: issues.some(i => i.requiresReview),
    requiresAgeVerification: issues.some(i => i.requiresAgeVerification)
  };
}

export function generateLegalDisclaimer() {
  return {
    title: 'Content Policy & Legal Requirements',
    sections: [
      {
        title: '🚫 Prohibited Content',
        points: [
          'NO copyrighted characters or trademarks from existing franchises',
          'NO counterfeit cards resembling real TCG products',
          'NO hate speech, illegal content, or prohibited materials',
          'NO adult content without age verification'
        ]
      },
      {
        title: '⚖️ Your Responsibilities',
        points: [
          'You certify all content is 100% original or properly licensed',
          'You agree to indemnify ForTheWeebs against copyright claims',
          'You understand violating this policy may result in account termination',
          'You accept liability for any legal consequences of your content'
        ]
      },
      {
        title: '🛡️ Our Protections',
        points: [
          'AI scanning detects copyrighted materials',
          'Manual review for suspicious orders',
          'DMCA takedown process for violations',
          'We report counterfeiting attempts to authorities'
        ]
      }
    ]
  };
}

// DMCA Counter-Notice Handler
export function handleDMCANotice(contentId, reporterInfo, claimDetails) {
  return {
    status: 'CONTENT_REMOVED',
    message: 'Content has been removed pending investigation.',
    appeal_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    next_steps: [
      'Content creator will be notified',
      'Creator may submit counter-notice with evidence of ownership',
      'If no counter-notice in 14 days, removal is permanent',
      'False DMCA claims are prosecutable'
    ]
  };
}

// User verification requirements for high-risk content
export function getUserVerificationRequirements(contentType, quantity) {
  const requirements = {
    email_verified: true,
    payment_method_verified: false,
    identity_verified: false,
    waiting_period_days: 0
  };

  // High quantity = more verification
  if (quantity > 100) {
    requirements.payment_method_verified = true;
    requirements.waiting_period_days = 3;
  }

  if (quantity > 1000) {
    requirements.identity_verified = true;
    requirements.waiting_period_days = 7;
  }

  return requirements;
}
