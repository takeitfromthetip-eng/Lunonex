# 🚨 FINAL SETUP STEPS - DO THESE NOW

## ✅ WHAT'S DONE:

1. ✅ AI CSAM Detection system (`src/utils/aiCSAMDetection.js`)
2. ✅ Upload moderation flow integrated
3. ✅ OpenAI API key configured
4. ✅ Payment-based age verification
5. ✅ Supabase database tables created (`supabase/migrations/001_csam_moderation_tables.sql`)

---

## 🔥 WHAT YOU NEED TO DO NOW:

### **STEP 1: Run the Supabase Migration (CRITICAL)**

**Run this SQL in your Supabase dashboard:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: SQL Editor
4. Click "New Query"
5. Copy/paste the ENTIRE contents of: `supabase/migrations/001_csam_moderation_tables.sql`
6. Click "Run"

**This creates 6 tables:**
- `csam_incidents` - CSAM detections (7 year retention)
- `manual_review_queue` - Flagged content for review
- `pending_ncmec_reports` - Reports needing manual filing
- `blocked_ips` - Blocked IP addresses
- `moderation_logs` - Audit trail
- `user_bans` - Account terminations

---

### **STEP 2: Create API Endpoints**

**Create file: `api/moderation-actions.js`**

```javascript
const express = require('express');
const { supabase } = require('../src/lib/supabase-server');

const router = express.Router();

// Terminate Account for CSAM
router.post('/terminate-account', async (req, res) => {
  try {
    const { userId, incidentId, reason } = req.body;

    // Insert ban record
    const { data: ban, error: banError } = await supabase
      .from('user_bans')
      .insert({
        user_id: userId,
        reason: reason || 'CSAM_DETECTED',
        ban_type: 'CSAM_ZERO_TOLERANCE',
        incident_id: incidentId,
        can_appeal: false, // NO appeals for CSAM
        banned_at: new Date().toISOString()
      });

    if (banError) throw banError;

    // Delete user sessions (force logout)
    const { error: sessionError } = await supabase.auth.admin.deleteUser(userId);

    res.json({ success: true, message: 'Account terminated' });
  } catch (error) {
    console.error('Account termination error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Block IP Address
router.post('/block-ip', async (req, res) => {
  try {
    const { ipAddress, reason, incidentId, userId } = req.body;

    const { data, error } = await supabase
      .from('blocked_ips')
      .insert({
        ip_address: ipAddress,
        reason: reason || 'CSAM_DETECTED',
        block_type: 'PERMANENT',
        incident_id: incidentId,
        user_id: userId,
        blocked_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ success: true, message: 'IP blocked' });
  } catch (error) {
    console.error('IP blocking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if IP is blocked
router.get('/check-ip/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;

    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .or('expires_at.is.null,expires_at.gt.now()')
      .single();

    res.json({
      isBlocked: !!data,
      reason: data?.reason
    });
  } catch (error) {
    res.json({ isBlocked: false });
  }
});

module.exports = router;
```

**Then add to your main Express app:**

```javascript
// In your main server file (api/index.js or server.js)
const moderationActions = require('./api/moderation-actions');
app.use('/api/moderation', moderationActions);
```

---

### **STEP 3: Update AI Detection to Use Supabase**

**Create file: `src/utils/supabaseModeration.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function logCSAMIncident(data) {
  const { error } = await supabase.from('csam_incidents').insert({
    incident_id: data.incidentId,
    user_id: data.userId,
    ip_address: data.ipAddress,
    confidence: data.confidence,
    detection_method: 'AI_VISION_GPT4',
    scan_id: data.scanId,
    analysis: data.analysis,
    image_name: data.imageName,
    image_size: data.imageSize,
    image_type: data.imageType,
    detected_at: new Date().toISOString(),
    evidence_retain_until: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
  });

  if (error) console.error('Error logging CSAM incident:', error);
}

export async function logPendingNCMECReport(data) {
  const { error } = await supabase.from('pending_ncmec_reports').insert({
    incident_id: data.incidentId,
    csam_incident_id: data.csamIncidentId,
    report_data: data.reportData,
    detected_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    status: 'PENDING'
  });

  if (error) console.error('Error logging pending NCMEC report:', error);
}

export async function logModerationDecision(data) {
  const { error } = await supabase.from('moderation_logs').insert({
    user_id: data.userId,
    content_type: data.contentType,
    moderation_id: data.moderationId,
    approved: data.approved,
    blocked: data.blocked,
    requires_review: data.requiresReview,
    requires_age_gate: data.requiresAgeGate,
    content_rating: data.contentRating,
    violations: data.violations,
    warnings: data.warnings,
    timestamp: new Date().toISOString()
  });

  if (error) console.error('Error logging moderation decision:', error);
}

export async function terminateAccount(userId, incidentId) {
  const response = await fetch('/api/moderation/terminate-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      incidentId,
      reason: 'CSAM_DETECTED'
    })
  });

  return response.json();
}

export async function blockIPAddress(ipAddress, incidentId, userId) {
  const response = await fetch('/api/moderation/block-ip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ipAddress,
      incidentId,
      userId,
      reason: 'CSAM_DETECTED'
    })
  });

  return response.json();
}
```

---

### **STEP 4: Test the System**

**Test that everything works:**

```javascript
// In browser console or test file
import { moderateUpload } from './src/utils/uploadModerationFlow.js';

const testFile = document.getElementById('file-input').files[0];
const result = await moderateUpload(testFile, 'test-user-id', '127.0.0.1', {
  title: 'Test Upload',
  description: 'Testing moderation',
  tags: []
});

console.log('Moderation result:', result);
```

---

## 📊 HOW TO CHECK EVERYTHING:

### **In Supabase Dashboard:**

1. **Check CSAM incidents:**
   ```sql
   SELECT * FROM csam_incidents ORDER BY detected_at DESC LIMIT 10;
   ```

2. **Check pending NCMEC reports:**
   ```sql
   SELECT * FROM pending_ncmec_reports WHERE status = 'PENDING';
   ```

3. **Check manual review queue:**
   ```sql
   SELECT * FROM manual_review_queue WHERE status = 'PENDING' ORDER BY priority DESC;
   ```

4. **Check blocked IPs:**
   ```sql
   SELECT * FROM blocked_ips ORDER BY blocked_at DESC;
   ```

5. **Check terminated accounts:**
   ```sql
   SELECT * FROM user_bans ORDER BY banned_at DESC;
   ```

---

## 🚨 WHEN CSAM IS DETECTED:

1. **System automatically:**
   - ✅ Blocks upload
   - ✅ Logs incident to `csam_incidents` table
   - ✅ Creates pending NCMEC report
   - ✅ Calls `/api/moderation/terminate-account`
   - ✅ Calls `/api/moderation/block-ip`

2. **YOU must:**
   - Check `pending_ncmec_reports` table daily
   - Go to: https://report.cybertip.org/
   - File report manually using the `report_data` JSON
   - Mark as filed in Supabase
   - **MUST be done within 24 hours**

---

## 💰 COSTS:

- **OpenAI GPT-4 Vision:** $0.01 per image ($30/month at 100 uploads/day)
- **Supabase:** Free tier (50,000 rows/month)

---

## ✅ YOU'RE DONE WHEN:

- [ ] SQL migration run in Supabase
- [ ] API endpoints created (`api/moderation-actions.js`)
- [ ] Endpoints added to Express app
- [ ] Test upload works
- [ ] Can see incidents in Supabase dashboard

---

**That's it. System is production-ready once you complete these 4 steps.**
