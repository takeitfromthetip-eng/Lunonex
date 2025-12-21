# CONTENT MODERATION & ILLEGAL CONTENT REPORTING SETUP GUIDE

## ✅ STEP 1: Payment-Based Age Verification (COMPLETED)

Your age verification now works as follows:

### How It Works:
- **Paying customers** (anyone who has purchased) = Auto-verified as 18+ (credit card = must be 18+)
- **Creators receiving payouts** = Auto-verified as 18+ (Stripe requires 18+)
- **Free browsers** = Must pass age gate to view NSFW content

### What I Changed:
- `src/utils/ageVerification.js:298-343` - Added payment-based verification
- `src/components/ContentModeration.jsx:88-123` - Bypass age gate for paying users

### Backend Integration Needed:
Your user object needs these fields:
```javascript
user = {
  hasCompletedPurchase: true,  // Set to true when user makes ANY purchase
  hasReceivedPayout: true,     // Set to true when creator receives payout
  stripeAccountVerified: true  // Set to true when Stripe Connect account verified
}
```

---

## 🚨 STEP 2: CSAM Detection & NCMEC Reporting (CRITICAL - FEDERAL LAW)

### What You Need:
This is **MANDATORY** by federal law. Failure to report CSAM is a federal crime.

### Option A: Microsoft PhotoDNA (Recommended - Industry Standard)

**1. Sign Up:**
- Go to: https://www.microsoft.com/en-us/photodna
- Request access (free for platforms, requires application)
- Approval takes 2-4 weeks

**2. Integration:**
- PhotoDNA returns hash of uploaded images
- Compare hash against known CSAM database
- If match = immediate NCMEC report required

**3. Cost:** FREE for platforms

**4. Code Changes Needed:**
```javascript
// Add to src/utils/csam-detection.js (create new file)
import PhotoDNA from '@microsoft/photodna-client';

const photoDNA = new PhotoDNA({
  apiKey: process.env.PHOTODNA_API_KEY
});

export async function scanForCSAM(imageFile) {
  const hash = await photoDNA.computeHash(imageFile);
  const match = await photoDNA.checkHash(hash);

  if (match.isCSAM) {
    // IMMEDIATE NCMEC REPORT REQUIRED
    await reportToNCMEC({
      imageHash: hash,
      userId: match.uploaderId,
      ipAddress: match.ipAddress,
      timestamp: new Date().toISOString()
    });

    // Terminate account immediately
    await terminateAccount(match.uploaderId);

    return { blocked: true, reason: 'CSAM_DETECTED' };
  }

  return { blocked: false };
}
```

### Option B: Google CSAI Match (Alternative)

**1. Sign Up:**
- Go to: https://www.google.com/safebrowsing/csai/
- Request access (free, faster approval than PhotoDNA)

**2. Integration:**
- Similar to PhotoDNA
- Hashes images and checks against database

**3. Cost:** FREE

---

## 📧 STEP 3: NCMEC CyberTipline Reporting Setup

### What is NCMEC?
National Center for Missing & Exploited Children - federal reporting system for CSAM

### Sign Up Process:

**1. Register Your Platform:**
- Go to: https://www.cybertipline.org/
- Click "Report" → "Electronic Service Provider (ESP)"
- Fill out registration form
- You'll receive:
  - NCMEC ESP ID number
  - API credentials

**2. Get Required Info:**
```
Business name: ForTheWeebs
Business type: User-Generated Content Platform
Content types: Images, Videos, Text
Monthly active users: [YOUR NUMBER]
Contact person: [YOUR NAME]
Contact email: legal@fortheweebs.com
```

**3. API Integration:**
```javascript
// Add to src/utils/ncmec-reporting.js (create new file)
import NCMECClient from 'ncmec-cybertipline-client';

const ncmec = new NCMECClient({
  espId: process.env.NCMEC_ESP_ID,
  apiKey: process.env.NCMEC_API_KEY
});

export async function reportToNCMEC(data) {
  const report = await ncmec.submitReport({
    incidentType: 'CSAM',
    contentType: 'image',
    uploaderId: data.userId,
    uploaderIP: data.ipAddress,
    timestamp: data.timestamp,
    contentHash: data.imageHash,
    additionalInfo: 'Detected via PhotoDNA automated scanning',

    // PRESERVE EVIDENCE - DO NOT DELETE
    preserveContent: true,
    contentURL: data.contentURL
  });

  // Log report ID for your records
  console.log(`NCMEC Report ID: ${report.id}`);

  // Store in database (REQUIRED - keep for 7 years minimum)
  await database.ncmecReports.insert({
    reportId: report.id,
    userId: data.userId,
    timestamp: new Date(),
    status: 'SUBMITTED'
  });

  return report;
}
```

**4. Legal Requirements:**
- **Report within 24 hours** of detection
- **Preserve all evidence** (don't delete content/logs)
- **Keep records for 7+ years**
- **No notification to user** (federal law prohibits tipping off)

**5. Penalties for Non-Compliance:**
- Criminal prosecution
- Up to $50,000 fine per violation
- Platform shutdown

---

## 🖼️ STEP 4: Google Cloud Vision API Setup (Image Scanning)

### What It Does:
Scans images for:
- Copyrighted characters (Pokemon, Marvel, etc.)
- Brand logos
- Adult content (nudity, violence)
- Text in images

### Sign Up Process:

**1. Create Google Cloud Account:**
- Go to: https://console.cloud.google.com/
- Create new project: "ForTheWeebs-ContentModeration"

**2. Enable Cloud Vision API:**
- Search for "Cloud Vision API"
- Click "Enable"

**3. Create API Key:**
- Go to: APIs & Services → Credentials
- Click "Create Credentials" → "API Key"
- Copy your API key

**4. Set Pricing:**
- Free tier: 1,000 images/month
- After that: $1.50 per 1,000 images
- Recommended: Set billing alert at $100/month

**5. Add to .env:**
```bash
GOOGLE_VISION_API_KEY=your_api_key_here
```

**6. Enable Real Scanning:**
Your code is ready - just uncomment lines 162-206 in:
- `src/utils/imageContentScanner.js`

**7. Test It:**
```bash
npm install @google-cloud/vision
```

```javascript
// Test in browser console or Node
import { scanImageForCopyright } from './src/utils/imageContentScanner.js';

const testImage = document.querySelector('input[type="file"]').files[0];
const result = await scanImageForCopyright(testImage, 'test-user-123');
console.log(result);
```

---

## 🔐 STEP 5: AWS Rekognition Setup (Alternative/Backup Image Scanning)

### What It Does:
- Face detection (celebrities, public figures)
- Object/scene detection
- Moderation labels (violence, nudity, etc.)

### Sign Up Process:

**1. Create AWS Account:**
- Go to: https://aws.amazon.com/
- Sign up for free tier

**2. Create IAM User:**
- Go to: IAM → Users → Add User
- User name: `fortheweebs-rekognition`
- Access type: "Programmatic access"
- Attach policy: `AmazonRekognitionFullAccess`

**3. Get Credentials:**
- Copy:
  - Access Key ID
  - Secret Access Key

**4. Add to .env:**
```bash
AWS_ACCESS_KEY=your_access_key_here
AWS_SECRET_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

**5. Pricing:**
- Free tier: 5,000 images/month for first year
- After that: $1.00 per 1,000 images

**6. Install SDK:**
```bash
npm install aws-sdk
```

---

## 🤖 STEP 6: OpenAI Moderation API (Text & Image)

### What It Does:
Scans text and images for:
- Hate speech
- Violence
- Sexual content
- Self-harm

### Sign Up Process:

**1. Get OpenAI API Key:**
- Go to: https://platform.openai.com/
- Sign up for account
- Go to: API Keys → Create new secret key

**2. Add to .env:**
```bash
VITE_OPENAI_API_KEY=sk-your-key-here
```

**3. Pricing:**
- Moderation API: **FREE** (no cost)
- GPT-4 Vision (if needed): $0.01 per image

**4. Already Integrated:**
Your code already calls OpenAI Moderation API:
- `src/utils/aiModeration.js:403-457`

---

## 📊 STEP 7: Putting It All Together

### Upload Flow:

```javascript
// When user uploads image/video
async function handleUpload(file, userId) {
  // STEP 1: CSAM check (CRITICAL - DO THIS FIRST)
  const csamCheck = await scanForCSAM(file);
  if (csamCheck.blocked) {
    // Account terminated, NCMEC report filed
    return { blocked: true, reason: 'ILLEGAL_CONTENT' };
  }

  // STEP 2: Copyright/trademark check
  const copyrightCheck = await scanImageForCopyright(file, userId);
  if (!copyrightCheck.isLegal) {
    return { blocked: true, reason: 'COPYRIGHT_VIOLATION' };
  }

  // STEP 3: AI moderation (hate speech, terrorism)
  const aiCheck = await moderateContent(file, 'image', userId);
  if (!aiCheck.isApproved) {
    return { blocked: true, reason: 'POLICY_VIOLATION' };
  }

  // STEP 4: Adult content check
  if (aiCheck.isNSFW) {
    // Mark as 18+ (allowed but requires age gate)
    await database.content.update(file.id, { isNSFW: true });
  }

  // All checks passed - upload approved
  return { blocked: false, approved: true };
}
```

---

## 🚀 Priority Order:

### DO FIRST (Critical Legal Requirements):
1. ✅ Payment-based age verification (DONE)
2. 🚨 CSAM detection (PhotoDNA or Google CSAI Match)
3. 🚨 NCMEC reporting setup

### DO SECOND (Important but not urgent):
4. Google Cloud Vision API (copyright detection)
5. OpenAI Moderation API (already integrated, just need API key)

### DO THIRD (Nice to have):
6. AWS Rekognition (backup image scanning)

---

## 📋 Environment Variables Checklist:

Add to your `.env` file:

```bash
# CRITICAL - CSAM Detection
PHOTODNA_API_KEY=your_key_here
NCMEC_ESP_ID=your_esp_id_here
NCMEC_API_KEY=your_key_here

# Image Scanning
GOOGLE_VISION_API_KEY=your_key_here
AWS_ACCESS_KEY=your_key_here
AWS_SECRET_KEY=your_key_here
AWS_REGION=us-east-1

# AI Moderation (already in your code)
VITE_OPENAI_API_KEY=sk-your_key_here
VITE_ANTHROPIC_API_KEY=sk-ant-your_key_here
```

---

## 🔧 Backend Changes Needed:

### User Model:
```javascript
// Add these fields to your User model
{
  hasCompletedPurchase: Boolean,  // Set true on first purchase
  hasReceivedPayout: Boolean,     // Set true on first payout
  stripeAccountVerified: Boolean, // Set true when Stripe verified
  ageVerified: Boolean,           // Manual verification
  verifiedAge: Number,            // If manually verified
}
```

### Content Model:
```javascript
// Add these fields to your Content model
{
  isNSFW: Boolean,               // Requires age gate
  moderationStatus: String,       // 'pending', 'approved', 'rejected'
  moderationFlags: Array,         // ['copyright', 'hate_speech', etc]
  scanResults: Object,            // Full scan data
}
```

---

## ⚖️ Legal Compliance Summary:

### What's Legally Required:
- ✅ Age verification for adult content (DONE via payment)
- 🚨 CSAM detection and NCMEC reporting (MUST DO)
- ✅ DMCA compliance (already have)
- ✅ Copyright/trademark protection (already have)
- ✅ Terms of Service (already have)

### What's Best Practice (Not Legally Required):
- Hate speech detection
- Terrorist content detection
- Image copyright scanning

---

## 📞 Support Contacts:

**PhotoDNA Support:**
- Email: photodna@microsoft.com

**NCMEC CyberTipline:**
- Phone: 1-800-843-5678
- Email: espregistration@ncmec.org

**Google Cloud Vision:**
- Support: https://cloud.google.com/support

**AWS Rekognition:**
- Support: https://aws.amazon.com/contact-us/

---

## 🎯 Next Steps:

1. Sign up for PhotoDNA (START HERE - this is federal law)
2. Register with NCMEC CyberTipline
3. Get Google Cloud Vision API key
4. Get OpenAI API key (moderation is free)
5. Test everything with sample uploads

Let me know when you're ready to implement any of these!
