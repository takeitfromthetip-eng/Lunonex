/* eslint-disable */
import { verify } from 'jsonwebtoken';
import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
);

export async function POST(request) {
  try {
    const { prompt, contentType, userId } = await request.json();

    if (!prompt || !contentType || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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
    let user;
    try {
      user = verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user has SUPER_ADMIN tier
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('payment_tier')
        .eq('id', userId)
        .single();

      if (error || !userData) {
        return new Response(JSON.stringify({
          error: 'User not found or database error',
          details: error?.message
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (userData.payment_tier !== 'SUPER_ADMIN') {
        return new Response(JSON.stringify({
          error: 'Requires Super Admin tier ($1000)',
          currentTier: userData.payment_tier
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (dbError) {
      console.error('Database tier check error:', dbError);
      return new Response(JSON.stringify({
        error: 'Failed to verify user tier'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate content based on type
    let result;
    switch (contentType) {
      case 'image':
        result = await generateImage(prompt);
        break;
      case '3d':
        result = await generate3DModel(prompt);
        break;
      case 'video':
        result = await generateVideo(prompt);
        break;
      case 'text':
        result = await generateText(prompt);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid content type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Generation failed', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function generateImage(prompt) {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return {
      url: 'https://placeholder.com/generated-image.png',
      message: 'Image generation temporarily unavailable. Please contact support.'
    };
  }

  try {
    // Call OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    // Download and upload to Vercel Blob for permanent storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.arrayBuffer();
        const blob = await put(`generated/image_${Date.now()}.png`, imageBlob, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        return {
          url: blob.url,
          originalUrl: imageUrl,
          message: 'Image generated successfully',
          revisedPrompt: data.data[0].revised_prompt
        };
      } catch (blobError) {
        console.error('Blob upload error:', blobError);
        // Return OpenAI URL if blob upload fails
        return {
          url: imageUrl,
          message: 'Image generated (temporary URL - expires in 1 hour)',
          revisedPrompt: data.data[0].revised_prompt
        };
      }
    }

    return {
      url: imageUrl,
      message: 'Image generated successfully (temporary URL - expires in 1 hour)',
      revisedPrompt: data.data[0].revised_prompt
    };

  } catch (error) {
    console.error('Image generation error:', error);
    return {
      error: 'Failed to generate image',
      details: error.message,
      url: null
    };
  }
}

async function generate3DModel(prompt) {
  // 3D generation: OpenAI Shap-E, Meshy.ai, or Luma AI
  return {
    url: 'https://placeholder.com/generated-model.glb',
    message: '3D model generation not yet implemented. Integrate Shap-E or Meshy.ai API.'
  };
}

async function generateVideo(prompt) {
  // Video generation: Runway ML, Pika Labs, or Luma Dream Machine
  return {
    url: 'https://placeholder.com/generated-video.mp4',
    message: 'Video generation not yet implemented. Integrate Runway ML or Pika Labs.'
  };
}

async function generateText(prompt) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      text: `Text generation temporarily unavailable. Please contact support.`
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      message: 'Text generated successfully',
      tokensUsed: data.usage?.total_tokens
    };

  } catch (error) {
    console.error('Text generation error:', error);
    return {
      error: 'Failed to generate text',
      details: error.message,
      text: null
    };
  }
}
