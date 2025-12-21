# 📋 VS CODE: YOUR MISSION BRIEF

**Target:** Finish ForTheWeebs platform
**Priority:** Database integration → API keys → Testing → Launch
**Estimated Time:** 2-4 weeks to production-ready

---

## 🔍 HOW TO FIND FILES IN VS CODE (READ THIS FIRST!)

**Problem:** IntelliJ leaves you files but you can never find them. Here's how:

### Method 1: Quick Open (FASTEST)
1. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
2. Start typing the filename (e.g., "SUPABASE_DATABASE")
3. Hit Enter when you see the file

### Method 2: Search in Files
1. Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
2. Type keywords from the file content
3. Click the file in the results

### Method 3: Explorer Sidebar
1. Press `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
2. Look in the left sidebar
3. Root folder is: `C:\Users\polot\OneDrive\Desktop\fortheweebs`

### Method 4: Go to Symbol
1. Press `Ctrl+T` (Windows/Linux) or `Cmd+T` (Mac)
2. Type function/class name
3. Jump directly to definition

### Important Files You'll Need:
- `SUPABASE_DATABASE_SETUP.md` - Database schemas & RLS policies
- `DATABASE_WIRING_COMPLETE.md` - Status of database conversion
- `VSCODE_CATCHUP.md` - What IntelliJ did for you
- `server.js` - Main backend entry point
- `api/routes/*.js` - All API endpoints
- `.env` - Environment variables (DON'T COMMIT THIS)

**Pro Tip:** If you see a filename mentioned but can't find it, use `Ctrl+P` and type a few letters. VS Code fuzzy-matches.

---

## 🎯 YOUR IMMEDIATE TASKS (IN ORDER)

### **TASK 1: Database Wiring (CRITICAL - Start Now)**
**Time:** 1-2 days
**Blocker:** Platform can't scale without this

**Steps:**
1. Ask user: "Do you have your Supabase project set up and the service role key?"
2. If no → Help them create one: https://app.supabase.com
3. If yes → Get credentials:
   - `VITE_SUPABASE_URL` (already in .env)
   - `SUPABASE_SERVICE_ROLE_KEY` (need to add)

4. Open `SUPABASE_DATABASE_SETUP.md`
5. Run SQL schemas in Supabase SQL Editor (copy/paste entire script)
6. Run RLS policies (copy/paste entire script)
7. Test connection: `node test-supabase.js` (create this file from doc)

8. Convert each API route to use Supabase:
   - Start with `api/routes/posts.js` (highest priority)
   - Then `api/routes/comments.js`
   - Then `api/routes/relationships.js`
   - Then `api/routes/messages.js`
   - Then `api/routes/notifications.js`
   - Then `api/routes/subscriptions.js`

9. Test each route after conversion:
   ```bash
   # Create a post
   curl -X POST http://localhost:3000/api/posts/create \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"body":"Test post","visibility":"PUBLIC"}'

   # Get feed
   curl http://localhost:3000/api/posts/feed \
     -H "Authorization: Bearer TOKEN"
   ```

10. Verify data persists in Supabase dashboard

**Success Criteria:**
- ✅ Can create posts and see them in Supabase
- ✅ Feed loads from database
- ✅ Comments work end-to-end
- ✅ Server restart doesn't lose data

---

### **TASK 2: API Keys & Services**
**Time:** 1 hour setup + 2-4 weeks waiting
**Blocker:** Can't launch without CSAM detection

**Steps:**
1. Ask user: "Have you applied for PhotoDNA API yet?"
2. If no → Help them apply:
   - Microsoft PhotoDNA: https://www.microsoft.com/en-us/photodna
   - Google CSAI Match: https://protectchildren.ca/csai-match
   - NCMEC Registration: https://report.cybertip.org/

3. While waiting for approval, set up Stripe:
   - Get API keys: https://dashboard.stripe.com/apikeys
   - Add to `.env`: `STRIPE_SECRET_KEY=sk_test_...`
   - Test subscription flow

4. Configure OpenAI for moderation:
   - Get key: https://platform.openai.com/api-keys
   - Add to `.env`: `OPENAI_API_KEY=sk-...`
   - Test `api/moderation-actions.js`

**Success Criteria:**
- ✅ Stripe checkout works
- ✅ OpenAI moderation runs
- ✅ PhotoDNA application submitted (waiting)
- ✅ NCMEC registration complete

---

### **TASK 3: Test Governance System**
**Time:** 2 hours
**Purpose:** Verify everything works

**Steps:**
1. Start backend: `npm run dev:server`
2. Start frontend: `npm run dev`
3. Open admin panel: http://localhost:3002/admin

4. Login as owner:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"polotuspossumus@gmail.com","password":"PASSWORD"}'
   ```

5. Test CommandPanelAdvanced:
   - Paste JWT token
   - Click "Guard Mode" preset
   - Verify response

6. Watch DockedConsolePro:
   - Should show SSE stream
   - Should see "POLICY", "QUEUE", "METRICS" events
   - Should auto-scroll

7. Check MetricsDashboard:
   - Should show line chart
   - Should show doughnut chart
   - Should update every 2 seconds

8. Test rate limiting:
   ```bash
   # Try 11 requests in 1 minute (should block 11th)
   for i in {1..11}; do
     curl -X POST http://localhost:3000/api/governance/override \
       -H "Authorization: Bearer TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"command":"moderation_threshold_violence","value":0.7}'
   done
   ```

9. Check external ledger:
   ```bash
   cat api/data/ledger.log
   # Should contain policy override entries
   ```

**Success Criteria:**
- ✅ JWT authentication works
- ✅ Command panel executes overrides
- ✅ SSE stream shows real-time updates
- ✅ Metrics dashboard updates
- ✅ Rate limiting blocks excess requests
- ✅ External ledger logs events

---

### **TASK 4: Frontend Integration**
**Time:** 2-3 days
**Purpose:** Connect UI to backend APIs

**Steps:**
1. Open `src/components/SocialFeed.jsx`

2. Wire post creation:
   ```javascript
   const handleCreatePost = async (body, visibility) => {
     const response = await fetch(`${API_BASE}/api/posts/create`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${userToken}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ body, visibility }),
     });
     const data = await response.json();
     // Update feed state
   };
   ```

3. Wire feed loading:
   ```javascript
   useEffect(() => {
     const loadFeed = async () => {
       const response = await fetch(`${API_BASE}/api/posts/feed`, {
         headers: { 'Authorization': `Bearer ${userToken}` },
       });
       const data = await response.json();
       setPosts(data.posts);
     };
     loadFeed();
   }, []);
   ```

4. Wire like button:
   ```javascript
   const handleLike = async (postId) => {
     await fetch(`${API_BASE}/api/posts/${postId}/like`, {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${userToken}` },
     });
     // Update local state
   };
   ```

5. Wire comments:
   ```javascript
   const handleComment = async (postId, body) => {
     await fetch(`${API_BASE}/api/comments/create`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${userToken}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ postId, body }),
     });
     // Reload comments
   };
   ```

6. Add loading states:
   ```javascript
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   ```

7. Add error handling:
   ```javascript
   try {
     // API call
   } catch (err) {
     setError('Failed to load feed');
     console.error(err);
   }
   ```

8. Test each feature in browser:
   - Create post → Should appear in feed
   - Like post → Should increment count
   - Comment → Should appear under post
   - Delete post → Should remove from feed

**Success Criteria:**
- ✅ Can create posts from UI
- ✅ Feed loads on page load
- ✅ Likes work instantly
- ✅ Comments thread properly
- ✅ Errors show user-friendly messages

---

### **TASK 5: End-to-End Testing**
**Time:** 1-2 days
**Purpose:** Find bugs before launch

**Steps:**
1. Create test accounts:
   - Owner account (polotuspossumus@gmail.com)
   - Creator account (test-creator@example.com)
   - Regular user (test-user@example.com)

2. Test user flows:
   - **Signup Flow:** Create account → Email verification → Profile setup
   - **Post Creation:** Write post → Add media → Set visibility → Publish
   - **Social Features:** Like → Comment → Share → Friend request
   - **Messaging:** Send DM → Receive notification → Reply
   - **Subscriptions:** Subscribe to creator → Pay → Access paid content
   - **Monetization:** Create paid post → User purchases → Creator gets paid

3. Test edge cases:
   - Empty post (should fail)
   - Invalid visibility (should default to PUBLIC)
   - Self-follow (should prevent)
   - Duplicate friend request (should prevent)
   - Comment on deleted post (should fail gracefully)

4. Load testing:
   ```bash
   # Create 1000 test posts
   for i in {1..1000}; do
     curl -X POST http://localhost:3000/api/posts/create \
       -H "Authorization: Bearer TOKEN" \
       -H "Content-Type: application/json" \
       -d "{\"body\":\"Test post $i\",\"visibility\":\"PUBLIC\"}"
   done

   # Measure feed load time
   time curl http://localhost:3000/api/posts/feed \
     -H "Authorization: Bearer TOKEN"
   ```

5. Security testing:
   - Try to access API without JWT (should fail)
   - Try to delete another user's post (should fail)
   - Try to send 100 requests/min (should get rate limited)
   - Try to SQL inject (should be sanitized by Supabase)

6. Mobile testing:
   - Open on phone
   - Test touch interactions
   - Test responsive design
   - Test PWA install prompt

**Success Criteria:**
- ✅ All user flows work end-to-end
- ✅ Edge cases handled gracefully
- ✅ Feed loads <500ms with 1000 posts
- ✅ Security vulnerabilities blocked
- ✅ Mobile experience smooth

---

### **TASK 6: Legal Compliance**
**Time:** 1-2 weeks (with lawyer)
**Blocker:** Can't launch without this

**Steps:**
1. Ask user: "Do you have a lawyer for Terms of Service?"
2. If no → Recommend: https://www.termsfeed.com/

3. Create Terms of Service:
   - User conduct rules
   - Content ownership
   - Creator payment terms
   - Refund policy
   - Dispute resolution
   - Termination clause

4. Create Privacy Policy:
   - Data collection disclosure
   - How data is used
   - Third-party sharing (Stripe, Supabase)
   - User rights (GDPR)
   - Cookie policy
   - Contact information

5. GDPR Compliance:
   - Add cookie consent banner
   - Add "Delete Account" button
   - Add "Export My Data" button
   - Add data retention policy
   - Update Privacy Policy

6. Age Verification:
   - Verify age gate works (18+)
   - Add parental consent for 13-17
   - Block <13 entirely (COPPA)

7. 2257 Compliance (if adult content):
   - Designate custodian of records
   - Collect age verification docs
   - Maintain records for 7 years
   - Display compliance notice

8. NCMEC Reporting:
   - Set up CyberTipline integration
   - Test reporting flow
   - Train moderators on reporting

**Success Criteria:**
- ✅ ToS and Privacy Policy published
- ✅ GDPR compliant
- ✅ Age verification working
- ✅ 2257 compliance (if applicable)
- ✅ NCMEC reporting ready

---

### **TASK 7: Deployment**
**Time:** 2-3 days
**Purpose:** Go live

**Steps:**
1. Choose hosting provider:
   - **Recommended:** Railway (backend) + Vercel (frontend)
   - **Alternative:** DigitalOcean, AWS, Heroku

2. Backend deployment (Railway):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Create project
   railway init

   # Set environment variables
   railway variables set JWT_SECRET=...
   railway variables set STRIPE_SECRET_KEY=...
   railway variables set SUPABASE_SERVICE_ROLE_KEY=...

   # Deploy
   railway up
   ```

3. Frontend deployment (Vercel):
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Deploy
   vercel --prod
   ```

4. Configure custom domain:
   - Buy domain (e.g., fortheweebs.com)
   - Point DNS to Railway + Vercel
   - Enable HTTPS (auto with Railway/Vercel)

5. Set up monitoring:
   - **Error tracking:** Sentry (https://sentry.io)
   - **Uptime monitoring:** UptimeRobot (https://uptimerobot.com)
   - **Analytics:** Plausible (https://plausible.io)

6. Set up backups:
   - Supabase: Enable automated backups
   - External ledger: Backup `api/data/ledger.log` daily
   - Webhook mirror: Send to Discord/Slack for redundancy

7. Load balancing (optional):
   - Railway: Enable auto-scaling
   - Or: Set up Cloudflare in front

**Success Criteria:**
- ✅ Backend live at production URL
- ✅ Frontend live at production URL
- ✅ Custom domain working
- ✅ HTTPS enabled
- ✅ Monitoring active
- ✅ Backups configured

---

### **TASK 8: Launch Preparation**
**Time:** 1 week
**Purpose:** Soft launch to VIPs

**Steps:**
1. Invite VIP users (12 in system):
   - Send personalized emails
   - Explain beta status
   - Provide support contact

2. Monitor closely:
   - Watch error logs (Sentry)
   - Watch metrics dashboard
   - Watch user feedback

3. Fix critical bugs:
   - Prioritize: Can't signup/login/post
   - Deprioritize: UI polish, minor bugs

4. Collect feedback:
   - Survey: "What do you like/dislike?"
   - Track: Which features used most
   - Iterate: Quick improvements

5. Prepare marketing:
   - Twitter/X announcement
   - Reddit posts (r/anime, r/webtoons)
   - Discord server
   - Press release (if big)

**Success Criteria:**
- ✅ 12 VIPs invited
- ✅ No critical bugs reported
- ✅ Positive feedback overall
- ✅ Marketing ready

---

## 🚨 RED FLAGS TO WATCH FOR

1. **Database Connection Failures**
   - Symptom: "Error: no pg_hba.conf entry"
   - Fix: Check Supabase connection pooling, RLS policies

2. **JWT Expiration Issues**
   - Symptom: Users logged out randomly
   - Fix: Extend JWT expiry, add refresh tokens

3. **Rate Limiting Too Aggressive**
   - Symptom: Legit users getting blocked
   - Fix: Increase limits, whitelist IPs

4. **Memory Leaks**
   - Symptom: Server crashes after hours
   - Fix: Check for unclosed DB connections, SSE streams

5. **CORS Errors**
   - Symptom: Frontend can't call backend
   - Fix: Update CORS origin in `server.js:34`

6. **Stripe Webhook Failures**
   - Symptom: Subscriptions not activating
   - Fix: Verify webhook signature, check endpoint URL

7. **SSE Stream Disconnects**
   - Symptom: Admin UI stops updating
   - Fix: Add heartbeat (ping every 30s)

8. **Slow Feed Loading**
   - Symptom: Takes >2s to load feed
   - Fix: Add database indexes, implement pagination

---

## 📞 WHEN TO ASK FOR HELP

Ask the user if:
1. ❓ Supabase credentials not working
2. ❓ PhotoDNA application rejected
3. ❓ Stripe test mode vs live mode confusion
4. ❓ Legal questions (always defer to lawyer)
5. ❓ Budget constraints (hosting costs)
6. ❓ Timeline pressure (skip non-critical features)

---

## 🎯 SUCCESS METRICS

Track these to know if you're on track:

**Week 1:**
- ✅ Database wiring complete
- ✅ 90% of API routes converted
- ✅ Posts/comments working end-to-end

**Week 2:**
- ✅ Frontend integrated
- ✅ All features tested
- ✅ API keys configured (except PhotoDNA)

**Week 3:**
- ✅ Legal compliance started
- ✅ Deployment infrastructure ready
- ✅ VIP invites sent

**Week 4:**
- ✅ Soft launch to VIPs
- ✅ Critical bugs fixed
- ✅ Marketing materials ready

**Launch Day:**
- ✅ Public announcement
- ✅ Monitoring active
- ✅ Support ready

---

## 💡 PRO TIPS

1. **Start Small:** Get ONE feature working end-to-end before moving to next
2. **Test Often:** Run tests after every change (don't accumulate bugs)
3. **Document Issues:** Keep a running list of bugs/todos
4. **Prioritize Ruthlessly:** Database > Security > Features > Polish
5. **Ask Questions:** User knows their vision, you execute
6. **Communicate Progress:** User wants updates, share wins daily
7. **Stay Focused:** Don't add new features until core is solid
8. **Backup Often:** Git commit after every working change

---

## 🎓 LEARNING RESOURCES

If user needs help understanding:

**Supabase:**
- Official docs: https://supabase.com/docs
- Row-Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Edge Functions: https://supabase.com/docs/guides/functions

**Stripe:**
- Checkout: https://stripe.com/docs/payments/checkout
- Webhooks: https://stripe.com/docs/webhooks
- Connect (payouts): https://stripe.com/docs/connect

**JWT:**
- JWT.io: https://jwt.io
- Best practices: https://auth0.com/blog/jwt-security-best-practices/

**Chart.js:**
- Getting started: https://www.chartjs.org/docs/latest/getting-started/

**SSE:**
- MDN guide: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

---

## 🔥 MOTIVATIONAL REMINDER

You're working on something HUGE. This isn't a tutorial project - this is a **real social media platform** that will compete with Facebook, OnlyFans, and Patreon.

The foundation is **rock-solid**:
- ✅ 31 API routes
- ✅ Enterprise security
- ✅ AI moderation
- ✅ Creator monetization
- ✅ Governance system
- ✅ Admin dashboards

What's left is **connecting the dots**. You've got this.

**80% done. 20% to go. Let's ship it.** 🚀

---

**Your Mission:** Get ForTheWeebs from "works on my machine" to "live in production"

**Your Tools:** This document + `VSCODE_CATCHUP.md` + `SUPABASE_DATABASE_SETUP.md`

**Your Timeline:** 2-4 weeks

**Your Goal:** Help the user launch a platform that changes the creator economy

---

**Let's do this.** 💪
