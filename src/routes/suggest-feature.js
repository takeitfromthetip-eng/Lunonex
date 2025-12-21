import { verify } from 'jsonwebtoken';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { suggestion, userId } = await request.json();

    if (!suggestion || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const startTime = Date.now();

    // AI Analysis
    const analysis = await analyzeSuggestion(suggestion);

    const analysisTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // Save to database
    const { data: savedSuggestion, error: dbError } = await supabase
      .from('suggestions')
      .insert({
        user_id: userId,
        email: user.email,
        tier: user.tier || 'free',
        suggestion,
        category: analysis.category,
        priority: analysis.priority,
        verdict: analysis.status === 'approved' ? 'implement' : 'reject',
        reasoning: analysis.reasoning,
        estimated_hours: analysis.estimatedHours,
        status: analysis.status === 'approved' ? 'approved_implementing' : 'rejected'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving suggestion:', dbError);
    }

    // If approved, trigger auto-build
    if (analysis.status === 'approved' && savedSuggestion) {
      // Trigger background job to build feature
      triggerFeatureBuild(suggestion, analysis, userId, savedSuggestion.id);
    }

    return new Response(
      JSON.stringify({
        ...analysis,
        analysisTime,
        message: getStatusMessage(analysis.status)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Feature suggestion error:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function analyzeSuggestion(suggestion) {
  const prompt = `You are an AI product manager and technical architect. Analyze this feature suggestion:

"${suggestion}"

Determine:
1. Is it technically feasible with current web technologies?
2. Is it a good idea that adds value?
3. Complexity level (Simple/Medium/Complex)
4. Estimated build time
5. Feasibility score (0-100%)
6. Should it be approved, rejected, or needs review?

Reject if:
- Impossible with current tech
- Harmful, unethical, or violates laws
- Spam or nonsense
- Too vague to implement
- Security risk

Approve if:
- Technically feasible
- Adds clear value
- Well-defined scope
- Aligns with platform goals

Respond in JSON format:
{
  "status": "approved" | "rejected" | "under_review",
  "analysis": "Detailed explanation",
  "feasibilityScore": 0-100,
  "complexity": "Simple" | "Medium" | "Complex",
  "estimatedTime": "X hours/days",
  "reasons": ["reason1", "reason2"] (if rejected),
  "technicalApproach": "Brief description of how to build it" (if approved)
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const response = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      status: 'under_review',
      analysis: 'Could not parse AI response. Flagged for manual review.',
      feasibilityScore: 50,
      complexity: 'Medium',
      estimatedTime: 'Unknown'
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      status: 'under_review',
      analysis: 'AI analysis temporarily unavailable. Suggestion flagged for manual review.',
      feasibilityScore: 0,
      complexity: 'Unknown',
      estimatedTime: 'Unknown'
    };
  }
}

async function triggerFeatureBuild(suggestion, analysis, userId, suggestionId) {
  // This would trigger a background job/workflow to actually build the feature

  // Option 1: Create GitHub issue that triggers auto-build workflow
  if (process.env.GITHUB_TOKEN) {
    try {
      await fetch('https://api.github.com/repos/YOUR_USERNAME/Fortheweebs/issues', {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `[AUTO-BUILD] ${suggestion.substring(0, 100)}`,
          body: `**User Suggestion:** ${suggestion}

**AI Analysis:**
${analysis.analysis}

**Technical Approach:**
${analysis.technicalApproach}

**Complexity:** ${analysis.complexity}
**Estimated Time:** ${analysis.estimatedTime}

---
This issue was created automatically by the Feature Suggestion System.
AI will attempt to build this feature automatically.`,
          labels: ['feature-request', 'auto-build', 'approved']
        })
      });
    } catch (err) {
      console.error('Failed to create GitHub issue:', err);
    }
  }

  // Option 2: Add to build queue in database
  await supabase
    .from('build_queue')
    .insert({
      suggestion_id: suggestionId,
      user_id: userId,
      files_to_create: analysis.filesToCreate || [],
      files_to_modify: analysis.filesToModify || [],
      dependencies: analysis.dependencies || [],
      status: 'queued'
    });

  // Option 3: Send to external build service
  // Could integrate with CI/CD, serverless functions, etc.

  console.log(`Feature build triggered for suggestion: ${suggestion.substring(0, 50)}...`);
}

function getStatusMessage(status) {
  switch (status) {
    case 'approved':
      return 'Great idea! AI is building your feature now. You\'ll be notified when it\'s ready!';
    case 'under_review':
      return 'Your suggestion needs manual review. We\'ll get back to you within 24 hours.';
    case 'rejected':
      return 'Unfortunately, this suggestion cannot be implemented at this time.';
    default:
      return 'Suggestion received and being processed.';
  }
}

// GET endpoint to fetch user's suggestions
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Fetch from database
    const { data: suggestions, error: fetchError } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Database error fetching suggestions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error', suggestions: [] }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ suggestions }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Fetch suggestions error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch suggestions' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
