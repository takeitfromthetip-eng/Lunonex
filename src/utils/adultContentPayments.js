/* eslint-disable */
/**
 * Adult Content Payment Processing
 *
 * Stripe PROHIBITS adult content - we need alternative processors:
 * - CCBill (industry standard for adult content)
 * - Segpay (backup option)
 * - Paxum (crypto-friendly)
 */

const PAYMENT_PROCESSORS = {
  ccbill: {
    name: 'CCBill',
    url: 'https://api.ccbill.com',
    fees: '10.5% + $0.30',
    best_for: 'Adult content subscriptions',
    signup: 'https://www.ccbill.com/apply',
    approval_time: '1-3 business days',
    required: ['Business registration', 'Government ID', 'Bank account']
  },
  segpay: {
    name: 'Segpay',
    url: 'https://api.segpay.com',
    fees: '10-15%',
    best_for: 'High-risk merchant accounts',
    signup: 'https://www.segpay.com/merchants/',
    approval_time: '3-5 business days',
    required: ['Business entity', 'Processing history', 'Bank details']
  },
  paxum: {
    name: 'Paxum',
    url: 'https://www.paxum.com',
    fees: '3-8%',
    best_for: 'Crypto + adult content',
    signup: 'https://www.paxum.com/payment_gateway/apply.php',
    approval_time: '1-2 business days',
    required: ['Government ID', 'Bank account']
  }
};

// Check if content is flagged as adult
export function isAdultContent(content) {
  const adultTags = [
    'nsfw', 'adult', 'mature', '18+', 'explicit',
    'hentai', 'ecchi', 'lewd', 'r18'
  ];

  const contentString = JSON.stringify(content).toLowerCase();
  return adultTags.some(tag => contentString.includes(tag));
}

// Route payment to correct processor
export async function processAdultPayment(paymentData) {
  const { amount, currency, userId, contentId, description } = paymentData;

  // Check if content is adult
  const isAdult = isAdultContent(paymentData);

  if (!isAdult) {
    // Use Stripe for non-adult content
    return await processStripePayment(paymentData);
  }

  // Use CCBill for adult content
  return await processCCBillPayment(paymentData);
}

// CCBill payment processing
async function processCCBillPayment(paymentData) {
  const ccbillConfig = {
    clientAccnum: process.env.VITE_CCBILL_ACCOUNT_NUMBER,
    clientSubacc: process.env.VITE_CCBILL_SUBACCOUNT,
    formName: process.env.VITE_CCBILL_FORM_NAME || 'adult_content_purchase'
  };

  // Generate CCBill payment URL
  const paymentUrl = buildCCBillUrl(paymentData, ccbillConfig);

  return {
    processor: 'ccbill',
    paymentUrl,
    status: 'pending',
    redirect: true
  };
}

// Build CCBill payment URL
function buildCCBillUrl(paymentData, config) {
  const params = new URLSearchParams({
    clientAccnum: config.clientAccnum,
    clientSubacc: config.clientSubacc,
    formName: config.formName,
    formPrice: paymentData.amount,
    formPeriod: '2', // 2 = one-time payment
    currencyCode: paymentData.currency === 'usd' ? '840' : '840',
    customer_fname: paymentData.userFirstName || '',
    customer_lname: paymentData.userLastName || '',
    email: paymentData.userEmail || '',
    // Custom fields
    user_id: paymentData.userId,
    content_id: paymentData.contentId,
    description: paymentData.description
  });

  return `https://bill.ccbill.com/jpost/signup.cgi?${params.toString()}`;
}

// Fallback to Stripe for non-adult
async function processStripePayment(paymentData) {
  const response = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });

  return await response.json();
}

// Verify CCBill webhook/callback
export async function verifyCCBillPayment(webhookData) {
  const {
    subscription_id,
    transaction_id,
    user_id,
    content_id,
    amount,
    timestamp,
    digest // MD5 hash for verification
  } = webhookData;

  // Verify digest (CCBill sends MD5 hash)
  const salt = process.env.CCBILL_SALT;
  const expectedDigest = calculateCCBillDigest(webhookData, salt);

  if (digest !== expectedDigest) {
    return { verified: false, error: 'Invalid digest' };
  }

  // Payment is verified - unlock content
  return {
    verified: true,
    transactionId: transaction_id,
    userId: user_id,
    contentId: content_id,
    amount: parseFloat(amount)
  };
}

// Calculate CCBill digest for verification
function calculateCCBillDigest(data, salt) {
  const crypto = require('crypto');
  const string = `${data.subscription_id}${data.timestamp}${salt}`;
  return crypto.createHash('md5').update(string).digest('hex');
}

// Get recommended processor based on content type
export function getRecommendedProcessor(content) {
  if (isAdultContent(content)) {
    return {
      processor: 'ccbill',
      info: PAYMENT_PROCESSORS.ccbill,
      reason: 'CCBill is the industry standard for adult content payments'
    };
  }

  return {
    processor: 'stripe',
    info: { name: 'Stripe', fees: '2.9% + $0.30' },
    reason: 'Stripe for standard content'
  };
}

// Setup instructions
export const ADULT_PAYMENT_SETUP = {
  step1: {
    title: 'Choose Payment Processor',
    action: 'Sign up for CCBill (recommended) or Segpay',
    url: 'https://www.ccbill.com/apply',
    note: 'CCBill is the industry standard - 95% approval rate'
  },
  step2: {
    title: 'Complete Application',
    required: [
      'Business name (LLC recommended but not required)',
      'Government-issued ID',
      'Bank account for payouts',
      'Website URL (fortheweebs.com)',
      'Business description: "Digital marketplace for anime/manga content"'
    ],
    timeline: '1-3 business days for approval'
  },
  step3: {
    title: 'Get API Credentials',
    instructions: [
      'Login to CCBill merchant portal',
      'Go to Account Info → Sub Account Admin',
      'Create new subaccount for "Adult Content"',
      'Get: Account Number, Subaccount Number, Salt/Secret',
      'Create payment form: "adult_content_purchase"'
    ]
  },
  step4: {
    title: 'Add to .env file',
    example: `
VITE_CCBILL_ACCOUNT_NUMBER=123456
VITE_CCBILL_SUBACCOUNT=0001
VITE_CCBILL_FORM_NAME=adult_content_purchase
CCBILL_SALT=your_salt_here
    `
  },
  step5: {
    title: 'Configure Webhooks',
    instructions: [
      'In CCBill portal: Account Info → Advanced → Webhooks',
      'Set webhook URL: https://fortheweebs.com/api/webhooks/ccbill',
      'Enable: Approval Post, Chargeback Post, Refund Post',
      'Save webhook secret to .env'
    ]
  },
  alternatives: {
    segpay: 'Higher fees (15%) but easier approval',
    paxum: 'Lower fees (3-8%) but requires crypto setup',
    note: 'CCBill recommended - most reliable for adult content'
  }
};

// Handle payout splits for adult content
export async function calculateAdultContentPayout(sale) {
  const { amount, creatorId, contentId, creatorTier = 'FREE' } = sale;

  // Use tier-based revenue split system
  const { calculateAdultContentSplit } = require('./revenueSplitSystem');
  const payout = calculateAdultContentSplit(amount, creatorTier);

  return {
    total: payout.total,
    processorFee: payout.processorFee,
    platformFee: payout.platformFee,
    creatorPayout: payout.creatorPayout,
    breakdown: payout.breakdown,
    creatorSplit: payout.creatorSplit
  };
}

/**
 * @deprecated Old fixed-split calculation
 */
export async function calculateAdultContentPayoutOld(sale) {
  const { amount, creatorId, contentId } = sale;

  // CCBill takes 10.5% + $0.30
  const processorFee = (amount * 0.105) + 0.30;

  // Platform takes 20% of remaining (OLD - now tier-based)
  const netAmount = amount - processorFee;
  const platformFee = netAmount * 0.20;

  // Creator gets 80% (OLD - now tier-based)
  const creatorPayout = netAmount - platformFee;

  return {
    total: amount,
    processorFee,
    platformFee,
    creatorPayout,
    breakdown: {
      ccbill: `${processorFee.toFixed(2)} (10.5% + $0.30)`,
      platform: `${platformFee.toFixed(2)} (20%)`,
      creator: `${creatorPayout.toFixed(2)} (80% of net)`
    }
  };
}

export default {
  isAdultContent,
  processAdultPayment,
  verifyCCBillPayment,
  getRecommendedProcessor,
  calculateAdultContentPayout,
  PAYMENT_PROCESSORS,
  ADULT_PAYMENT_SETUP
};
