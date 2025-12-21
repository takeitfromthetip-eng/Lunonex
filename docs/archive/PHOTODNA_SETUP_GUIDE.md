# 🔐 PhotoDNA Setup Guide - Unlock Social Media Features

**Status:** Social media features are currently **DISABLED** until PhotoDNA is configured.

**Why?** PhotoDNA provides CSAM (Child Sexual Abuse Material) detection, which is **legally required** before allowing user-generated content.

---

## 🎯 Quick Setup (5 Minutes)

### **Step 1: Get PhotoDNA API Key**

1. **Apply for PhotoDNA Access:**
   - **Microsoft PhotoDNA:** https://www.microsoft.com/en-us/photodna
   - **Alternative:** Google CSAI Match API: https://protectchildren.ca/csai-match

2. **Wait for Approval:**
   - Microsoft typically responds in **2-4 weeks**
   - Google CSAI Match: **1-2 weeks**

3. **Receive API Credentials:**
   - You'll get:
     - `PHOTODNA_API_KEY` or `PHOTODNA_SUBSCRIPTION_KEY`
     - API endpoint URL
     - Documentation

---

### **Step 2: Add API Key to .env File**

1. **Open `.env` file** in your project root

2. **Add this line:**
   ```env
   PHOTODNA_API_KEY=your_actual_api_key_here
   ```

3. **Or for Microsoft Azure:**
   ```env
   PHOTODNA_SUBSCRIPTION_KEY=your_azure_subscription_key
   PHOTODNA_ENDPOINT=https://yourservice.cognitiveservices.azure.com
   ```

4. **Save the file**

---

### **Step 3: Restart Server**

```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev:server
```

**Expected Output:**
```
✅ Posts (Feed)
✅ Comments & Replies
✅ Friends & Follows
✅ Direct Messages
✅ Notifications
```

If you see `🔒 Posts (Feed) (blocked until PhotoDNA configured)` then the key is not set correctly.

---

### **Step 4: Verify Social Media is Enabled**

1. **Check health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Look for:**
   ```json
   {
     "status": "OK",
     "features": {
       "socialMedia": "ENABLED",  ← Should say ENABLED
       "apiKeys": {
         "photoDNA": "✅"  ← Should show checkmark
       }
     }
   }
   ```

3. **Or check feature status:**
   ```bash
   curl http://localhost:3000/api/features/status
   ```

---

### **Step 5: Test in Frontend**

1. **Start frontend:**
   ```bash
   npm run dev
   ```

2. **Navigate to Social Feed**

3. **You should see:**
   - ✅ No more "Feature Disabled" banner
   - ✅ Can create posts
   - ✅ Can comment
   - ✅ Can like posts
   - ✅ Can send messages

---

## 🚨 While Waiting for PhotoDNA Approval

### **What's Available NOW (Without PhotoDNA):**

✅ **20+ Creator Tools:**
- 📊 Analytics Dashboard
- 🎨 Content Generator
- 🎯 SEO Optimizer
- 📝 Script Writer
- 🖼️ Image Tools
- 🎵 Music Generator
- And 15 more...

✅ **AI-Powered Features:**
- 🤖 AI Content Assistant
- 🔍 Smart Search
- 📈 Performance Analytics
- 🎭 Character Generator

✅ **Monetization Setup:**
- 💳 Stripe Integration (ready)
- 💰 Payment Processing
- 📊 Revenue Analytics
- 🏦 Payout Management

✅ **Admin Tools:**
- 👑 Owner Dashboard
- 🔒 Mico Governance System
- 📊 Metrics & Monitoring
- 🛡️ Security Controls

---

### **What's BLOCKED (Requires PhotoDNA):**

🔒 **Social Media Platform:**
- ❌ Posts & Feed
- ❌ Comments & Replies
- ❌ Direct Messages
- ❌ Friend Requests
- ❌ User Follows

🔒 **Creator Economy:**
- ❌ Paid Subscriptions (for adult content)
- ❌ Paid Posts
- ❌ Content Monetization

**Why Blocked?**
User-generated content (especially adult content) requires CSAM detection by law. PhotoDNA protects both you and your users.

---

## 🎯 Launch Strategy

### **Phase 1: Launch Creator Tools NOW** ✅

You can launch **today** with:
- Creator tools
- AI features
- Admin dashboard
- Analytics
- Everything except social media

**Who benefits:**
- Content creators
- Designers
- Writers
- Musicians
- Developers

### **Phase 2: Launch Social Media AFTER PhotoDNA** 🔒

Once PhotoDNA is approved (2-4 weeks):
1. Add API key to `.env`
2. Restart server
3. Social media automatically unlocks
4. Launch social platform

---

## 🔧 Advanced Configuration

### **Environment Variables:**

```env
# Required for social media
PHOTODNA_API_KEY=your_key_here

# Optional: Custom endpoint
PHOTODNA_ENDPOINT=https://custom.endpoint.com

# Optional: Threshold (0.0 - 1.0, default 0.7)
PHOTODNA_THRESHOLD=0.7

# Optional: Enable detailed logging
PHOTODNA_VERBOSE=true
```

### **Feature Flags (Automatic):**

The system automatically detects PhotoDNA configuration:

```javascript
// config/featureFlags.js
this.hasPhotoDNA = !!process.env.PHOTODNA_API_KEY;
this.socialMediaEnabled = this.hasPhotoDNA && this.hasSupabase;
```

No code changes needed - just add the API key!

---

## 🧪 Testing PhotoDNA Integration

### **Test 1: Verify API Key Works**

```bash
# Test PhotoDNA endpoint
curl -X POST http://localhost:3000/api/moderation/test \
  -H "Content-Type: application/json" \
  -d '{"image":"https://example.com/test.jpg"}'
```

Expected: `{ "status": "OK", "photoDNA": "active" }`

### **Test 2: Upload Safe Image**

```bash
# Upload a safe test image
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@safe_test.jpg"
```

Expected: `{ "success": true, "url": "..." }`

### **Test 3: Try Social Media Endpoint**

```bash
# Try creating a post
curl -X POST http://localhost:3000/api/posts/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body":"Test post","visibility":"PUBLIC"}'
```

**Before PhotoDNA:**
```json
{
  "error": "Social media features not available",
  "reason": "PhotoDNA API key required for CSAM detection"
}
```

**After PhotoDNA:**
```json
{
  "id": "abc123",
  "body": "Test post",
  "createdAt": "2025-01-15T..."
}
```

---

## 🆘 Troubleshooting

### **Problem: Social Media Still Blocked After Adding Key**

**Check 1: Key Format**
```bash
# .env should have NO quotes
❌ PHOTODNA_API_KEY="abc123"
✅ PHOTODNA_API_KEY=abc123
```

**Check 2: Server Restarted?**
```bash
# Must restart server after .env changes
npm run dev:server
```

**Check 3: Key is Valid**
```bash
# Test key directly
curl -H "Ocp-Apim-Subscription-Key: YOUR_KEY" \
  https://YOUR_ENDPOINT/contentmoderator/moderate/v1.0/ProcessImage/Evaluate
```

### **Problem: "PhotoDNA API Error"**

**Fix 1: Check Endpoint**
```env
# Make sure endpoint matches your region
PHOTODNA_ENDPOINT=https://eastus.api.cognitive.microsoft.com
```

**Fix 2: Check Azure Subscription**
- Go to Azure Portal
- Check if service is active
- Verify subscription key is correct

**Fix 3: Check Rate Limits**
- Free tier: 10 requests/minute
- Paid tier: Higher limits
- May need to upgrade

### **Problem: Frontend Still Shows "Feature Disabled"**

**Fix 1: Clear Browser Cache**
```javascript
// In browser console
localStorage.clear();
location.reload();
```

**Fix 2: Force Feature Check**
```javascript
// In browser console
featureDetector.checkFeatures().then(console.log);
```

---

## 📞 Support

### **PhotoDNA Application Help:**
- **Microsoft:** https://www.microsoft.com/en-us/photodna
- **NCMEC Partnership:** https://www.missingkids.org/theissues/csam
- **Email Support:** ncmec@ncmec.org

### **API Integration Help:**
- **Azure Support:** https://azure.microsoft.com/support/
- **Documentation:** https://docs.microsoft.com/en-us/azure/cognitive-services/content-moderator/

### **Legal Compliance:**
- **2257 Compliance:** https://www.justice.gov/criminal-ceos/18-usc-2257
- **CSAM Laws:** https://www.justice.gov/criminal-ceos/child-pornography

---

## ✅ Checklist

Before launching social media, verify:

- [ ] PhotoDNA API key received
- [ ] API key added to `.env`
- [ ] Server restarted
- [ ] Health check shows PhotoDNA enabled
- [ ] Can create posts via API
- [ ] Can upload images without errors
- [ ] Frontend social feed works
- [ ] Comments and messages work

---

## 🚀 After Setup

Once PhotoDNA is configured:

1. **Test Everything:**
   ```bash
   node test-frontend-backend.js
   ```

2. **Invite Beta Users:**
   - Start with 5-10 trusted users
   - Monitor for issues
   - Gather feedback

3. **Gradually Scale:**
   - Week 1: 10 users
   - Week 2: 50 users
   - Week 3: 200 users
   - Month 2: Public launch

4. **Monitor PhotoDNA:**
   - Check logs for detections
   - Review flagged content
   - Report to NCMEC if needed

---

## 🎉 You're Ready!

Once PhotoDNA is set up, you'll have:
- ✅ Fully functional social media platform
- ✅ Legal CSAM protection
- ✅ Creator monetization
- ✅ All features unlocked
- ✅ Ready for public launch

**Estimated Time to Full Launch:** 2-4 weeks (PhotoDNA approval time)

**What to do while waiting:**
Launch creator tools now, build audience, prepare marketing.

---

**Questions?** Check `VSCODE_INSTRUCTIONS.md` for more details.

**Need help?** The feature flag system logs everything - check server console output.
