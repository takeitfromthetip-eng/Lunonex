# ForTheWeebs - Adult Content System Setup Guide

This guide walks you through setting up the adult content compliance system for ForTheWeebs.

---

##   Legal Disclaimer

**IMPORTANT:** This system is designed to comply with U.S. federal law, specifically **18 U.S.C. § 2257** (record-keeping requirements for adult content). Failure to comply can result in criminal prosecution. If you're unsure about any part of this setup, **consult with a lawyer specializing in adult content compliance.**

---

## Overview

ForTheWeebs supports two types of creators:

1. **General Content Creators**: Gaming, art, music, cosplay (non-explicit)
   - Uses **Stripe** for payment processing (2.9% + $0.30 fees)
   - No ID verification required beyond age confirmation

2. **Adult Content Creators**: Sexually explicit content (18+ only)
   - Uses **CCBill** or **Segpay** for payment processing (10-15% fees)
   - Requires government-issued ID verification
   - Full 2257 compliance (record-keeping for all performers)

---

## Prerequisites

Before starting, you need:

1.  **Business Entity**: LLC or Corporation (required for CCBill/Segpay)
2.  **EIN (Employer Identification Number)**: From the IRS
3.  **Business Bank Account**: Separate from personal finances
4.  **Physical Address**: P.O. Box NOT allowed (required for 2257 compliance)
5.  **SSL Certificate**: HTTPS required for adult content
6.  **Age Verification System**: Already built into ForTheWeebs

---

## Step 1: Generate Encryption Key

Adult creator IDs are stored **encrypted** to protect sensitive data.

### Generate a strong encryption key:

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Add to `.env`:
```env
ID_ENCRYPTION_KEY=YOUR_GENERATED_KEY_HERE
```

**CRITICAL:**
- Never commit this key to Git
- Keep it backed up securely
- If lost, you cannot decrypt existing IDs

---

## Step 2: Sign Up for CCBill (Adult Payment Processor)

Stripe **does not support adult content**. You need CCBill or Segpay.

### CCBill Setup:

1. **Apply for Account**: https://www.ccbill.com/
   - Business name, EIN, bank account, business documents required
   - Approval takes 3-5 business days

2. **Get Your Credentials**:
   - Account Number (6-digit)
   - Sub-Account Number (4-digit)
   - FlexForms ID (from Payment Tools ’ FlexForms)
   - Salt Key (from Payment Tools ’ Advanced Settings)

3. **Add to `.env`**:
```env
CCBILL_ACCOUNT_ID=123456
CCBILL_SUB_ACCOUNT_ID=0001
CCBILL_FLEXFORMS_ID=abc123xyz
CCBILL_SALT=your_salt_key_here
```

### CCBill Fees:
- 10.5% - 14.5% per transaction (depends on volume)
- $0.30 per transaction
- Monthly minimum: $100
- Chargeback fees: $25 per chargeback

### Alternative: Segpay

If CCBill rejects you or fees are too high:

1. **Apply**: https://www.segpay.com/
2. **Get Credentials**:
   - Package ID
   - API Key

3. **Add to `.env`**:
```env
SEGPAY_PACKAGE_ID=your_package_id
SEGPAY_API_KEY=your_api_key
```

---

## Step 3: Set Up 2257 Custodian of Records

Federal law requires you to designate a **Custodian of Records** who maintains performer verification records.

### Custodian Requirements:
- Must have a **physical address** (P.O. Box NOT allowed)
- Must be available for inspection by law enforcement
- Must maintain records for 7 years after content removal

### Add to `.env`:
```env
CUSTODIAN_NAME=Your Name or Company Name
CUSTODIAN_ADDRESS_LINE1=123 Main Street
CUSTODIAN_ADDRESS_LINE2=Suite 100
CUSTODIAN_CITY=Your City
CUSTODIAN_STATE=CA
CUSTODIAN_ZIP=12345
CUSTODIAN_PHONE=+1-555-123-4567
CUSTODIAN_EMAIL=custodian@fortheweebs.com
```

**Display Requirements:**
- This information must be displayed on `/compliance-2257` (already built)
- Creators must include this in their content metadata

---

## Step 4: Create Supabase Storage Bucket

Adult creator IDs are stored in a **private** Supabase storage bucket.

### Via Supabase Dashboard:

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/storage
2. Click **"New Bucket"**
3. Bucket Name: `creator-compliance`
4. Public: **OFF** (must be private!)
5. Click **"Create Bucket"**

### Set Bucket Policies (RLS):

Run this in Supabase SQL Editor:

```sql
-- Only authenticated admins can access
CREATE POLICY "Admins can access compliance files"
ON storage.objects FOR ALL
USING (bucket_id = 'creator-compliance' AND auth.jwt()->>'role' = 'admin');
```

---

## Step 5: Run Database Schema

The adult content system requires additional database tables.

### Via Supabase SQL Editor:

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Open file: `supabase/schema_adult_content.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **"Run"**

### Tables Created:
- `id_verification_logs` - Tracks ID uploads
- `performer_records` - 2257 compliance records
- `content_compliance_records` - Per-content compliance tracking
- `creator_payment_routing` - Routes payments to Stripe vs CCBill
- `compliance_audit_log` - Audit trail for legal protection

### Verify Success:

Run this query to confirm tables exist:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

You should see the 5 new tables listed.

---

## Step 6: Update Creator Application Form

The creator application now includes adult content support.

**Already Built:**
- `src/pages/CreatorApplication.jsx` - Full form with adult content fields
- `src/pages/CreatorApplication.css` - Styling for adult content sections
- `api/creator-applications.js` - API with ID upload endpoint

**Test the Form:**
1. Navigate to: `http://localhost:5173/apply`
2. Select **"Adult Content (18+ Explicit)"**
3. Notice the warning box and ID upload field
4. Upload a test ID (use a fake ID image for testing)
5. Check 2257 compliance checkbox
6. Submit the form

**Verify in Supabase:**
- Check `creator_applications` table for new entry
- Check `id_verification_logs` table for upload log
- Check `creator-compliance` storage bucket for encrypted file

---

## Step 7: Test the Full Flow

### Test Adult Creator Application:

1.  Navigate to `/apply`
2.  Select "Adult Content"
3.  Fill out form with test data
4.  Upload a test ID image (use placeholder)
5.  Submit application
6.  Verify application in `/admin/applications`
7.  Approve application
8.  Check email template generation

### Test ID Encryption:

```bash
# Run this in your terminal:
node -e "
const crypto = require('crypto-js');
const key = 'YOUR_ID_ENCRYPTION_KEY';
const data = 'Test ID Data';
const encrypted = crypto.AES.encrypt(data, key).toString();
const decrypted = crypto.AES.decrypt(encrypted, key).toString(crypto.enc.Utf8);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', data === decrypted);
"
```

Should output: `Match: true`

---

## Security Checklist

Before going live:

- [ ]  ID_ENCRYPTION_KEY is strong and backed up
- [ ]  Storage bucket `creator-compliance` is PRIVATE
- [ ]  Row Level Security (RLS) enabled on all compliance tables
- [ ]  Only admins can access ID verification logs
- [ ]  SSL certificate installed (HTTPS)
- [ ]  Age verification enforced on all adult content
- [ ]  2257 Custodian address is PHYSICAL (not P.O. Box)
- [ ]  Email templates for approval/rejection work correctly
- [ ]  Audit schedule set up (use cron job or manual)
- [ ]  Legal counsel reviewed setup (HIGHLY RECOMMENDED)

---

## Common Issues

### Issue: CCBill Application Denied

**Reasons:**
- Unclear business model
- Insufficient documentation
- High-risk business type
- Previous chargebacks on other accounts

**Solution:**
- Try Segpay instead
- Provide detailed business plan
- Show traffic projections
- Get legal counsel to help with application

### Issue: ID Upload Fails

**Possible Causes:**
- File too large (max 10MB)
- Invalid file type (must be JPG, PNG, PDF)
- Storage bucket doesn't exist
- Encryption key not set

**Solution:**
- Check file size and type
- Verify `creator-compliance` bucket exists
- Confirm ID_ENCRYPTION_KEY in `.env`
- Check server logs for errors

---

## Ongoing Maintenance

### Monthly Tasks:
- [ ] Review compliance audit logs
- [ ] Check for pending ID verifications
- [ ] Perform random content audits (10% sample)
- [ ] Review CCBill chargeback reports
- [ ] Check for expired performer IDs

### Quarterly Tasks:
- [ ] Review 2257 compliance for all adult creators
- [ ] Audit storage bucket for unauthorized access
- [ ] Update age verification system if needed
- [ ] Review and update content moderation policies

### Annually:
- [ ] Legal review of compliance procedures
- [ ] Backup all performer records (encrypted)
- [ ] Review CCBill/Segpay fees and negotiate if possible
- [ ] Update Terms of Service and Privacy Policy as needed

---

## Support & Resources

### Legal Resources:
- **Free Speech Coalition**: https://www.freespeechcoalition.com/
- **2257 Regulations**: https://www.law.cornell.edu/uscode/text/18/2257
- **Adult Industry Lawyers**: https://www.firstamendment.com/

### Payment Processor Support:
- **CCBill**: https://ccbill.com/cs
- **Segpay**: https://www.segpay.com/support

### Technical Support:
- **Supabase Docs**: https://supabase.com/docs
- **Encryption Best Practices**: https://owasp.org/www-project-cryptographic-storage-cheat-sheet/

---

## Final Notes

This system is designed to **comply with U.S. federal law**, but laws vary by state and country. Always consult with legal counsel before launching an adult content platform.

**Remember:**
- CSAM (Child Sexual Abuse Material) is **NEVER** allowed
- Non-consensual content is **NEVER** allowed
- You are **legally required** to report CSAM to NCMEC
- 2257 compliance is **not optional** - it's federal law
- Keep detailed logs for legal protection

---

**ForTheWeebs LLC**
Built for creators, by creators.
We're here to replace the old guard, not become it.
