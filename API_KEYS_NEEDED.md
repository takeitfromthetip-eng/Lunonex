# 🔑 API Keys Setup Guide - ForTheWeebs

## Already Have These ✅
- ✅ OpenAI (GPT-4, DALL-E 3, Shap-E)
- ✅ Anthropic (Claude for Mico)
- ✅ Supabase (Database)
- ✅ Stripe (Payments)

---

## Need to Get These 🚨

### 1. **Replicate** (AI Models)
**What it's for:** Demucs v4 (stem separation), MusicGen (AI instruments), SAM (object selection), video models

**Signup:** https://replicate.com/signin

**Steps:**
1. Sign in with GitHub
2. Go to Account → API Tokens
3. Click "Create token"
4. Copy token starting with `r8_...`
5. Add to `.env`: `REPLICATE_API_TOKEN=r8_xxxxx`

**Pricing:** Pay-per-use, ~$0.001-0.02 per prediction (CHEAP AS FUCK)

---

### 2. **LANDR Audio** (AI Mastering)
**What it's for:** Professional audio mastering (replaces $29/month service)

**Signup:** https://www.landr.com/api

**Steps:**
1. Create LANDR account
2. Contact LANDR API team at `api@landr.com` for API access
3. They'll provide API key and documentation
4. Add to `.env`: `LANDR_API_KEY=xxxxx`

**Pricing:** Negotiable - contact for developer pricing

**Alternative if unavailable:** Use Cloudinary Audio API or Dolby.io Media API

---

### 3. **Spotify Web API** (BPM Detection)
**What it's for:** Tempo/BPM detection for music tracks

**Signup:** https://developer.spotify.com/dashboard

**Steps:**
1. Log in with Spotify account
2. Click "Create app"
3. Name: "ForTheWeebs Audio Tools"
4. Description: "BPM detection for music production"
5. Redirect URI: `http://localhost:3001/callback`
6. Copy Client ID and Client Secret
7. Add to `.env`:
```
SPOTIFY_CLIENT_ID=xxxxx
SPOTIFY_CLIENT_SECRET=xxxxx
```

**Pricing:** FREE (with rate limits)

---

### 4. **Melodyne/Celemony API** (Pitch Correction)
**What it's for:** Auto-Tune / pitch correction

**Signup:** Contact Celemony directly - https://www.celemony.com/en/contact

**Steps:**
1. Email `info@celemony.com` requesting API access
2. Mention you're building a web-based music production platform
3. They may provide SDK or API documentation
4. Add to `.env`: `MELODYNE_API_KEY=xxxxx`

**Pricing:** License-based - negotiate with Celemony

**Alternative:** Use Accusonus ERA-D or build custom pitch correction with Web Audio API

---

### 5. **Blockade Labs** (AI Skybox/Environment Generation)
**What it's for:** 360° VR environment generation from text

**Signup:** https://www.blockadelabs.com/

**Steps:**
1. Sign up for account
2. Go to API Dashboard
3. Generate API key
4. Add to `.env`: `BLOCKADE_API_KEY=xxxxx`

**Pricing:** Free tier: 100 skyboxes/month, Paid: $20/month unlimited

---

### 6. **Meshy.ai** (3D Mesh Optimization)
**What it's for:** Optimize 3D models for VR/mobile performance

**Signup:** https://www.meshy.ai/

**Steps:**
1. Create account
2. Navigate to API section
3. Generate API key
4. Add to `.env`: `MESHY_API_KEY=xxxxx`

**Pricing:** Free tier: 200 credits/month, Pro: $16/month

---

### 7. **Stability AI** (SDXL, Image Models)
**What it's for:** Generative fill, inpainting, outpainting, image generation

**Signup:** https://platform.stability.ai/

**Steps:**
1. Create account
2. Go to API Keys section
3. Generate new key
4. Add to `.env`: `STABILITY_API_KEY=sk-xxxxx`

**Pricing:** $10 for ~5,000 images (cheap as hell)

---

### 8. **ElevenLabs** (Voice Cloning - Optional Feature)
**What it's for:** AI voice cloning for voiceovers, character voices

**Signup:** https://elevenlabs.io/

**Steps:**
1. Sign up
2. Go to Profile → API Key
3. Copy API key
4. Add to `.env`: `ELEVENLABS_API_KEY=xxxxx`

**Pricing:** Free: 10k characters/month, Starter: $5/month 30k characters

---

### 9. **DistroKid API** (Music Distribution - Optional)
**What it's for:** Distribute music to Spotify, Apple Music, etc.

**Signup:** https://distrokid.com/

**Steps:**
1. Get DistroKid account ($20/year)
2. Contact support for API access (they don't have public API)
3. Alternative: Use RouteNote or Ditto Music APIs

**Pricing:** $20/year for unlimited uploads

---

## Environment Variables Template

Add these to your `.env` file:

```env
# Existing
VITE_OPENAI_API_KEY=sk-xxxxx
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# NEW - Audio Production
REPLICATE_API_TOKEN=r8_xxxxx
LANDR_API_KEY=xxxxx
SPOTIFY_CLIENT_ID=xxxxx
SPOTIFY_CLIENT_SECRET=xxxxx
MELODYNE_API_KEY=xxxxx

# NEW - VR/AR Production
BLOCKADE_API_KEY=xxxxx
MESHY_API_KEY=xxxxx

# NEW - Graphic Design
STABILITY_API_KEY=sk-xxxxx

# OPTIONAL - Future Features
ELEVENLABS_API_KEY=xxxxx
DISTROKID_API_KEY=xxxxx
```

---

## Cost Estimate (Monthly at 1000 Users)

| Service | Free Tier | Estimated Monthly Cost |
|---------|-----------|----------------------|
| Replicate | None | ~$50-200 (pay-per-use) |
| LANDR | None | Negotiated rate |
| Spotify API | Free | $0 |
| Melodyne | None | License fee (one-time?) |
| Blockade Labs | 100/month | $20 |
| Meshy.ai | 200 credits | $16 |
| Stability AI | None | ~$100-300 |
| ElevenLabs | 10k chars | $0-$5 |
| DistroKid | N/A | $20/year |

**Total:** ~$200-550/month at scale (CRUSHING $44,678 competitor cost)

---

## Testing Without API Keys

Most endpoints have fallback responses for testing:
- Mock data returned when API keys missing
- Console warnings show which keys needed
- Front-end still works, just shows "Connect API" messages

**Priority Order:**
1. **CRITICAL:** Replicate (most AI features), Stability AI (graphic design)
2. **HIGH:** Blockade Labs (VR), Meshy.ai (VR), Spotify (music)
3. **MEDIUM:** LANDR (can use alternatives), ElevenLabs (optional feature)
4. **LOW:** Melodyne (can build Web Audio fallback), DistroKid (future feature)
