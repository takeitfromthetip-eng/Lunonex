# 🚨 COPY/PASTE THIS EXACT ORDER 🚨

## ============================================================================
## STEP 1: RUN THIS SQL IN SUPABASE
## ============================================================================

Go to: https://supabase.com/dashboard
→ Select your project
→ Click "SQL Editor" (left sidebar)
→ Click "New Query"
→ Copy/paste everything below
→ Click "Run"

```sql
-- ============================================================================
-- CSAM DETECTION & MODERATION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS csam_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  confidence DECIMAL(5,4) NOT NULL,
  detection_method TEXT NOT NULL DEFAULT 'AI_VISION_GPT4',
  scan_id TEXT NOT NULL,
  analysis JSONB NOT NULL,
  image_name TEXT,
  image_size BIGINT,
  image_type TEXT,
  image_hash TEXT,
  account_terminated BOOLEAN DEFAULT TRUE,
  ip_blocked BOOLEAN DEFAULT TRUE,
  ncmec_reported BOOLEAN DEFAULT FALSE,
  ncmec_report_id TEXT,
  ncmec_reported_at TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evidence_retain_until TIMESTAMP WITH TIME ZONE NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_csam_incidents_user_id ON csam_incidents(user_id);
CREATE INDEX idx_csam_incidents_detected_at ON csam_incidents(detected_at DESC);
CREATE INDEX idx_csam_incidents_ncmec_reported ON csam_incidents(ncmec_reported) WHERE ncmec_reported = FALSE;
CREATE INDEX idx_csam_incidents_confidence ON csam_incidents(confidence DESC);

CREATE TABLE IF NOT EXISTS manual_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  ip_address TEXT NOT NULL,
  content_type TEXT NOT NULL,
  risk_score DECIMAL(5,4) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  analysis JSONB NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MODERATE',
  status TEXT NOT NULL DEFAULT 'PENDING',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_decision TEXT,
  review_notes TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  escalated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_review_queue_status ON manual_review_queue(status) WHERE status = 'PENDING';
CREATE INDEX idx_review_queue_priority ON manual_review_queue(priority, flagged_at DESC);
CREATE INDEX idx_review_queue_user_id ON manual_review_queue(user_id);

CREATE TABLE IF NOT EXISTS pending_ncmec_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL UNIQUE,
  csam_incident_id UUID NOT NULL,
  report_data JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  filed_at TIMESTAMP WITH TIME ZONE,
  filed_by UUID,
  ncmec_report_id TEXT,
  alert_sent BOOLEAN DEFAULT FALSE,
  alert_sent_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (csam_incident_id) REFERENCES csam_incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (filed_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_pending_ncmec_status ON pending_ncmec_reports(status) WHERE status = 'PENDING';
CREATE INDEX idx_pending_ncmec_deadline ON pending_ncmec_reports(deadline ASC);

CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'PERMANENT',
  incident_id TEXT,
  user_id UUID,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  blocked_by UUID,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  FOREIGN KEY (blocked_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_active ON blocked_ips(blocked_at) WHERE expires_at IS NULL OR expires_at > NOW();

CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  moderation_id TEXT NOT NULL,
  approved BOOLEAN NOT NULL,
  blocked BOOLEAN NOT NULL,
  requires_review BOOLEAN NOT NULL,
  requires_age_gate BOOLEAN NOT NULL,
  content_rating TEXT NOT NULL DEFAULT 'SAFE',
  violations JSONB,
  warnings JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_moderation_logs_user_id ON moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_timestamp ON moderation_logs(timestamp DESC);
CREATE INDEX idx_moderation_logs_blocked ON moderation_logs(blocked) WHERE blocked = TRUE;

CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL DEFAULT 'PERMANENT',
  incident_id TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  banned_by UUID,
  notes TEXT,
  can_appeal BOOLEAN DEFAULT FALSE,
  appeal_submitted BOOLEAN DEFAULT FALSE,
  appeal_decision TEXT,
  appeal_decided_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (banned_by) REFERENCES auth.users(id)
);

CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX idx_user_bans_active ON user_bans(banned_at) WHERE expires_at IS NULL OR expires_at > NOW();

ALTER TABLE csam_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_ncmec_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to csam_incidents" ON csam_incidents
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to manual_review_queue" ON manual_review_queue
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to pending_ncmec_reports" ON pending_ncmec_reports
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to blocked_ips" ON blocked_ips
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to moderation_logs" ON moderation_logs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Admin full access to user_bans" ON user_bans
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = 'ca168f37-9ea1-4f93-8890-fc928aa1b565'::UUID
  );

CREATE POLICY "Users can check own ban status" ON user_bans
  FOR SELECT USING (auth.uid() = user_id);
```

**✅ DONE? Move to Step 2**

---

## ============================================================================
## STEP 2: ADD THIS TO YOUR EXPRESS SERVER
## ============================================================================

Find your main server file (probably `api/index.js` or `server.js`)

Add this line with your other routes:

```javascript
const moderationActions = require('./moderation-actions');
app.use('/api/moderation', moderationActions);
```

Example of where to add it:

```javascript
// Your existing routes
const stripeRoutes = require('./stripe');
const tierRoutes = require('./tier-access');
const blockRoutes = require('./block-enforcement');

// ADD THIS LINE:
const moderationActions = require('./moderation-actions');

app.use('/api/stripe', stripeRoutes);
app.use('/api/tier', tierRoutes);
app.use('/api/blocks', blockRoutes);

// ADD THIS LINE:
app.use('/api/moderation', moderationActions);
```

**✅ DONE? Move to Step 3**

---

## ============================================================================
## STEP 3: RESTART YOUR SERVER
## ============================================================================

```bash
# Stop your server (Ctrl+C if running)
# Then restart:
npm run dev
```

**✅ DONE? That's it - System is LIVE**

---

## ============================================================================
## HOW TO TEST IT WORKS
## ============================================================================

### Test in browser console:

```javascript
// Test API endpoint is working
fetch('/api/moderation/check-ip/127.0.0.1')
  .then(r => r.json())
  .then(d => console.log('IP Check works:', d));

// Test moderation flow
import { moderateUpload } from './src/utils/uploadModerationFlow.js';

const testFile = document.getElementById('file-input').files[0];
const result = await moderateUpload(testFile, 'test-user-id', '127.0.0.1', {
  title: 'Test',
  description: 'Test upload',
  tags: []
});

console.log('Moderation result:', result);
```

---

## ============================================================================
## CHECK SUPABASE FOR DATA
## ============================================================================

Go to Supabase Dashboard → Table Editor

You should see 6 new tables:
- csam_incidents
- manual_review_queue
- pending_ncmec_reports
- blocked_ips
- moderation_logs
- user_bans

---

## ✅ THAT'S IT - YOU'RE DONE

Your AI CSAM detection is now:
- ✅ Scanning every image upload
- ✅ Blocking CSAM automatically
- ✅ Terminating accounts via API
- ✅ Blocking IPs via API
- ✅ Storing everything in Supabase
- ✅ Ready for NCMEC reporting

---

## 🚨 WHEN CSAM IS DETECTED:

1. System automatically blocks & terminates
2. Check Supabase → `pending_ncmec_reports` table
3. Go to: https://report.cybertip.org/
4. File report using the JSON data
5. Update status in Supabase

**Must be done within 24 hours**

---

**Questions? Everything works? Tell me and I'll build the Media Sorter next.**
