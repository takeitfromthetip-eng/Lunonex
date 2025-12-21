/* eslint-disable */
/**
 * Amazon Print-on-Demand Integration
 * Connects ForTheWeebs print shop to Amazon KDP, Merch by Amazon, and Amazon Handmade
 *
 * Services:
 * 1. Amazon KDP (Kindle Direct Publishing) - Books, Comics, Manga
 * 2. Merch by Amazon - T-shirts, Hoodies, etc.
 * 3. Amazon Handmade - Art prints, Trading cards
 * 4. Printful (via Amazon) - Everything else
 */

const KDP_API_ENDPOINT = 'https://kdp.amazon.com/api/v1';
const MERCH_API_ENDPOINT = 'https://merch.amazon.com/api/v1';
const PRINTFUL_API_ENDPOINT = 'https://api.printful.com';

const AMAZON_ACCESS_KEY = process.env.VITE_AMAZON_ACCESS_KEY;
const AMAZON_SECRET_KEY = process.env.VITE_AMAZON_SECRET_KEY;
const PRINTFUL_API_KEY = process.env.VITE_PRINTFUL_API_KEY;

/**
 * Setup instructions for Amazon integration
 */
export const AMAZON_SETUP_INSTRUCTIONS = {
  kdp: {
    name: 'Amazon KDP (Books/Comics/Manga)',
    signupUrl: 'https://kdp.amazon.com',
    steps: [
      '1. Go to https://kdp.amazon.com and sign up',
      '2. Complete tax information (W-9 or W-8)',
      '3. Set up direct deposit for payments',
      '4. Get API credentials from Account Settings',
      '5. Add credentials to ForTheWeebs settings',
    ],
    products: ['Comic Books', 'Manga', 'Art Books', 'Graphic Novels', 'Novels', 'Coloring Books'],
    revenue: '60-70% royalty on sales',
    fulfillment: 'Amazon handles printing, shipping, returns',
  },

  merch: {
    name: 'Merch by Amazon (Apparel)',
    signupUrl: 'https://merch.amazon.com',
    steps: [
      '1. Apply at https://merch.amazon.com (invitation required)',
      '2. Wait for approval (can take 1-6 months)',
      '3. Once approved, complete account setup',
      '4. Get API access from developer portal',
      '5. Add credentials to ForTheWeebs settings',
    ],
    products: ['T-Shirts', 'Hoodies', 'Tank Tops', 'Phone Cases', 'PopSockets'],
    revenue: '$2-$8 per item sold',
    fulfillment: 'Amazon handles everything',
    note: 'Application required - not instant approval',
  },

  handmade: {
    name: 'Amazon Handmade (Art/Crafts)',
    signupUrl: 'https://sell.amazon.com/programs/handmade',
    steps: [
      '1. Apply at https://sell.amazon.com/programs/handmade',
      '2. Submit portfolio/examples of work',
      '3. Wait for artisan verification',
      '4. Once approved, set up shop',
      '5. Connect to ForTheWeebs via API',
    ],
    products: ['Art Prints', 'Posters', 'Trading Cards', 'Stickers', 'Custom Items'],
    revenue: '85% after referral fee',
    fulfillment: 'You ship or use FBA',
  },

  printful: {
    name: 'Printful (via Amazon)',
    signupUrl: 'https://www.printful.com',
    steps: [
      '1. Sign up at https://www.printful.com',
      '2. Connect your Amazon seller account',
      '3. Get Printful API key from dashboard',
      '4. Add API key to ForTheWeebs settings',
      '5. Printful auto-fulfills Amazon orders',
    ],
    products: ['Everything KDP/Merch cant handle'],
    revenue: 'You set price - Printful charges cost',
    fulfillment: 'Printful handles printing & shipping',
    recommended: true,
  },
};

/**
 * Publish book/comic to Amazon KDP
 * @param {Object} product - Product details
 * @param {File} pdfFile - Print-ready PDF
 * @param {File} coverFile - Cover image
 * @returns {Promise<Object>} Publication result
 */
export async function publishToKDP(product, pdfFile, coverFile) {
  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY) {
    return {
      success: false,
      error: 'Amazon KDP not configured',
      setupUrl: AMAZON_SETUP_INSTRUCTIONS.kdp.signupUrl,
    };
  }

  try {
    console.log(`📚 Publishing "${product.title}" to Amazon KDP...`);

    // Upload manuscript (interior PDF)
    const manuscriptUpload = await uploadToKDP(pdfFile, 'manuscript');

    // Upload cover
    const coverUpload = await uploadToKDP(coverFile, 'cover');

    // Create book listing
    const listing = {
      title: product.title,
      author: product.author || 'Anonymous',
      description: product.description,
      categories: product.categories || ['Comics & Graphic Novels'],
      keywords: product.keywords || [],
      language: 'English',
      publicationDate: new Date().toISOString(),
      isbn: product.isbn || null, // Optional
      manuscriptId: manuscriptUpload.id,
      coverId: coverUpload.id,
      pricing: {
        usd: product.price || 9.99,
        royaltyOption: '70', // 70% or 35%
      },
      distribution: {
        territories: ['US', 'UK', 'CA', 'AU'], // Expand as needed
        amazonChannels: true,
        expandedDistribution: true, // Libraries, bookstores
      },
    };

    // Submit to KDP
    const response = await fetch(`${KDP_API_ENDPOINT}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAmazonAuthToken()}`,
      },
      body: JSON.stringify(listing),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        bookId: result.id,
        asin: result.asin, // Amazon product ID
        url: `https://amazon.com/dp/${result.asin}`,
        status: 'In Review', // Takes 24-72 hours
        message: 'Book submitted to Amazon KDP for review',
      };
    }

    throw new Error(result.message || 'KDP publication failed');

  } catch (error) {
    console.error('KDP error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Publish merch to Merch by Amazon
 * @param {Object} product - Product details
 * @param {File} designFile - Design image (high-res PNG)
 * @returns {Promise<Object>} Publication result
 */
export async function publishToMerch(product, designFile) {
  if (!AMAZON_ACCESS_KEY) {
    return {
      success: false,
      error: 'Merch by Amazon not configured',
      setupUrl: AMAZON_SETUP_INSTRUCTIONS.merch.signupUrl,
      note: 'Requires application approval',
    };
  }

  try {
    console.log(`👕 Publishing "${product.title}" to Merch by Amazon...`);

    // Upload design
    const designUpload = await uploadToMerch(designFile);

    // Create merch listing
    const listing = {
      title: product.title,
      brand: product.brand || 'ForTheWeebs',
      description: product.description,
      bulletPoints: product.features || [],
      productType: product.type || 'StandardTee', // StandardTee, PremiumTee, Hoodie, etc.
      color: product.color || 'Black',
      designId: designUpload.id,
      fitType: product.fit || 'Men',
      price: product.price || 19.99,
    };

    const response = await fetch(`${MERCH_API_ENDPOINT}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAmazonAuthToken()}`,
      },
      body: JSON.stringify(listing),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        productId: result.id,
        asin: result.asin,
        url: `https://amazon.com/dp/${result.asin}`,
        status: 'Live',
        message: 'Product published to Merch by Amazon',
      };
    }

    throw new Error(result.message || 'Merch publication failed');

  } catch (error) {
    console.error('Merch error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Publish to Printful (easiest option - no approval needed)
 * @param {Object} product - Product details
 * @param {File} designFile - Design file
 * @returns {Promise<Object>} Publication result
 */
export async function publishToPrintful(product, designFile) {
  if (!PRINTFUL_API_KEY) {
    return {
      success: false,
      error: 'Printful not configured',
      setupUrl: AMAZON_SETUP_INSTRUCTIONS.printful.signupUrl,
      note: 'Easiest option - instant approval!',
    };
  }

  try {
    console.log(`🖨️ Publishing "${product.title}" to Printful...`);

    // Upload design to Printful
    const uploadResponse = await fetch(`${PRINTFUL_API_ENDPOINT}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      },
      body: await createPrintfulFormData(designFile),
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData.error?.message || 'Upload failed');
    }

    // Create product on Printful
    const productData = {
      sync_product: {
        name: product.title,
        thumbnail: uploadData.result.id,
      },
      sync_variants: [{
        retail_price: product.price,
        variant_id: getPrintfulVariantId(product.type), // Product type
        files: [{
          id: uploadData.result.id,
        }],
      }],
    };

    const response = await fetch(`${PRINTFUL_API_ENDPOINT}/store/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      },
      body: JSON.stringify(productData),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        productId: result.result.id,
        url: result.result.external_url,
        status: 'Live',
        message: 'Product published to Printful',
      };
    }

    throw new Error(result.error?.message || 'Printful publication failed');

  } catch (error) {
    console.error('Printful error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get Amazon auth token
 */
async function getAmazonAuthToken() {
  // In production: Implement OAuth2 token exchange
  // For now, return access key
  return AMAZON_ACCESS_KEY;
}

/**
 * Upload file to KDP
 */
async function uploadToKDP(file, type) {
  // Simplified - in production use AWS S3 upload
  return {
    id: `kdp_${type}_${Date.now()}`,
    url: 'https://s3.amazonaws.com/kdp-uploads/...',
  };
}

/**
 * Upload file to Merch
 */
async function uploadToMerch(file) {
  // Simplified - in production use proper upload flow
  return {
    id: `merch_${Date.now()}`,
    url: 'https://s3.amazonaws.com/merch-uploads/...',
  };
}

/**
 * Create FormData for Printful upload
 */
async function createPrintfulFormData(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'default');
  return formData;
}

/**
 * Get Printful variant ID for product type
 */
function getPrintfulVariantId(productType) {
  const variants = {
    'tshirt': 4017, // Bella Canvas 3001
    'poster': 1, // Enhanced Matte Poster
    'canvas': 27, // Canvas 8x10
    'sticker': 530, // Kiss Cut Stickers
  };

  return variants[productType.toLowerCase()] || 4017;
}

/**
 * Check setup status
 */
export function getSetupStatus() {
  return {
    kdp: {
      configured: !!(AMAZON_ACCESS_KEY && AMAZON_SECRET_KEY),
      ready: !!(AMAZON_ACCESS_KEY && AMAZON_SECRET_KEY),
    },
    merch: {
      configured: !!AMAZON_ACCESS_KEY,
      ready: !!AMAZON_ACCESS_KEY,
      requiresApproval: true,
    },
    printful: {
      configured: !!PRINTFUL_API_KEY,
      ready: !!PRINTFUL_API_KEY,
      recommended: true,
    },
  };
}

export default {
  publishToKDP,
  publishToMerch,
  publishToPrintful,
  getSetupStatus,
  AMAZON_SETUP_INSTRUCTIONS,
};
