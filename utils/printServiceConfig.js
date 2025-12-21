/**
 * Print Service Integrations
 * Multi-provider routing for different product types
 */

// Revenue splits (fair for all parties)
const REVENUE_SPLITS = {
  // Apparel & Home Goods (Printful)
  apparel: {
    platformFee: 0.10,      // 10% to ForTheWeebs (covers hosting, payment processing, support)
    creatorProfit: 0.90,    // 90% to creator after print costs
    // Example: $30 shirt - $10 print cost = $20 profit → Creator: $18, Platform: $2
  },
  
  // Comic Books (Mixam)
  comics: {
    platformFee: 0.15,      // 15% to ForTheWeebs (higher for complex fulfillment)
    creatorProfit: 0.85,    // 85% to creator after print costs
    // Example: $10 comic - $4 print cost = $6 profit → Creator: $5.10, Platform: $0.90
  },
  
  // Trading Cards (DriveThruCards)
  cards: {
    platformFee: 0.12,      // 12% to ForTheWeebs
    creatorProfit: 0.88,    // 88% to creator after print costs
    // Example: $25 deck - $10 print cost = $15 profit → Creator: $13.20, Platform: $1.80
  }
};

/**
 * Calculate pricing breakdown
 */
function calculatePricing(productType, salePrice, printCost) {
  const split = REVENUE_SPLITS[productType];
  const profit = salePrice - printCost;
  const platformFee = profit * split.platformFee;
  const creatorEarnings = profit * split.creatorProfit;
  
  return {
    salePrice: salePrice.toFixed(2),
    printCost: printCost.toFixed(2),
    totalProfit: profit.toFixed(2),
    platformFee: platformFee.toFixed(2),
    creatorEarnings: creatorEarnings.toFixed(2),
    platformFeePct: (split.platformFee * 100).toFixed(0) + '%',
    creatorProfitPct: (split.creatorProfit * 100).toFixed(0) + '%'
  };
}

/**
 * Print Service Providers
 */
const PRINT_SERVICES = {
  printful: {
    name: 'Printful',
    apiUrl: 'https://api.printful.com',
    products: ['tshirt', 'hoodie', 'mug', 'poster', 'sticker', 'phonecase', 'tote', 'pillow', 'mousepad', 'blanket'],
    setupUrl: 'https://www.printful.com/dashboard/register',
    apiDocsUrl: 'https://developers.printful.com/docs/',
    features: [
      'No monthly fees',
      '250+ products',
      'Automatic fulfillment',
      'Global shipping (7 facilities)',
      'Mockup generator',
      'Quality control',
      'Branding options'
    ],
    pricing: {
      tshirt: { base: 9.95, suggested: 29.99 },
      hoodie: { base: 22.95, suggested: 49.99 },
      mug: { base: 7.95, suggested: 16.99 },
      poster: { base: 6.50, suggested: 19.99 }
    }
  },
  
  mixam: {
    name: 'Mixam',
    apiUrl: 'https://api.mixam.com/v1',
    products: ['comic', 'manga', 'graphicnovel', 'zine', 'artbook'],
    setupUrl: 'https://www.mixam.com/signup',
    apiDocsUrl: 'https://api.mixam.com/docs',
    features: [
      'No minimums (print 1 comic!)',
      'On-demand fulfillment',
      'Saddle stitch & perfect binding',
      'Glossy or matte covers',
      'Professional quality',
      'Fast turnaround (3-5 days)',
      'API integration'
    ],
    pricing: {
      comic_24pg: { base: 4.50, suggested: 12.99 },    // 24-page comic
      comic_32pg: { base: 5.50, suggested: 14.99 },    // 32-page comic
      manga_100pg: { base: 8.50, suggested: 19.99 },   // 100-page manga
      artbook_64pg: { base: 12.00, suggested: 29.99 }  // 64-page artbook
    }
  },
  
  drivethrucards: {
    name: 'DriveThruCards',
    apiUrl: 'https://www.drivethrucards.com/api/v1',
    products: ['tradingcards', 'gamedeck', 'customdeck', 'tarotdeck'],
    setupUrl: 'https://www.drivethrucards.com/pub_signup.php',
    apiDocsUrl: 'https://www.drivethrucards.com/api_help.php',
    features: [
      'Print-on-demand',
      'No minimums',
      'Built-in marketplace',
      'Professional card stock',
      'Multiple sizes & finishes',
      'Automated fulfillment',
      'Handles payment & shipping'
    ],
    pricing: {
      deck_18cards: { base: 6.99, suggested: 14.99 },   // 18-card mini deck
      deck_54cards: { base: 10.99, suggested: 24.99 },  // Standard 54-card deck
      deck_100cards: { base: 15.99, suggested: 34.99 }, // Large 100-card deck
      tarot_78cards: { base: 18.99, suggested: 39.99 }  // Tarot deck
    }
  }
};

/**
 * Route product to correct print service
 */
function routeToProvider(productType) {
  if (PRINT_SERVICES.printful.products.includes(productType)) {
    return 'printful';
  }
  if (PRINT_SERVICES.mixam.products.includes(productType)) {
    return 'mixam';
  }
  if (PRINT_SERVICES.drivethrucards.products.includes(productType)) {
    return 'drivethrucards';
  }
  return null;
}

module.exports = {
  REVENUE_SPLITS,
  PRINT_SERVICES,
  calculatePricing,
  routeToProvider
};
