import { verify } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    try {
      verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Query database for user's payment tier
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('payment_tier, email, username')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Database error:', error);
        // Return FREE tier if user not found
        const tier = 'FREE';
        return new Response(JSON.stringify({
          tier,
          userId,
          features: getTierFeatures(tier),
          message: 'User not found in database, defaulting to FREE tier'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const tier = user?.payment_tier || 'FREE';

      return new Response(JSON.stringify({
        tier,
        userId,
        username: user?.username,
        email: user?.email,
        features: getTierFeatures(tier)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Fallback to FREE tier
      const tier = 'FREE';
      return new Response(JSON.stringify({
        tier,
        userId,
        features: getTierFeatures(tier),
        message: 'Database unavailable, defaulting to FREE tier'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('User tier check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function getTierFeatures(tier) {
  const features = {
    FREE: ['View content', 'Basic features'],
    CREATOR: ['100% profit', 'AR/VR tools', 'Cloud upload', '3D viewer', 'VR galleries'],
    SUPER_ADMIN: ['Everything in CREATOR', 'AI content generator', 'View all content free', 'Super admin access']
  };
  return features[tier] || features.FREE;
}
