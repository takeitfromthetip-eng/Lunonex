/**
 * Mico AI - Self-Reliant AI Agent
 * Handles AI tasks autonomously using OpenAI API
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * GET /api/mico/status
 * Check if Mico AI is operational
 */
router.get('/status', (req, res) => {
  const hasOpenAI = !!OPENAI_API_KEY;

  res.json({
    status: hasOpenAI ? 'online' : 'degraded',
    version: '2.0',
    capabilities: {
      chat: hasOpenAI,
      imageGeneration: hasOpenAI,
      codeGeneration: hasOpenAI,
      contentModeration: hasOpenAI,
      backgroundRemoval: true,
      videoProcessing: false,
      voiceCloning: false,
    },
    message: hasOpenAI ? 'Mico AI is fully operational' : 'Configure OPENAI_API_KEY for full functionality'
  });
});

/**
 * POST /api/mico/chat
 * Chat with Mico AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured',
        message: 'Set OPENAI_API_KEY in environment variables'
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are Mico, an advanced AI assistant for Lunonex platform. You help users with content creation, moderation, and platform features.'
          },
          ...(context || []),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    res.json({
      response: aiResponse,
      model: 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mico chat error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'AI request failed',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/mico/generate-content
 * Generate content using AI
 */
router.post('/generate-content', async (req, res) => {
  try {
    const { prompt, type, style } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured'
      });
    }

    const systemPrompts = {
      caption: 'You are a social media expert. Generate engaging captions.',
      description: 'You are a content writer. Generate detailed descriptions.',
      title: 'You are a copywriter. Generate catchy titles.',
      script: 'You are a video scriptwriter. Generate engaging scripts.',
      post: 'You are a content creator. Generate complete social media posts.'
    };

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompts[type] || systemPrompts.post
          },
          {
            role: 'user',
            content: style ? `${prompt}\n\nStyle: ${style}` : prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedContent = response.data.choices[0].message.content;

    res.json({
      content: generatedContent,
      type,
      prompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content generation error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Content generation failed',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/mico/moderate-content
 * Use AI to moderate content
 */
router.post('/moderate-content', async (req, res) => {
  try {
    const { content, contentType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured'
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/moderations',
      {
        input: content
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const moderation = response.data.results[0];
    const flagged = moderation.flagged;
    const categories = moderation.categories;
    const scores = moderation.category_scores;

    res.json({
      safe: !flagged,
      flagged,
      categories,
      scores,
      recommendation: flagged ? 'block' : 'approve',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Moderation error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Moderation failed',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/mico/analyze-image
 * Analyze image content using AI
 */
router.post('/analyze-image', async (req, res) => {
  try {
    const { imageUrl, question } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'OpenAI API key not configured'
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: question || 'Describe this image in detail.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = response.data.choices[0].message.content;

    res.json({
      analysis,
      imageUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image analysis error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Image analysis failed',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
