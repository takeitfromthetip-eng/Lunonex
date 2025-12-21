/**
 * PAYMENT SECURITY & FRAUD DETECTION SYSTEM
 * Prevents payment fraud, chargebacks, and abuse
 */

import { supabase } from '../lib/supabase';
import { rateLimiter } from './securityCore';
import { generateDeviceFingerprint } from './securityCore';

export const FRAUD_DETECTION_CONFIG = {
  enabled: true,

  // Risk thresholds
  riskScores: {
    low: 0 - 30, // Allow immediately
    medium: 31 - 60, // Require additional verification
    high: 61 - 80, // Hold for manual review
    critical: 81 - 100, // Block immediately
  },

  // Fraud indicators
  indicators: {
    // Device & Location
    vpn_detected: 15,
    tor_detected: 25,
    emulator_detected: 20,
    location_mismatch: 10, // IP country != card country
    device_mismatch: 5, // New device for user

    // Behavioral
    rapid_purchases: 20, // Multiple purchases in short time
    high_value: 15, // Unusually high purchase value
    unusual_hour: 5, // Purchase at 2-4 AM local time
    multiple_cards: 10, // Trying multiple cards

    // Account
    new_account: 10, // Account < 7 days old
    no_activity: 15, // No platform usage before purchase
    suspicious_email: 10, // Disposable email provider
    previous_chargebacks: 30, // User has chargeback history

    // Payment
    card_declined: 20, // Card was previously declined
    card_stolen: 100, // Card reported stolen
    insufficient_funds: 5, // Previous insufficient funds
  },

  // Velocity limits (prevent abuse)
  velocity: {
    max_purchases_per_hour: 5,
    max_purchases_per_day: 20,
    max_amount_per_hour: 500000, // $5,000 in cents
    max_amount_per_day: 2000000, // $20,000
    max_failed_attempts: 3, // Before temporary block
  },

  // Verification requirements based on risk
  verification: {
    low: [], // No additional verification
    medium: ['email_confirm', 'phone_verify'],
    high: ['email_confirm', 'phone_verify', 'identity_document'],
    critical: ['manual_review'],
  },
};

/**
 * Analyze payment for fraud risk
 */
export async function analyzePaymentRisk(paymentData) {
  const riskFactors = [];
  let riskScore = 0;

  try {
    // Rate limiting check
    const rateCheck = rateLimiter.isAllowed(paymentData.userId, 'payment');
    if (!rateCheck.allowed) {
      riskFactors.push({
        type: 'RATE_LIMIT_EXCEEDED',
        score: 50,
        message: 'Too many payment attempts',
      });
      riskScore += 50;
    }

    // Check velocity limits
    const velocityCheck = await checkVelocityLimits(paymentData.userId, paymentData.amount);
    if (!velocityCheck.allowed) {
      riskFactors.push({
        type: 'VELOCITY_LIMIT_EXCEEDED',
        score: velocityCheck.riskScore,
        message: velocityCheck.message,
      });
      riskScore += velocityCheck.riskScore;
    }

    // Device fingerprint analysis
    const deviceCheck = await analyzeDevice(paymentData.userId);
    riskFactors.push(...deviceCheck.factors);
    riskScore += deviceCheck.score;

    // User account analysis
    const accountCheck = await analyzeAccount(paymentData.userId);
    riskFactors.push(...accountCheck.factors);
    riskScore += accountCheck.score;

    // Payment method analysis
    const paymentCheck = await analyzePaymentMethod(paymentData);
    riskFactors.push(...paymentCheck.factors);
    riskScore += paymentCheck.score;

    // Behavioral analysis
    const behaviorCheck = await analyzeBehavior(paymentData);
    riskFactors.push(...behaviorCheck.factors);
    riskScore += behaviorCheck.score;

    // Determine risk level
    const riskLevel = getRiskLevel(riskScore);

    // Log the analysis
    await logFraudAnalysis({
      userId: paymentData.userId,
      amount: paymentData.amount,
      riskScore,
      riskLevel,
      riskFactors,
      timestamp: new Date().toISOString(),
    });

    // Determine if payment should be allowed
    const shouldBlock = riskLevel === 'critical' || riskScore >= 80;
    const requiresReview = riskLevel === 'high' && riskScore >= 60;
    const requiresVerification = riskLevel === 'medium' && riskScore >= 30;

    return {
      allowed: !shouldBlock,
      riskScore,
      riskLevel,
      riskFactors,
      requiresReview,
      requiresVerification: requiresVerification ? FRAUD_DETECTION_CONFIG.verification.medium : [],
      message: shouldBlock
        ? 'Payment blocked due to high fraud risk'
        : requiresReview
        ? 'Payment held for manual review'
        : requiresVerification
        ? 'Additional verification required'
        : 'Payment approved',
    };

  } catch (error) {
    console.error('Error analyzing payment risk:', error);

    // FAIL SECURE: If analysis fails, require manual review
    return {
      allowed: false,
      riskScore: 100,
      riskLevel: 'critical',
      riskFactors: [{
        type: 'ANALYSIS_ERROR',
        score: 100,
        message: 'Unable to analyze payment risk',
        error: error.message,
      }],
      requiresReview: true,
      message: 'Payment requires manual review due to system error',
    };
  }
}

/**
 * Check velocity limits (prevent rapid fraud attempts)
 */
async function checkVelocityLimits(userId, amount) {
  try {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    // Get recent payment attempts
    const { data: recentPayments, error } = await supabase
      .from('payment_attempts')
      .select('amount, created_at, status')
      .eq('user_id', userId)
      .gte('created_at', new Date(oneDayAgo).toISOString());

    if (error) throw error;

    const hourPayments = recentPayments.filter(p =>
      new Date(p.created_at).getTime() >= oneHourAgo
    );

    const dayPayments = recentPayments;

    // Count purchases
    const hourCount = hourPayments.length;
    const dayCount = dayPayments.length;

    // Sum amounts
    const hourAmount = hourPayments.reduce((sum, p) => sum + p.amount, 0);
    const dayAmount = dayPayments.reduce((sum, p) => sum + p.amount, 0);

    // Count failed attempts
    const failedAttempts = recentPayments.filter(p => p.status === 'failed').length;

    // Check limits
    let riskScore = 0;
    let message = '';

    if (hourCount >= FRAUD_DETECTION_CONFIG.velocity.max_purchases_per_hour) {
      riskScore += 30;
      message = 'Too many purchases in last hour';
    }

    if (dayCount >= FRAUD_DETECTION_CONFIG.velocity.max_purchases_per_day) {
      riskScore += 25;
      message = 'Too many purchases today';
    }

    if (hourAmount + amount > FRAUD_DETECTION_CONFIG.velocity.max_amount_per_hour) {
      riskScore += 35;
      message = 'Purchase amount limit exceeded for hour';
    }

    if (dayAmount + amount > FRAUD_DETECTION_CONFIG.velocity.max_amount_per_day) {
      riskScore += 30;
      message = 'Purchase amount limit exceeded for day';
    }

    if (failedAttempts >= FRAUD_DETECTION_CONFIG.velocity.max_failed_attempts) {
      riskScore += 40;
      message = 'Too many failed payment attempts';
    }

    return {
      allowed: riskScore === 0,
      riskScore,
      message,
      stats: {
        hourCount,
        dayCount,
        hourAmount,
        dayAmount,
        failedAttempts,
      },
    };

  } catch (error) {
    console.error('Error checking velocity limits:', error);
    return {
      allowed: false,
      riskScore: 50,
      message: 'Unable to verify payment velocity',
    };
  }
}

/**
 * Analyze device for fraud indicators
 */
async function analyzeDevice(userId) {
  const factors = [];
  let score = 0;

  try {
    const fingerprint = generateDeviceFingerprint();

    // Check if device is known for this user
    const { data: knownDevices, error } = await supabase
      .from('user_devices')
      .select('fingerprint')
      .eq('user_id', userId);

    if (error) throw error;

    const isKnownDevice = knownDevices.some(d => d.fingerprint === fingerprint);

    if (!isKnownDevice) {
      factors.push({
        type: 'NEW_DEVICE',
        score: FRAUD_DETECTION_CONFIG.indicators.device_mismatch,
        message: 'Payment from new device',
      });
      score += FRAUD_DETECTION_CONFIG.indicators.device_mismatch;
    }

    // Check for VPN/Proxy (in production, use IP intelligence API)
    // const isVPN = await checkIPIntelligence(userIP);
    // if (isVPN) {
    //   factors.push({
    //     type: 'VPN_DETECTED',
    //     score: FRAUD_DETECTION_CONFIG.indicators.vpn_detected,
    //     message: 'VPN or proxy detected',
    //   });
    //   score += FRAUD_DETECTION_CONFIG.indicators.vpn_detected;
    // }

    return { factors, score };

  } catch (error) {
    console.error('Error analyzing device:', error);
    return { factors: [], score: 0 };
  }
}

/**
 * Analyze user account for risk factors
 */
async function analyzeAccount(userId) {
  const factors = [];
  let score = 0;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('created_at, email, last_login, activity_count, chargeback_count')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Check account age
    const accountAge = Date.now() - new Date(user.created_at).getTime();
    const daysSinceCreation = accountAge / (24 * 60 * 60 * 1000);

    if (daysSinceCreation < 7) {
      factors.push({
        type: 'NEW_ACCOUNT',
        score: FRAUD_DETECTION_CONFIG.indicators.new_account,
        message: `Account only ${Math.floor(daysSinceCreation)} days old`,
      });
      score += FRAUD_DETECTION_CONFIG.indicators.new_account;
    }

    // Check activity level
    if (!user.activity_count || user.activity_count < 5) {
      factors.push({
        type: 'LOW_ACTIVITY',
        score: FRAUD_DETECTION_CONFIG.indicators.no_activity,
        message: 'Little to no platform usage',
      });
      score += FRAUD_DETECTION_CONFIG.indicators.no_activity;
    }

    // Check chargeback history
    if (user.chargeback_count && user.chargeback_count > 0) {
      factors.push({
        type: 'CHARGEBACK_HISTORY',
        score: FRAUD_DETECTION_CONFIG.indicators.previous_chargebacks,
        message: `User has ${user.chargeback_count} previous chargebacks`,
      });
      score += FRAUD_DETECTION_CONFIG.indicators.previous_chargebacks;
    }

    // Check for disposable email
    const disposableProviders = ['tempmail', 'guerrillamail', '10minutemail', 'throwaway'];
    const isDisposable = disposableProviders.some(provider =>
      user.email.toLowerCase().includes(provider)
    );

    if (isDisposable) {
      factors.push({
        type: 'DISPOSABLE_EMAIL',
        score: FRAUD_DETECTION_CONFIG.indicators.suspicious_email,
        message: 'Disposable email provider detected',
      });
      score += FRAUD_DETECTION_CONFIG.indicators.suspicious_email;
    }

    return { factors, score };

  } catch (error) {
    console.error('Error analyzing account:', error);
    return { factors: [], score: 0 };
  }
}

/**
 * Analyze payment method for fraud
 */
async function analyzePaymentMethod(paymentData) {
  const factors = [];
  let score = 0;

  try {
    // Check if card has been declined before
    const { data: declinedCards, error } = await supabase
      .from('declined_cards')
      .select('*')
      .eq('card_fingerprint', paymentData.cardFingerprint);

    if (error) throw error;

    if (declinedCards.length > 0) {
      factors.push({
        type: 'PREVIOUSLY_DECLINED',
        score: FRAUD_DETECTION_CONFIG.indicators.card_declined,
        message: 'Card was previously declined',
      });
      score += FRAUD_DETECTION_CONFIG.indicators.card_declined;
    }

    // Check if card is reported stolen (would be from external API)
    // const stolenCheck = await checkStolenCardDatabase(paymentData.cardNumber);

    // Check for multiple cards being tried
    const { data: recentCards, error: cardsError } = await supabase
      .from('payment_attempts')
      .select('card_fingerprint')
      .eq('user_id', paymentData.userId)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()); // Last hour

    if (!cardsError) {
      const uniqueCards = new Set(recentCards.map(c => c.card_fingerprint));
      if (uniqueCards.size > 3) {
        factors.push({
          type: 'MULTIPLE_CARDS',
          score: FRAUD_DETECTION_CONFIG.indicators.multiple_cards,
          message: `${uniqueCards.size} different cards tried in last hour`,
        });
        score += FRAUD_DETECTION_CONFIG.indicators.multiple_cards;
      }
    }

    // High value purchase
    if (paymentData.amount > 50000) { // $500+
      factors.push({
        type: 'HIGH_VALUE',
        score: FRAUD_DETECTION_CONFIG.indicators.high_value,
        message: `High value purchase: $${(paymentData.amount / 100).toFixed(2)}`,
      });
      score += FRAUD_DETECTION_CONFIG.indicators.high_value;
    }

    return { factors, score };

  } catch (error) {
    console.error('Error analyzing payment method:', error);
    return { factors: [], score: 0 };
  }
}

/**
 * Analyze user behavior for anomalies
 */
async function analyzeBehavior(paymentData) {
  const factors = [];
  let score = 0;

  try {
    // Check purchase time (2-4 AM is suspicious)
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 4) {
      factors.push({
        type: 'UNUSUAL_HOUR',
        score: FRAUD_DETECTION_CONFIG.indicators.unusual_hour,
        message: 'Purchase at unusual hour (2-4 AM)',
      });
      score += FRAUD_DETECTION_CONFIG.indicators.unusual_hour;
    }

    // Check for rapid purchase pattern
    const { data: recentPurchases, error } = await supabase
      .from('payment_attempts')
      .select('created_at')
      .eq('user_id', paymentData.userId)
      .gte('created_at', new Date(Date.now() - 600000).toISOString()); // Last 10 min

    if (!error && recentPurchases.length >= 3) {
      factors.push({
        type: 'RAPID_PURCHASES',
        score: FRAUD_DETECTION_CONFIG.indicators.rapid_purchases,
        message: `${recentPurchases.length} purchases in 10 minutes`,
      });
      score += FRAUD_DETECTION_CONFIG.indicators.rapid_purchases;
    }

    return { factors, score };

  } catch (error) {
    console.error('Error analyzing behavior:', error);
    return { factors: [], score: 0 };
  }
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score) {
  if (score >= 81) return 'critical';
  if (score >= 61) return 'high';
  if (score >= 31) return 'medium';
  return 'low';
}

/**
 * Log fraud analysis for audit trail
 */
async function logFraudAnalysis(analysis) {
  try {
    await supabase.from('fraud_analysis_logs').insert({
      user_id: analysis.userId,
      amount: analysis.amount,
      risk_score: analysis.riskScore,
      risk_level: analysis.riskLevel,
      risk_factors: analysis.riskFactors,
      timestamp: analysis.timestamp,
    });
  } catch (error) {
    console.error('Error logging fraud analysis:', error);
  }
}

/**
 * Record payment attempt (for velocity tracking)
 */
export async function recordPaymentAttempt(userId, amount, status, cardFingerprint) {
  try {
    await supabase.from('payment_attempts').insert({
      user_id: userId,
      amount,
      status,
      card_fingerprint: cardFingerprint,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording payment attempt:', error);
  }
}

/**
 * Mark card as declined
 */
export async function recordDeclinedCard(cardFingerprint, reason) {
  try {
    await supabase.from('declined_cards').insert({
      card_fingerprint: cardFingerprint,
      reason,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording declined card:', error);
  }
}

/**
 * Record chargeback (permanently flag user)
 */
export async function recordChargeback(userId, amount, reason) {
  try {
    // Increment chargeback counter
    const { data: user, error } = await supabase
      .from('users')
      .select('chargeback_count')
      .eq('id', userId)
      .single();

    if (!error) {
      const newCount = (user.chargeback_count || 0) + 1;
      await supabase
        .from('users')
        .update({ chargeback_count: newCount })
        .eq('id', userId);
    }

    // Log chargeback
    await supabase.from('chargebacks').insert({
      user_id: userId,
      amount,
      reason,
      created_at: new Date().toISOString(),
    });

    // Alert admins
    console.error('🚨 CHARGEBACK DETECTED:', { userId, amount, reason });

  } catch (error) {
    console.error('Error recording chargeback:', error);
  }
}

/**
 * Get fraud detection stats (for admin dashboard)
 */
export async function getFraudStats() {
  try {
    const { data: logs, error } = await supabase
      .from('fraud_analysis_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (error) throw error;

    const stats = {
      total: logs.length,
      byRiskLevel: {
        low: logs.filter(l => l.risk_level === 'low').length,
        medium: logs.filter(l => l.risk_level === 'medium').length,
        high: logs.filter(l => l.risk_level === 'high').length,
        critical: logs.filter(l => l.risk_level === 'critical').length,
      },
      blocked: logs.filter(l => l.risk_score >= 80).length,
      averageRiskScore: logs.reduce((sum, l) => sum + l.risk_score, 0) / logs.length,
      topRiskFactors: {},
    };

    // Count top risk factors
    for (const log of logs) {
      for (const factor of log.risk_factors) {
        stats.topRiskFactors[factor.type] = (stats.topRiskFactors[factor.type] || 0) + 1;
      }
    }

    return stats;

  } catch (error) {
    console.error('Error getting fraud stats:', error);
    return null;
  }
}

export default {
  analyzePaymentRisk,
  recordPaymentAttempt,
  recordDeclinedCard,
  recordChargeback,
  getFraudStats,
  FRAUD_DETECTION_CONFIG,
};
