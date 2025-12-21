# 🚀 ForTheWeebs.com Launch Setup Guide

## ✅ STEP 1: Database Setup (5 minutes)

### Go to Supabase
**Link:** https://supabase.com/dashboard

1. Click on your project
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Run These 3 SQL Files (one at a time):

**File 1: Creator Applications**
- Open file: `supabase/schema_creator_applications.sql`
- Copy ALL contents
- Paste into SQL Editor
- Click **RUN** button
- Wait for "Success ✓"

**File 2: Trial Claims**
- Open file: `supabase/schema_trial_claims.sql`
- Copy ALL contents
- Paste into SQL Editor
- Click **RUN** button
- Wait for "Success ✓"

**File 3: Launch Vouchers**
- Open file: `supabase/schema_launch_vouchers.sql`
- Copy ALL contents
- Paste into SQL Editor
- Click **RUN** button
- Wait for "Success ✓"

---

## ✅ STEP 2: Email Service Setup (15 minutes)

### Option A: SendGrid (Recommended - Easiest)

**Sign up:** https://signup.sendgrid.com/

1. Create account (free tier = 100 emails/day)
2. Verify your email
3. Go to Settings → API Keys → Create API Key
4. Copy your API key

**Install SendGrid:**
```bash
npm install @sendgrid/mail
```

**Add to `.env` file:**
```
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=noreply@fortheweebs.com
```

**Update email function in `api/creator-applications.js` (line 18):**

Replace this:
```javascript
async function sendEmail(to, subject, html, text) {
  console.log('Sending email:', { to, subject });
  return { success: true };
}
```

With this:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html, text) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

**Do the same in `api/vouchers.js` (line 27)**

---

### Option B: AWS SES (For High Volume)

**Sign up:** https://aws.amazon.com/ses/

1. Create AWS account
2. Go to SES console
3. Verify your domain or email
4. Create SMTP credentials

**Install AWS SDK:**
```bash
npm install @aws-sdk/client-ses
```

**Add to `.env`:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_SES_FROM_EMAIL=noreply@fortheweebs.com
```

---

## ✅ STEP 3: Domain Setup in Vercel (10 minutes)

**Go to:** https://vercel.com/dashboard

1. Click your "fortheweebs" project
2. Go to **Settings** tab
3. Click **Domains** in sidebar
4. Click **Add Domain**

### Add These Domains:
- `fortheweebs.com`
- `www.fortheweebs.com`

### Configure DNS at Your Domain Registrar:

Vercel will show you DNS records to add. They look like:

**A Record:**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**CNAME Record:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Where to add these:**
- GoDaddy: https://dnsmanagement.godaddy.com/
- Namecheap: Dashboard → Domain List → Manage → Advanced DNS
- Cloudflare: Dashboard → DNS

**Wait 10-60 minutes for DNS propagation**

### Set Primary Domain:
- In Vercel domains list, click the three dots next to `fortheweebs.com`
- Click "Set as Primary"

---

## ✅ STEP 4: Test Everything Locally First (5 minutes)

```bash
# Start both frontend and backend
npm run dev:all
```

**Visit these URLs and test:**
- http://localhost:3000 → Landing page with voucher banner
- http://localhost:3000/claim-voucher → Voucher claim page
- http://localhost:3000/apply → Creator application
- http://localhost:3000/trial → Free trial page
- http://localhost:3000/parental-controls → Parents info page

**Test:**
1. Try claiming a voucher
2. Fill out creator application
3. Check Supabase database to see if data is saving

---

## ✅ STEP 5: Deploy to Production (2 minutes)

```bash
# Commit your changes
git add .
git commit -m "Add landing site with vouchers, applications, and trials"
git push
```

**Vercel will auto-deploy!**

---

## ✅ STEP 6: Verify Live Site (5 minutes)

**Once DNS propagates, visit:**
- https://fortheweebs.com
- https://fortheweebs.com/claim-voucher
- https://fortheweebs.com/apply

**Check:**
- [ ] Landing page loads
- [ ] Voucher banner appears
- [ ] Can claim voucher
- [ ] Receive confirmation email
- [ ] Application form works
- [ ] Trial page works

---

## 🔧 Optional: Create Admin User

To access the application review panel at `/admin/applications`:

**Run in Supabase SQL Editor:**
```sql
-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add yourself as admin (replace with your Supabase user ID)
INSERT INTO admin_users (user_id, email)
VALUES ('your-supabase-user-id-here', 'polotuspossumus@gmail.com');
```

---

## 📊 Monitor Voucher Usage

**Check voucher stats:**
```sql
SELECT * FROM voucher_statistics;
```

**See all vouchers:**
```sql
SELECT
  voucher_code,
  voucher_type,
  email,
  claimed_at,
  redeemed,
  expires_at
FROM launch_vouchers
ORDER BY claimed_at DESC;
```

---

## 🎯 What You Just Built:

✅ Landing page with mission statement, copyright policy, parent info
✅ Launch voucher system (first 100 visitors get 15% or 25% off)
✅ Creator application portal with admin review
✅ Free trial system (7-day trial)
✅ Comprehensive parental controls page
✅ Automated email notifications
✅ Complete database backend

---

## 🆘 Need Help?

**Common Issues:**

**"Vouchers not saving"**
- Check Supabase SQL ran successfully
- Check console for errors
- Verify `VITE_SUPABASE_URL` in `.env`

**"Emails not sending"**
- Verify SendGrid API key is correct
- Check SendGrid dashboard for errors
- Make sure "from" email is verified in SendGrid

**"Domain not working"**
- DNS takes 10-60 minutes to propagate
- Check DNS records at your registrar
- Use https://dnschecker.org to verify

---

## 🚀 YOU'RE READY TO LAUNCH!

Once Steps 1-5 are done, your site is LIVE at fortheweebs.com!
