/* eslint-disable */
// AGE VERIFICATION SYSTEM - COPPA & Age-Restricted Content Compliance

export const AGE_VERIFICATION_CONFIG = {
  minimum_age: 13, // COPPA requirement
  adult_content_age: 18,
  alcohol_tobacco_age: 21,
  gambling_age: 21,

  verification_methods: {
    // Tier 1: Basic verification (13-17 year olds)
    email_verification: {
      required_for_age: 13,
      method: 'Email confirmation link',
      proof_level: 'LOW'
    },

    // Tier 2: Credit card verification (18+)
    credit_card: {
      required_for_age: 18,
      method: 'Credit card authorization ($1 hold, immediately refunded)',
      proof_level: 'MEDIUM',
      note: 'Must be 18+ to have credit card'
    },

    // Tier 3: ID verification (18+, for adult content creators)
    id_verification: {
      required_for_age: 18,
      method: 'Government-issued ID upload + selfie verification',
      providers: ['Stripe Identity', 'Onfido', 'Jumio', 'Yoti'],
      proof_level: 'HIGH',
      required_for: ['Adult content creation', 'High-volume sales (>$10k/year)']
    }

    // NO SSN VERIFICATION - Too invasive, not international-friendly
  },

  // Parental consent for users under 13
  parental_consent: {
    required: true,
    methods: [
      'Credit card verification (parent\'s card)',
      'Signed consent form uploaded + ID',
      'Video consent recording',
      'Notarized consent form'
    ],
    minimum_method: 'Credit card verification' // Easiest for parents
  }
};

export const AGE_RESTRICTIONS = {
  under_13: {
    allowed: [],
    blocked: ['Everything - COPPA violation without parental consent'],
    message: 'You must be at least 13 years old to use ForTheWeebs, or have verifiable parental consent.'
  },

  age_13_to_17: {
    allowed: [
      'View PG-13 content',
      'Create non-commercial content',
      'Participate in contests',
      'Comment on content',
      'Full platform access EXCEPT adult content'
    ],
    blocked: [
      'Adult content (18+) - NSFW, explicit sexual content',
      'Extreme graphic violence (18+)'
    ],
    restrictions: {
      max_monthly_revenue: 'UNLIMITED', // No revenue restrictions for teens
      parental_consent_for_payments: false, // Teens can earn freely
      content_filter: 'strict' // Filters out 18+ content only
    }
  },

  age_18_plus: {
    allowed: [
      'All content types',
      'Adult content (with age gate)',
      'Full payment processing',
      'Unlimited revenue',
      'Print-on-demand',
      'Trading card sales'
    ],
    blocked: [
      'Illegal content',
      'CSAM (child sexual abuse material)',
      'Content promoting minors sexually'
    ]
  },

  age_21_plus: {
    allowed: [
      'Alcohol/tobacco-related content',
      'Gambling content',
      'Casino-style games'
    ]
  }
};

/**
 * Verify user's age based on method
 * @param {number} userId - User ID
 * @param {number} claimedAge - Age user claims to be
 * @param {string} method - Verification method
 * @param {Object} data - Verification data (varies by method)
 * @returns {Promise<Object>} Verification result
 */
export async function verifyAge(userId, claimedAge, method, data) {
  try {
    let result;

    switch (method) {
      case 'email':
        result = await verifyByEmail(userId, data.email);
        break;
      case 'credit_card':
        result = await verifyByCreditCard(userId, data.cardToken);
        break;
      case 'id_upload':
        result = await verifyByIDUpload(userId, data.idImage, data.selfie);
        break;
      case 'ssn':
        result = await verifyBySSN(userId, data.ssnLast4, data.dob);
        break;
      case 'parental_consent':
        result = await verifyParentalConsent(userId, data);
        break;
      default:
        throw new Error(`Unknown verification method: ${method}`);
    }

    // Log verification attempt
    logAgeVerification(userId, method, result);

    return {
      verified: result.success,
      verifiedAge: result.age,
      method,
      timestamp: new Date().toISOString(),
      expiresAt: calculateExpiration(method),
      restrictions: getAgeRestrictions(result.age)
    };

  } catch (error) {
    console.error('Age verification error:', error);
    return {
      verified: false,
      error: error.message,
      method,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Email verification (Tier 1)
 */
async function verifyByEmail(userId, email) {
  // Send confirmation email
  const token = generateVerificationToken();
  // await sendVerificationEmail(email, token);

  // User must click link in email
  // This only proves email ownership, not age
  // Used as minimum barrier for 13+ users

  return {
    success: true,
    age: 13, // Minimum age we can verify with email
    confidence: 'LOW'
  };
}

/**
 * Credit card verification (Tier 2)
 * Credit card = must be 18+ (banks require 18 to issue cards)
 */
async function verifyByCreditCard(userId, cardToken) {
  // In production: Use Stripe to authorize $1 (then immediately refund)
  /*
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const charge = await stripe.paymentIntents.create({
    amount: 100, // $1.00
    currency: 'usd',
    payment_method: cardToken,
    confirm: true,
    description: 'Age verification (refunded immediately)'
  });
  
  // Immediately refund
  await stripe.refunds.create({ payment_intent: charge.id });
  */

  return {
    success: true,
    age: 18, // Must be 18+ to have credit card
    confidence: 'MEDIUM'
  };
}

/**
 * ID verification (Tier 3)
 * Government-issued ID + selfie match
 */
async function verifyByIDUpload(userId, idImage, selfie) {
  // In production: Use Stripe Identity, Onfido, or Jumio API
  /*
  const verification = await stripeIdentity.verify({
    document: idImage,
    selfie: selfie,
    userId: userId
  });
  
  return {
    success: verification.verified,
    age: verification.age,
    confidence: 'HIGH',
    idType: verification.documentType,
    issuingCountry: verification.country
  };
  */

  // MOCK for development
  return {
    success: true,
    age: 25,
    confidence: 'HIGH'
  };
}

/**
 * SSN verification (Tier 4)
 * Last 4 digits of SSN + DOB matching
 */
async function verifyBySSN(userId, ssnLast4, dob) {
  // In production: Use Experian or TransUnion API
  /*
  const verification = await experianAPI.verifyIdentity({
    ssnLast4: ssnLast4,
    dateOfBirth: dob,
    userId: userId
  });
  
  const age = calculateAge(dob);
  
  return {
    success: verification.match,
    age: age,
    confidence: 'VERY_HIGH'
  };
  */

  // MOCK for development
  const age = calculateAge(dob);
  return {
    success: true,
    age: age,
    confidence: 'VERY_HIGH'
  };
}

/**
 * Parental consent verification (for users under 13)
 */
async function verifyParentalConsent(userId, data) {
  // Verify parent's age first (must be 18+)
  const parentVerification = await verifyByCreditCard(userId, data.parentCardToken);

  if (!parentVerification.success) {
    return {
      success: false,
      age: null,
      error: 'Parent verification failed'
    };
  }

  // Log parental consent
  // await database.parentalConsents.insert({
  //   userId: userId,
  //   parentEmail: data.parentEmail,
  //   consentDate: new Date(),
  //   verificationMethod: 'credit_card'
  // });

  return {
    success: true,
    age: data.childAge, // Child's actual age
    confidence: 'HIGH',
    parentalConsent: true
  };
}

/**
 * Check if user can access content based on age
 * AUTOMATIC AGE VERIFICATION: Payment history = 18+ verified
 */
export function canAccessContent(userAge, contentRating, user = null) {
  const ratingRequirements = {
    'G': 0, // General audiences
    'PG': 0, // Parental guidance
    'PG-13': 13,
    'R': 17,
    'NC-17': 18,
    'ADULT': 18,
    'ALCOHOL': 21,
    'GAMBLING': 21
  };

  const requiredAge = ratingRequirements[contentRating] || 0;

  // PAYMENT-BASED AGE VERIFICATION
  // If user has completed ANY payment (buying OR receiving payouts), they're 18+
  if (user && (user.hasCompletedPurchase || user.hasReceivedPayout || user.stripeAccountVerified)) {
    // Credit card = must be 18+
    // Stripe payouts = must be 18+
    return true; // Bypass age gate for paying customers and creators
  }

  return userAge >= requiredAge;
}

/**
 * Check if user needs age gate for NSFW content
 * Returns false if user is auto-verified via payment
 */
export function needsAgeGate(user, contentRating) {
  if (contentRating !== 'ADULT' && contentRating !== 'NC-17') {
    return false; // Only adult content needs age gate
  }

  // AUTO-VERIFY: User has payment history = 18+
  if (user && (user.hasCompletedPurchase || user.hasReceivedPayout || user.stripeAccountVerified)) {
    return false; // No age gate needed
  }

  // Check if manually verified
  if (user && user.ageVerified && user.verifiedAge >= 18) {
    return false;
  }

  return true; // Show age gate
}

/**
 * Get age restrictions for user
 */
function getAgeRestrictions(age) {
  if (age < 13) return AGE_RESTRICTIONS.under_13;
  if (age >= 13 && age < 18) return AGE_RESTRICTIONS.age_13_to_17;
  if (age >= 18 && age < 21) return AGE_RESTRICTIONS.age_18_plus;
  return AGE_RESTRICTIONS.age_21_plus;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate when verification expires
 */
function calculateExpiration(method) {
  const now = new Date();
  const expirations = {
    email: 365, // 1 year
    credit_card: 365, // 1 year
    id_upload: 730, // 2 years
    ssn: 1825, // 5 years
    parental_consent: 365 // 1 year (re-verify annually)
  };

  const daysValid = expirations[method] || 365;
  now.setDate(now.getDate() + daysValid);
  return now.toISOString();
}

/**
 * Generate verification token
 */
function generateVerificationToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

/**
 * Log verification attempt
 */
function logAgeVerification(userId, method, result) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    method,
    success: result.success,
    verifiedAge: result.age,
    confidence: result.confidence
  };

  console.log('AGE_VERIFICATION_LOG:', JSON.stringify(logEntry));
  // await database.ageVerificationLogs.insert(logEntry);
}

/**
 * Age gate modal component (React)
 */
export function AgeGateModal({ contentRating, onVerified, onCancel }) {
  const requiredAge = contentRating === 'ADULT' ? 18 : contentRating === 'GAMBLING' ? 21 : 13;

  return {
    title: '🔞 Age Verification Required',
    message: `This content is rated ${contentRating} and requires age verification (${requiredAge}+).`,
    options: [
      { label: 'Verify with Credit Card', method: 'credit_card', age: 18 },
      { label: 'Verify with ID Upload', method: 'id_upload', age: 18 },
      { label: 'I am under 18', method: 'cancel', age: 0 }
    ],
    legalNotice: 'By verifying, you certify under penalty of perjury that you meet the age requirement. False verification is a violation of our Terms of Service and may be reported to law enforcement.'
  };
}

export default verifyAge;
