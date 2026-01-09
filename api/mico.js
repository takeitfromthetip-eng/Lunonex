/**
 * Mico AI - 100% Self-Reliant AI Agent
 * NO external API dependencies - fully local processing
 */

const express = require('express');
const router = express.Router();
const localAI = require('./utils/localAI');

/**
 * GET /api/mico/status
 * Check if Mico AI is operational
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    version: '2.0',
    capabilities: {
      chat: true,
      imageGeneration: true,
      codeGeneration: true,
      contentModeration: true,
      backgroundRemoval: true,
      videoProcessing: true,
      voiceCloning: true,
    },
    mode: 'self-reliant',
    message: 'Mico AI is fully operational - 100% local processing, ZERO API costs'
  });
});

/**
 * POST /api/mico/chat
 * Chat with Mico AI - 100% LOCAL, NO EXTERNAL APIS
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate intelligent response using local AI
    const result = await localAI.generate('content', message, {
      style: 'conversational',
      context: context || [],
      systemPrompt: systemPrompt || 'You are Mico, an advanced AI assistant for Lunonex platform.'
    });

    // Build contextual response
    let aiResponse = `I understand you're asking about: ${message}\n\n`;

    if (message.toLowerCase().includes('help') || message.toLowerCase().includes('how')) {
      aiResponse += `Here's what I can help you with:\n\n`;
      aiResponse += `1. Content creation and optimization\n`;
      aiResponse += `2. Platform features and navigation\n`;
      aiResponse += `3. Best practices for creators\n`;
      aiResponse += `4. Account and settings management\n\n`;
      aiResponse += `What specific area would you like to explore?`;
    } else if (message.toLowerCase().includes('create') || message.toLowerCase().includes('generate')) {
      aiResponse += `I can help you create:\n\n`;
      aiResponse += `• Professional content\n`;
      aiResponse += `• Marketing materials\n`;
      aiResponse += `• Social media posts\n`;
      aiResponse += `• Scripts and outlines\n\n`;
      aiResponse += result.result;
    } else {
      aiResponse += result.result;
    }

    res.json({
      response: aiResponse,
      model: 'local-ai',
      mode: 'self-reliant',
      cost: 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Mico chat error:', error.message);
    res.status(500).json({
      error: 'AI request failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mico/generate-content
 * Generate content using LOCAL AI - ZERO API costs
 */
router.post('/generate-content', async (req, res) => {
  try {
    const { prompt, type, style } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Map content types to localAI generators
    const typeMap = {
      caption: 'content',
      description: 'content',
      title: 'content',
      script: 'script',
      post: 'content',
      ad: 'ad',
      meme: 'meme'
    };

    const aiType = typeMap[type] || 'content';
    const result = await localAI.generate(aiType, prompt, { style: style || 'professional' });

    res.json({
      content: result.result,
      type,
      prompt,
      model: 'local-ai',
      cost: 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content generation error:', error.message);
    res.status(500).json({
      error: 'Content generation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mico/moderate-content
 * Use LOCAL AI to moderate content - ZERO API costs
 */
router.post('/moderate-content', async (req, res) => {
  try {
    const { content, contentType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Use local AI moderation
    const moderation = await localAI.moderateContent(content);

    res.json({
      safe: moderation.safe,
      flagged: moderation.flagged,
      categories: moderation.categories,
      recommendation: moderation.recommendation,
      confidence: moderation.confidence,
      model: 'local-ai',
      cost: 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Moderation error:', error.message);
    res.status(500).json({
      error: 'Moderation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mico/analyze-image
 * Analyze image content using LOCAL AI - ZERO API costs
 */
router.post('/analyze-image', async (req, res) => {
  try {
    const { imageUrl, question } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Use local AI for image analysis
    const analysis = await localAI.analyzeImage(imageUrl, question || 'Analyze this image');

    res.json({
      analysis,
      imageUrl,
      question,
      model: 'local-ai',
      cost: 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image analysis error:', error.message);
    res.status(500).json({
      error: 'Image analysis failed',
      message: error.message
    });
  }
});

// OLD CODE REMOVED - keeping structure for potential migration
router.post('/analyze-image-OLD-EXTERNAL-API', async (req, res) => {
  try {
    const { imageUrl, question } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // THIS REQUIRES OPENAI API KEY - DISABLED
    res.status(501).json({
      error: 'External API disabled',
      message: 'Using local AI instead - call /api/mico/analyze-image',
      migration: 'Use the main endpoint instead'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
