/**
 * Circuit Breaker Integration Examples
 * Shows how to protect external API calls with circuit breakers
 */

const { getBreaker } = require('../utils/circuitBreaker');

// Example: Protected OpenAI API call
async function callOpenAI(prompt) {
  const breaker = getBreaker('openai', {
    failureThreshold: 5,
    resetTimeout: 60000,
    timeout: 10000,
    fallback: () => ({ 
      error: 'OpenAI unavailable',
      fallbackResponse: 'Service temporarily unavailable. Please try again later.'
    })
  });
  
  return breaker.execute(async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    return response.json();
  });
}

// Example: Protected Supabase query
async function querySupabase(supabase, query) {
  const breaker = getBreaker('supabase', {
    failureThreshold: 3,
    resetTimeout: 30000,
    timeout: 5000,
    fallback: () => ({ 
      data: null, 
      error: { message: 'Database temporarily unavailable' },
      fromCache: true 
    })
  });
  
  return breaker.execute(async () => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { data, error: null };
  });
}

// Example: Protected Stripe API call
async function processStripePayment(amount, token) {
  const breaker = getBreaker('stripe', {
    failureThreshold: 5,
    resetTimeout: 120000,
    timeout: 15000,
    fallback: () => ({
      success: false,
      error: 'Payment processing temporarily unavailable. Your card has not been charged.',
      retryable: true
    })
  });
  
  return breaker.execute(async () => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    return await stripe.charges.create({
      amount,
      currency: 'usd',
      source: token
    });
  });
}

// Example: Protected external API with retry
async function fetchExternalAPI(url, retries = 2) {
  const breaker = getBreaker('external-api', {
    failureThreshold: 10,
    resetTimeout: 60000,
    timeout: 5000
  });
  
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await breaker.execute(async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      });
    } catch (error) {
      lastError = error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }
  throw lastError;
}

module.exports = {
  callOpenAI,
  querySupabase,
  processStripePayment,
  fetchExternalAPI
};
