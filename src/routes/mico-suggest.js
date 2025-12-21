/**
 * Mico Suggestion Evaluation
 * Users submit feature suggestions → Mico evaluates → Good ones go to Claude
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, email, tier, suggestion } = body;

    if (!suggestion || suggestion.length < 20) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Suggestion too short. Please provide more details.'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Have Mico evaluate the suggestion
    const evaluation = await evaluateSuggestion(suggestion, tier);

    // If Mico says it's worthwhile, send to Claude
    if (evaluation.verdict === 'worthwhile') {
      const response = await fetch(`${request.url.origin}/api/claude-code-integration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggestion',
          data: {
            userId,
            email,
            tier,
            suggestion,
            micoEvaluation: evaluation,
            priority: evaluation.priority,
            category: evaluation.category
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to forward suggestion to Claude');
      }
    }

    // Always thank the user (don't tell them if it was filtered)
    return new Response(JSON.stringify({
      success: true,
      message: evaluation.verdict === 'worthwhile'
        ? '💡 Great suggestion! Forwarding to the development team.'
        : '💡 Thank you for your suggestion! We\'ll keep it in mind for future updates.'
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Mico suggestion error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process suggestion'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

/**
 * Mico evaluates if suggestion is worthwhile
 */
async function evaluateSuggestion(suggestion, tier) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      // If no AI, accept all suggestions
      return {
        verdict: 'worthwhile',
        priority: 'low',
        category: 'other',
        reasoning: 'Auto-approved (AI unavailable)'
      };
    }

    const prompt = `You are Mico, the AI assistant for ForTheWeebs platform.
A user (Tier: ${tier}) submitted this feature suggestion:

"${suggestion}"

Evaluate if this suggestion is:
1. WORTHWHILE - Good idea, feasible, adds value
2. NOT_WORTHWHILE - Already exists, too vague, not feasible, spam

Respond in JSON:
{
  "verdict": "worthwhile" | "not_worthwhile",
  "priority": "high" | "medium" | "low",
  "category": "ui" | "feature" | "performance" | "content" | "monetization" | "other",
  "reasoning": "Brief explanation why this is/isn't worth forwarding to Claude"
}

Mark WORTHWHILE if:
- Clear, specific idea
- Adds value for users
- Technically feasible
- Not already implemented

Mark NOT_WORTHWHILE if:
- Too vague ("make it better")
- Already exists
- Spam/troll
- Impossible/unrealistic`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API failed');
    }

    const data = await response.json();
    const evaluation = JSON.parse(data.content[0].text);

    return evaluation;

  } catch (error) {
    console.error('Mico evaluation error:', error);
    // On error, be conservative - don't forward
    return {
      verdict: 'not_worthwhile',
      priority: 'low',
      category: 'other',
      reasoning: 'Evaluation failed'
    };
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
