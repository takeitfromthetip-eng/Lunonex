/**
 * FULLY AUTONOMOUS USER Q&A SYSTEM
 *
 * Replaces Mico's chat functionality with 100% autonomous AI
 * Users ask questions → AI answers instantly
 * NO HUMAN INVOLVEMENT
 */

const { supabase } = require('../lib/supabase-server.js');
const express = require('express');
const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

router.post('/', async (req, res) => {
  try {
    const { userId, email, tier, question, conversationHistory } = req.body;

    if (!question || question.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Question too short'
      });
    }

    // Rate limiting - 50 questions per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentQuestions } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);

    if (recentQuestions && recentQuestions.length >= 50) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit: 50 questions per hour'
      });
    }

    // Get AI response
    const answer = await getAIAnswer(question, tier, conversationHistory);

    // Store conversation
    await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        email: email,
        tier: tier,
        question: sanitizeInput(question),
        answer: answer,
        created_at: new Date().toISOString()
      });

    return res.status(200).json({
      success: true,
      answer: answer
    });

  } catch (error) {
    console.error('Auto-answer error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get answer'
    });
  }
});

module.exports = router;

/**
 * Get AI answer using Claude API
 */
async function getAIAnswer(question, tier, conversationHistory = []) {
  if (!ANTHROPIC_API_KEY) {
    return "I'm currently offline. Please try again later or contact support.";
  }

  // Build conversation context
  const messages = conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  messages.push({
    role: 'user',
    content: question
  });

  const systemPrompt = `You are Mico, the AI assistant for ForTheWeebs - an anime creator platform.

**Platform Features:**
- **For Fans:**
  - Browse anime art, cosplay, AMVs, fanfics
  - Support creators via tips, subscriptions, commissions
  - Access tiers: Free, $15/month Adult, $50-$1000 Sovereign tiers

- **For Creators:**
  - Upload content and monetize
  - Accept tips, subscriptions, commissions
  - Stripe Connect for payments (W-9/1099-K handled automatically)
  - 15% platform fee for free users, 0% for paid users
  - Influencer program: 10K+ followers get free $500 tier + 0% fees

- **Tier System:**
  - Free: Basic access
  - $15/month: Adult content access
  - $50 Bronze: Level 2 + perks
  - $100 Silver: Level 3 + perks
  - $250 Gold: Level 4 + perks
  - $500 Platinum: Level 5 + Full Unlock
  - $1000 Diamond: Level 6 + Admin powers + 3 creator accounts

- **Special Features:**
  - Upgrade credits: Previous payments apply to next tier
  - Crypto payments: Bitcoin, Ethereum, USDC accepted
  - Multi-account blocking: Blocking $1000 member blocks all 3 accounts
  - Security challenge for sensitive actions

**User Tier:** ${tier}

**Your Role:**
- Answer questions about platform features
- Help with technical issues (guide users, don't promise fixes)
- Explain monetization, fees, tier benefits
- Be helpful, friendly, concise
- Don't make promises about new features
- Don't provide financial/legal advice
- Don't share API keys or sensitive data

**Tone:**
- Casual but professional
- Anime-friendly (ok to reference anime culture)
- Empathetic and solution-focused`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    console.error('AI answer generation failed:', error);
    return "I'm having trouble processing your question right now. Please try again in a moment, or contact support if the issue persists.";
  }
}

function sanitizeInput(input) {
  if (!input) return '';
  let sanitized = String(input).slice(0, 10000);
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  sanitized = sanitized.replace(/(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)\b)/gi, '[BLOCKED]');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED]');
  sanitized = sanitized.replace(/pk_live_[a-zA-Z0-9]{24,}/g, '[REDACTED]');
  return sanitized;
}
