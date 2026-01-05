/**
 * AI Proxy - Routes all AI requests through Mico AI agent
 * Handles job queuing, status tracking, and result persistence
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const MICO_BASE_URL = process.env.MICO_BASE_URL || 'http://localhost:3001/api/mico';

class AIProxy {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Generate content using Mico AI
   */
  async generate(type, prompt, options = {}) {
    try {
      // Route to Mico AI chat endpoint
      const response = await axios.post(`${MICO_BASE_URL}/chat`, {
        message: prompt,
        systemPrompt: this.getSystemPrompt(type),
        context: options.context || []
      });

      return {
        result: response.data.response,
        id: Date.now(),
        type,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI generation failed:', error.message);
      return {
        result: `Generated ${type}: ${prompt}`,
        id: Date.now(),
        fallback: true
      };
    }
  }

  /**
   * Create async job for processing
   */
  async createJob(type, data, userId) {
    const jobId = Date.now().toString();

    // Store job in database
    const { error } = await supabase.from('ai_jobs').insert({
      id: jobId,
      type,
      status: 'queued',
      input_data: data,
      user_id: userId,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to create job:', error);
    }

    // Start processing in background
    this.processJob(jobId, type, data).catch(err => {
      console.error('Job processing failed:', err);
    });

    return { jobId };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    const { data, error } = await supabase
      .from('ai_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return { status: 'not_found' };
    }

    return {
      status: data.status,
      result: data.result,
      error: data.error,
      progress: data.progress || 0,
      created_at: data.created_at,
      completed_at: data.completed_at
    };
  }

  /**
   * Process job async
   */
  async processJob(jobId, type, data) {
    try {
      // Update status to processing
      await supabase.from('ai_jobs').update({
        status: 'processing',
        progress: 10
      }).eq('id', jobId);

      let result;

      // Route based on job type
      switch (type) {
        case 'color-grading':
        case 'video-effects':
        case 'video-upscale':
        case 'video-clipper':
          result = await this.processVideo(data);
          break;

        case 'voice-cloning':
        case 'voice-isolation':
        case 'music-from-hum':
          result = await this.processAudio(data);
          break;

        case 'thumbnail':
        case 'background-removal':
        case 'photo-enhancer':
        case 'generative-fill':
          result = await this.processImage(data);
          break;

        default:
          result = await this.generate(type, data.prompt || JSON.stringify(data));
      }

      // Update job as completed
      await supabase.from('ai_jobs').update({
        status: 'completed',
        result,
        progress: 100,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);

      // Update job as failed
      await supabase.from('ai_jobs').update({
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);
    }
  }

  /**
   * Process video content
   */
  async processVideo(data) {
    // Use Mico AI for video analysis
    const response = await axios.post(`${MICO_BASE_URL}/analyze-image`, {
      imageUrl: data.videoUrl || data.url,
      question: 'Analyze this video frame and suggest improvements'
    });

    return {
      processed: true,
      analysis: response.data.analysis,
      url: data.videoUrl || data.url
    };
  }

  /**
   * Process audio content
   */
  async processAudio(data) {
    // Use Mico AI for audio processing
    const response = await axios.post(`${MICO_BASE_URL}/generate-content`, {
      prompt: `Process audio: ${data.audioUrl || data.url}`,
      type: 'script'
    });

    return {
      processed: true,
      result: response.data.content,
      url: data.audioUrl || data.url
    };
  }

  /**
   * Process image content
   */
  async processImage(data) {
    // Use Mico AI for image analysis
    const response = await axios.post(`${MICO_BASE_URL}/analyze-image`, {
      imageUrl: data.imageUrl || data.url,
      question: data.instruction || 'Process and enhance this image'
    });

    return {
      processed: true,
      analysis: response.data.analysis,
      url: data.imageUrl || data.url
    };
  }

  /**
   * Get system prompt for content type
   */
  getSystemPrompt(type) {
    const prompts = {
      'ad': 'You are an advertising expert. Create compelling ad copy that drives conversions.',
      'avatar': 'You are an avatar designer. Describe unique avatar designs with detailed visual elements.',
      'meeting': 'You are a meeting summarizer. Extract key points, action items, and decisions.',
      'meme': 'You are a meme creator. Generate funny, relatable meme text.',
      'script': 'You are a scriptwriter. Write engaging scripts with clear structure and dialogue.',
      'subtitle': 'You are a subtitle editor. Create accurate subtitles with appropriate emoji placement.',
      'content': 'You are a content creator. Generate engaging, platform-appropriate content.',
      'seo': 'You are an SEO expert. Optimize content for search engines and user engagement.'
    };

    return prompts[type] || 'You are a helpful AI assistant for creative content generation.';
  }
}

module.exports = new AIProxy();
