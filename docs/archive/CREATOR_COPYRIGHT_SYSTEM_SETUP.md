# Creator-Direct Copyright Request System

**Purpose:** Allow copyright holders to contact creators directly about potential infringement, with AI validation to prevent pranks/abuse.

**Different from DMCA:** This is creator-to-creator communication. DMCA is admin-facing legal takedown.

---

## 🎯 How It Works

### **Flow:**
1. Copyright holder submits request with proof
2. AI validates legitimacy (GPT-4 analyzes for red flags)
3. If valid → Creator receives notification
4. Creator has 7 days to respond:
   - **Agree & Remove:** Content taken down, request resolved
   - **Dispute:** Escalated to admin for review
   - **Counter-Claim:** Files counter-claim, admin reviews
5. If invalid → Request rejected automatically

### **Why AI Validation?**
- Prevents prank requests
- Protects creators from harassment
- Reduces admin workload
- Ensures only legitimate requests reach creators

---

## 📊 Database Schema

### **Table: `creator_copyright_requests`**

```sql
CREATE TABLE creator_copyright_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Complainant Info
    complainant_name TEXT NOT NULL,
    complainant_email TEXT NOT NULL,
    copyright_work_title TEXT NOT NULL,
    copyright_work_description TEXT,
    copyright_work_url TEXT, -- Where original work is published
    copyright_proof_urls TEXT[], -- Portfolio, social media, etc.
    good_faith_statement BOOLEAN DEFAULT false,

    -- Alleged Infringement
    infringing_content_url TEXT NOT NULL, -- Creator's content URL
    infringing_creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    infringing_creator_username TEXT NOT NULL,
    explanation TEXT NOT NULL, -- Why they believe it infringes

    -- AI Validation
    ai_validation_status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    ai_validation_result JSONB, -- Full AI response
    ai_confidence_score INTEGER, -- 0-100
    ai_reasoning TEXT,

    -- Status Tracking
    status TEXT DEFAULT 'PENDING_VALIDATION',
    -- Possible statuses:
    -- PENDING_VALIDATION - Just submitted, waiting for AI
    -- APPROVED_PENDING_CREATOR - AI approved, waiting for creator response
    -- REJECTED_BY_AI - AI determined it's likely fake/abuse
    -- MANUAL_REVIEW_REQUIRED - AI unsure, needs admin review
    -- CREATOR_RESPONDED - Creator has responded
    -- RESOLVED_CONTENT_REMOVED - Creator agreed and removed content
    -- ESCALATED_TO_ADMIN - Creator disputed, admin must decide
    -- COUNTER_CLAIM_FILED - Creator filed counter-claim
    -- REJECTED_BY_ADMIN - Admin rejected after manual review
    -- ESCALATED_LEGAL_REVIEW - Sent to legal team

    -- Creator Response
    creator_response_type TEXT, -- AGREE_REMOVE, DISPUTE, COUNTER_CLAIM
    creator_response_message TEXT,
    creator_action_taken TEXT, -- What they did (removed, edited, etc.)
    creator_responded_at TIMESTAMP,

    -- Admin Review (for manual review cases)
    admin_review_decision TEXT, -- APPROVE, REJECT, ESCALATE
    admin_review_notes TEXT,
    reviewed_by TEXT, -- Admin username
    reviewed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_creator_copyright_requests_creator ON creator_copyright_requests(infringing_creator_id);
CREATE INDEX idx_creator_copyright_requests_status ON creator_copyright_requests(status);
CREATE INDEX idx_creator_copyright_requests_email ON creator_copyright_requests(complainant_email);
CREATE INDEX idx_creator_copyright_requests_ai_validation ON creator_copyright_requests(ai_validation_status);
```

---

## 🔌 API Endpoints

### **1. Submit Request (Public)**
```
POST /api/creator-copyright/submit
```

**Request Body:**
```json
{
  "complainant_name": "Jane Artist",
  "complainant_email": "jane@example.com",
  "copyright_work_title": "My Original Artwork",
  "copyright_work_description": "Digital illustration created in 2024",
  "copyright_work_url": "https://myportfolio.com/artwork-123",
  "copyright_proof_urls": [
    "https://instagram.com/janeartist/post123",
    "https://twitter.com/janeartist/status456"
  ],
  "infringing_content_url": "https://fortheweebs.com/posts/789",
  "infringing_creator_username": "bobcreator",
  "explanation": "This creator used my artwork without permission or credit. I created this piece in January 2024 and can provide original PSD files.",
  "good_faith_statement": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Copyright request submitted successfully",
  "request_id": "uuid-here",
  "status": "Your request is being validated by AI. You will be notified of the result.",
  "next_steps": [
    "AI will review your request for legitimacy (1-2 minutes)",
    "If valid, creator will be notified and given 7 days to respond",
    "If invalid (prank/abuse), request will be rejected",
    "You will receive email updates at jane@example.com"
  ]
}
```

---

### **2. View My Requests (Creator, Authenticated)**
```
GET /api/creator-copyright/my-requests
Authorization: Bearer <JWT>
```

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "complainant_name": "Jane Artist",
      "copyright_work_title": "My Original Artwork",
      "explanation": "...",
      "infringing_content_url": "https://fortheweebs.com/posts/789",
      "status": "APPROVED_PENDING_CREATOR",
      "created_at": "2025-11-25T10:00:00Z",
      "response_deadline": "2025-12-02T10:00:00Z"
    }
  ]
}
```

---

### **3. Respond to Request (Creator, Authenticated)**
```
POST /api/creator-copyright/:requestId/respond
Authorization: Bearer <JWT>
```

**Request Body (Option 1 - Agree & Remove):**
```json
{
  "response_type": "AGREE_REMOVE",
  "response_message": "I've removed the content. I apologize for the oversight.",
  "action_taken": "Post deleted permanently"
}
```

**Request Body (Option 2 - Dispute):**
```json
{
  "response_type": "DISPUTE",
  "response_message": "This is my original work. I have timestamps proving I created this before the complainant.",
  "action_taken": "None - content is mine"
}
```

**Request Body (Option 3 - Counter-Claim):**
```json
{
  "response_type": "COUNTER_CLAIM",
  "response_message": "I actually hold the copyright. Here's my proof: [links]",
  "action_taken": "Filed counter-claim with evidence"
}
```

---

### **4. View All Requests (Admin)**
```
GET /api/creator-copyright/admin/all?status=MANUAL_REVIEW_REQUIRED
Authorization: Bearer <JWT>
```

---

### **5. Manual Review Decision (Admin)**
```
POST /api/creator-copyright/admin/:requestId/review
Authorization: Bearer <JWT>
```

**Request Body:**
```json
{
  "decision": "APPROVE",
  "admin_notes": "Verified ownership via portfolio timestamps. Request is legitimate."
}
```

---

## 🤖 AI Validation Logic

### **What AI Checks:**
1. **Coherence:** Is explanation specific and detailed?
2. **Evidence:** Are proof URLs provided and relevant?
3. **Email legitimacy:** Is email professional or throwaway?
4. **Red flags:**
   - Vague claims (e.g., "they stole my idea")
   - No proof of ownership
   - Trolling language
   - Targeting specific creator without reason
   - Unreasonable claims (copyright on common concepts)

### **AI Response Format:**
```json
{
  "is_legitimate": true,
  "confidence": 85,
  "reasoning": "Complainant provided specific details, portfolio links, and coherent explanation. No obvious red flags.",
  "red_flags": [],
  "recommendation": "APPROVE"
}
```

### **Confidence Thresholds:**
- **≥70% confidence + APPROVE:** Auto-approve, notify creator
- **≥70% confidence + REJECT:** Auto-reject, notify complainant
- **<70% confidence:** Send to manual review

---

## 🛠️ Setup Instructions

### **Step 1: Create Database Table**

1. Open Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy the SQL schema above
3. Click "Run"
4. Verify table exists: Table Editor → `creator_copyright_requests`

### **Step 2: Add Route to Server**

In `server.js`, add this route:

```javascript
// Creator Copyright Requests (AI-validated)
app.use('/api/creator-copyright', require('./api/creator-copyright-requests'));
console.log('✅ Creator Copyright Requests');
```

### **Step 3: Verify Environment Variables**

Check `.env` has:
```env
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=fortheweebs_jwt_secret_2025_ultra_secure_key
```

### **Step 4: Test the System**

**Submit Test Request:**
```bash
curl -X POST http://localhost:3000/api/creator-copyright/submit \
  -H "Content-Type: application/json" \
  -d '{
    "complainant_name": "Test Artist",
    "complainant_email": "test@example.com",
    "copyright_work_title": "Test Artwork",
    "infringing_content_url": "https://fortheweebs.com/posts/123",
    "infringing_creator_username": "testcreator",
    "explanation": "This is a detailed explanation of why I believe my copyright was infringed.",
    "good_faith_statement": true
  }'
```

**Check AI Validation:**
```bash
# Check database table to see AI response
# Should see status change from PENDING_VALIDATION to APPROVED_PENDING_CREATOR or REJECTED_BY_AI
```

---

## 📧 Email Notifications (TODO)

System currently logs notifications to console. To enable emails:

1. Add email service (SendGrid, Mailgun, AWS SES)
2. Update `.env`:
   ```env
   SENDGRID_API_KEY=your_key
   EMAIL_FROM=noreply@fortheweebs.com
   ```
3. Implement `sendEmail()` function in `creator-copyright-requests.js`

**Email Templates Needed:**
- Complainant: Request submitted
- Complainant: Request validated (approved/rejected)
- Creator: New request received
- Creator: Reminder (3 days left to respond)
- Admin: Manual review needed

---

## 🎯 Status Flow Diagram

```
[Submit Request]
      ↓
[PENDING_VALIDATION]
      ↓
  [AI Analyzes]
      ↓
    ┌─────────────────────┐
    │                     │
[APPROVED]          [REJECTED_BY_AI]
    ↓                     ↓
[Notify Creator]    [Notify Complainant]
    ↓                     ↓
[APPROVED_PENDING_CREATOR] [End]
    ↓
[Creator Responds]
    ↓
  ┌───────────────────────────┐
  │           │               │
[AGREE]   [DISPUTE]   [COUNTER_CLAIM]
  ↓           ↓               ↓
[RESOLVED] [ESCALATED] [ESCALATED]
  ↓           ↓               ↓
[End]   [Admin Review]   [Admin Review]
```

---

## 🚨 Anti-Abuse Protections

### **1. Rate Limiting**
- Max 5 requests per email per day
- Max 10 requests per IP per day

### **2. AI Validation**
- Detects prank/harassment patterns
- Validates proof of ownership
- Checks for coherent explanations

### **3. Good Faith Requirement**
- Must check "good faith statement"
- Perjury warning displayed

### **4. Creator Protection**
- Only approved requests reach creator
- 7-day response window
- Can dispute with evidence

### **5. Logging**
- All requests logged
- AI decisions recorded
- Audit trail for legal compliance

---

## 🎉 Benefits vs DMCA System

| Feature | DMCA System | Creator Copyright System |
|---------|-------------|--------------------------|
| **Target** | Admin/Platform | Creator directly |
| **Speed** | 24-48 hours | 1-2 minutes (AI) |
| **Legal Weight** | DMCA safe harbor | Informal request |
| **Abuse Protection** | Manual review | AI + manual |
| **Creator Control** | Platform decides | Creator decides |
| **Escalation** | Automatic | Only if disputed |
| **Best For** | Legal takedowns | Minor infringements |

**When to Use Each:**
- **DMCA:** Serious copyright violations, platform-hosted content
- **Creator System:** Minor issues, creator-to-creator disputes, good-faith resolution

---

## ✅ Launch Checklist

- [x] API routes created
- [x] AI validation implemented
- [ ] Database table created (run SQL above)
- [ ] Route added to `server.js`
- [ ] Environment variables verified
- [ ] Test request submitted
- [ ] Email notifications configured (optional)
- [ ] Frontend UI created (optional - can use curl for now)

---

## 🚀 Next Steps

1. **Run SQL Schema** - Create database table
2. **Add Route to Server** - Wire up API endpoint
3. **Test Submission** - Use curl to submit test request
4. **Verify AI Validation** - Check database for AI response
5. **Build Frontend** (optional) - Create UI for creators to respond
6. **Enable Emails** (later) - Add email notifications

---

**Status:** ✅ Backend complete, ready to integrate
**Time to Launch:** Add route to server.js + run SQL (5 minutes)
**Dependencies:** OpenAI API key (already in .env)

🎊 **You now have TWO copyright systems:**
1. DMCA (admin-facing, legal)
2. Creator-Direct (AI-validated, informal)

**Use both for comprehensive copyright protection!** 🔥
