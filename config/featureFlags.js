/**
 * Feature Flags Configuration
 * Controls which features are enabled based on API key availability
 */

class FeatureFlags {
  constructor() {
    // Check if CSAM detection is configured (PhotoDNA OR alternatives)
    this.hasPhotoDNA = !!process.env.PHOTODNA_API_KEY && process.env.PHOTODNA_API_KEY !== 'your_photodna_key_here';
    
    // Check for Google Vision API credentials file
    const fs = require('fs');
    const path = require('path');
    const googleCredsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './config/google-vision-key.json';
    const fullPath = path.resolve(__dirname, '..', googleCredsPath);
    this.hasGoogleVision = fs.existsSync(fullPath);
    
    console.log('🔍 Google Vision check:');
    console.log('  - GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('  - Resolved path:', fullPath);
    console.log('  - File exists:', this.hasGoogleVision);
    
    this.hasAWSRekognition = !!process.env.AWS_REKOGNITION_KEY && process.env.AWS_REKOGNITION_KEY !== 'your_aws_key_here';
    this.hasAzureModerator = !!process.env.AZURE_MODERATOR_KEY && process.env.AZURE_MODERATOR_KEY !== 'your_azure_key_here';
    this.hasClarifai = !!process.env.CLARIFAI_API_KEY && process.env.CLARIFAI_API_KEY !== 'your_clarifai_key_here';
    
    // ANY CSAM detection service enables social features
    this.hasCSAMDetection = this.hasPhotoDNA || this.hasGoogleVision || this.hasAWSRekognition || this.hasAzureModerator || this.hasClarifai;
    
    console.log('  - hasCSAMDetection:', this.hasCSAMDetection);

    // Check if other required keys exist
    this.hasOpenAI = !!process.env.OPENAI_API_KEY;
    this.hasStripe = !!process.env.STRIPE_SECRET_KEY;
    // Accept either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
    this.hasSupabase = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
  }

  /**
   * Social Media Features - REQUIRES CSAM Detection
   * These features allow user-generated content and must have CSAM detection
   * Accepts: PhotoDNA, Google Vision, AWS Rekognition, Azure Moderator, or Clarifai
   */
  get socialMediaEnabled() {
    return this.hasCSAMDetection && this.hasSupabase;
  }

  /**
   * Creator Economy Features - REQUIRES CSAM Detection + Stripe
   * Adult content monetization requires CSAM protection
   * Accepts: PhotoDNA, Google Vision, AWS Rekognition, Azure Moderator, or Clarifai
   */
  get creatorEconomyEnabled() {
    return this.hasCSAMDetection && this.hasStripe && this.hasSupabase;
  }

  /**
   * Creator Tools - AVAILABLE NOW
   * These tools don't require PhotoDNA
   */
  get creatorToolsEnabled() {
    return this.hasSupabase;
  }

  /**
   * AI Features - AVAILABLE if OpenAI key exists
   */
  get aiModerationEnabled() {
    return this.hasOpenAI;
  }

  /**
   * Get list of disabled features with reasons
   */
  getDisabledFeatures() {
    const disabled = [];

    if (!this.socialMediaEnabled) {
      disabled.push({
        feature: 'Social Media Platform',
        reason: !this.hasCSAMDetection
          ? 'CSAM detection API key required (Google Vision, AWS Rekognition, Azure Moderator, Clarifai, or PhotoDNA)'
          : 'Supabase not configured',
        endpoint: '/api/posts',
        status: 'BLOCKED'
      });
    }

    if (!this.creatorEconomyEnabled) {
      disabled.push({
        feature: 'Creator Economy',
        reason: !this.hasCSAMDetection
          ? 'CSAM detection API key required (Google Vision, AWS Rekognition, Azure Moderator, Clarifai, or PhotoDNA)'
          : !this.hasStripe
          ? 'Stripe API key not configured'
          : 'Supabase not configured',
        endpoint: '/api/subscriptions',
        status: 'BLOCKED'
      });
    }

    return disabled;
  }

  /**
   * Get feature status (simpler version for health checks)
   */
  getStatus() {
    return {
      socialMedia: this.socialMediaEnabled,
      creatorEconomy: this.creatorEconomyEnabled,
      creatorTools: this.creatorToolsEnabled,
      aiModeration: this.aiModerationEnabled
    };
  }

  /**
   * Get configuration status report
   */
  getConfigStatus() {
    return {
      ready: this.socialMediaEnabled && this.creatorEconomyEnabled,
      social: this.socialMediaEnabled,
      economy: this.creatorEconomyEnabled,
      tools: this.creatorToolsEnabled,
      ai: this.aiModerationEnabled,
      keys: {
        csamDetection: this.hasCSAMDetection ? '✅' : '❌ REQUIRED FOR LAUNCH (Any of: Google Vision, AWS Rekognition, Azure Moderator, Clarifai, PhotoDNA)',
        photoDNA: this.hasPhotoDNA ? '✅' : '❌ (Optional - use alternatives instead)',
        googleVision: this.hasGoogleVision ? '✅' : '❌ (Recommended - 1,000 free/month)',
        awsRekognition: this.hasAWSRekognition ? '✅' : '❌ (Recommended - 5,000 free/month)',
        azureModerator: this.hasAzureModerator ? '✅' : '❌ (Recommended - 5,000 free/month)',
        clarifai: this.hasClarifai ? '✅' : '❌ (Optional - 1,000 free/month)',
        openAI: this.hasOpenAI ? '✅' : '⚠️ Optional',
        stripe: this.hasStripe ? '✅' : '⚠️ Optional',
        supabase: this.hasSupabase ? '✅' : '❌ REQUIRED'
      }
    };
  }

  /**
   * Middleware to block social media endpoints until CSAM detection is configured
   */
  requirePhotoDNA(req, res, next) {
    if (!this.socialMediaEnabled) {
      return res.status(503).json({
        error: 'Social media features not available',
        reason: 'CSAM detection API key required',
        message: 'Add any of these to your .env file: GOOGLE_VISION_API_KEY, AWS_REKOGNITION_KEY, AZURE_MODERATOR_KEY, CLARIFAI_API_KEY, or PHOTODNA_API_KEY',
        setup: 'See PHOTODNA-ALTERNATIVES.md for setup instructions (5 minutes)',
        disabledFeatures: this.getDisabledFeatures()
      });
    }
    next();
  }

  /**
   * Middleware to block creator economy until CSAM detection + Stripe configured
   */
  requireCreatorEconomy(req, res, next) {
    if (!this.creatorEconomyEnabled) {
      return res.status(503).json({
        error: 'Creator economy features not available',
        reason: this.getDisabledFeatures().find(f => f.feature === 'Creator Economy')?.reason,
        message: 'This feature will be enabled once all requirements are met',
        setup: 'Add CSAM detection key (Google Vision, AWS, Azure, Clarifai, or PhotoDNA) and STRIPE_SECRET_KEY to your .env file'
      });
    }
    next();
  }
}

// Singleton instance
const featureFlags = new FeatureFlags();

module.exports = {
  featureFlags,
  requirePhotoDNA: featureFlags.requirePhotoDNA.bind(featureFlags),
  requireCreatorEconomy: featureFlags.requireCreatorEconomy.bind(featureFlags)
};
