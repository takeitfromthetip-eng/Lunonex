/* eslint-disable */
/**
 * COMMISSION CREATION API
 * Allows creators to list commissions
 */

export async function POST(request) {
  try {
    const { userId, title, description, price, turnaroundDays, slots, tags, examples } = await request.json();

    // Validation
    if (!userId || !title || !price) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: userId, title, price'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (price < 5 || price > 5000) {
      return new Response(JSON.stringify({
        error: 'Price must be between $5 and $5,000'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Create commission in database
    const { data: commission, error: dbError } = await supabase
      .from('commissions')
      .insert({
        creator_id: userId,
        title,
        description: description || '',
        price_cents: price * 100,
        turnaround_days: turnaroundDays || 7,
        slots_available: slots || 1,
        tags: tags || [],
        sample_images: examples || []
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({
        error: 'Database error',
        details: dbError.message
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('Commission created:', commission);

    return new Response(JSON.stringify({
      success: true,
      commission
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Commission creation error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create commission'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    let query = supabase
      .from('commissions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    }

    const { data: commissions, error: fetchError } = await query;

    if (fetchError) {
      return new Response(JSON.stringify({
        error: 'Database error',
        details: fetchError.message
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      commissions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
