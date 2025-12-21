# ⚖️ Legal Receipts - Lifetime-Locked Storage Architecture

## 🎯 **Overview**

ForTheWeebs legal acceptance receipts are **immutable for life** using AWS S3 Object Lock (COMPLIANCE mode) with far-future retention dates (2099-12-31) and annual extension jobs to maintain perpetual storage.

**Key Features:**
- ✅ **Write-once storage** (no updates/deletes)
- ✅ **Object Lock COMPLIANCE mode** (immutable even by root)
- ✅ **Far-future retention** (2099-12-31, extended annually)
- ✅ **Legal holds** for disputes (blocks deletion indefinitely)
- ✅ **Dual evidence** (Postgres + S3 with hash verification)
- ✅ **Full audit trail** (CloudTrail + S3 access logs)
- ✅ **Cross-region backup** (disaster recovery)
- ✅ **KMS encryption** (data at rest)

---

## 📁 **Architecture Components**

### **1. Configuration** (`config/legalReceipts.js`)
- AWS S3 bucket settings
- Object Lock configuration (COMPLIANCE mode)
- Retention policy (2099-12-31 default)
- KMS encryption keys
- Access control roles
- Audit logging setup

### **2. API Routes** (`api/routes/legal-receipts.js`)
- `POST /api/legal-receipts/create` - Create immutable receipt
- `GET /api/legal-receipts/:receiptId` - Get receipt metadata
- `GET /api/legal-receipts/:receiptId/download` - Signed URL (5-min expiry)
- `POST /api/legal-receipts/:receiptId/legal-hold` - Apply legal hold
- `GET /api/legal-receipts/user/:userId` - List user receipts

### **3. Database Schema** (`database/legal-receipts-schema.sql`)
- `legal_receipts` table (immutable records)
- `legal_receipt_access_log` table (audit trail)
- `legal_receipt_retention_extensions` table (extension tracking)
- Triggers to prevent updates/deletes
- Helper functions for retention management

### **4. AWS Infrastructure**
- **S3 Bucket Policy** (`aws/s3-bucket-policy.json`) - Deny deletes/overwrites
- **CloudFormation Template** (`aws/legal-receipts-bucket.yaml`) - Full infrastructure
- **Annual Extension Job** (`scripts/annual-retention-extension.js`) - Keep retention perpetually ahead

---

## 🛠️ **Setup Instructions**

### **Step 1: AWS Account Preparation**

1. **Enable Object Lock at account level:**
   ```bash
   # Contact AWS Support to enable Object Lock on your account
   # Required before creating Object Lock buckets
   ```

2. **Deploy CloudFormation stack:**
   ```bash
   aws cloudformation deploy \
     --template-file aws/legal-receipts-bucket.yaml \
     --stack-name legal-receipts-infrastructure \
     --capabilities CAPABILITY_NAMED_IAM
   ```

3. **Note outputs** (bucket ARN, KMS key ID, IAM role ARNs)

### **Step 2: Configure Environment Variables**

Add to your `.env`:
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Legal Receipts Bucket
AWS_LEGAL_RECEIPTS_BUCKET=fortheweebs-legal-receipts
AWS_LEGAL_RECEIPTS_BACKUP_BUCKET=fortheweebs-legal-receipts-backup

# KMS Keys (from CloudFormation outputs)
AWS_LEGAL_RECEIPTS_KMS_KEY=arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID
AWS_LEGAL_RECEIPTS_BACKUP_KMS_KEY=arn:aws:kms:us-west-2:ACCOUNT_ID:key/KEY_ID
```

### **Step 3: Create Supabase Tables**

1. Go to Supabase SQL Editor: https://iqipomerawkvtojbtvom.supabase.co/project/iqipomerawkvtojbtvom/sql
2. Paste contents of `database/legal-receipts-schema.sql`
3. Click **"Run"**
4. Verify tables created:
   ```sql
   SELECT * FROM legal_receipts LIMIT 1;
   SELECT * FROM legal_receipt_access_log LIMIT 1;
   SELECT * FROM legal_receipt_retention_extensions LIMIT 1;
   ```

### **Step 4: Apply S3 Bucket Policy**

1. Go to AWS S3 Console
2. Open `fortheweebs-legal-receipts` bucket
3. Navigate to **Permissions** → **Bucket Policy**
4. Paste contents of `aws/s3-bucket-policy.json`
5. Replace `ACCOUNT_ID` with your AWS account ID
6. Click **Save**

### **Step 5: Register API Routes**

Update `server.js` to add legal receipts route:
```javascript
const legalReceiptsRoute = require('./api/routes/legal-receipts');
app.use('/api/legal-receipts', legalReceiptsRoute);
```

### **Step 6: Install Dependencies**

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner pdfkit
```

### **Step 7: Setup Annual Retention Extension**

**Option A: AWS Lambda (Recommended)**
```bash
# Create Lambda function
aws lambda create-function \
  --function-name annual-retention-extension \
  --runtime nodejs18.x \
  --handler annual-retention-extension.runAnnualRetentionExtension \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::ACCOUNT_ID:role/LegalReceiptsWriter

# Create EventBridge rule (runs January 1st annually)
aws events put-rule \
  --name annual-retention-extension \
  --schedule-expression "cron(0 0 1 1 ? *)"

# Add Lambda as target
aws events put-targets \
  --rule annual-retention-extension \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:annual-retention-extension"
```

**Option B: Node.js Cron Job**
```javascript
// Add to your server.js or separate worker
const cron = require('node-cron');
const { runAnnualRetentionExtension } = require('./scripts/annual-retention-extension');

// Run January 1st at midnight
cron.schedule('0 0 1 1 *', async () => {
  console.log('🔄 Running annual retention extension job...');
  await runAnnualRetentionExtension();
});
```

---

## 📝 **Usage Examples**

### **Create Legal Receipt (Signup Integration)**

Update `src/CreatorSignup.jsx`:
```javascript
// After user accepts terms and creates account
const response = await fetch('/api/legal-receipts/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: newUser.id,
    email: newUser.email,
    termsVersion: 'v2.0',
    privacyVersion: 'v2.0',
    termsHash: 'SHA256_HASH_OF_TERMS_DOCUMENT',
    privacyHash: 'SHA256_HASH_OF_PRIVACY_DOCUMENT',
    ipAddress: clientIp,
    userAgent: navigator.userAgent
  })
});

const { receiptId, documentHash, retainUntilDate } = await response.json();
console.log(`✅ Legal receipt created: ${receiptId} (Immutable until ${retainUntilDate})`);
```

### **Download Receipt (User Dashboard)**

```javascript
// User requests download
const response = await fetch(`/api/legal-receipts/${receiptId}/download`);
const { downloadUrl, expiresIn } = await response.json();

// Show download link (expires in 5 minutes)
window.open(downloadUrl, '_blank');
```

### **Apply Legal Hold (Dispute)**

```javascript
// Admin applies legal hold during dispute
const response = await fetch(`/api/legal-receipts/${receiptId}/legal-hold`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'DISPUTE',
    appliedBy: 'admin@fortheweebs.com'
  })
});

const { legalHold } = await response.json();
console.log('🔒 Legal hold applied - receipt cannot be deleted');
```

---

## 🔒 **Security & Compliance**

### **Write-Once Guarantees**
- ✅ **No updates**: Postgres triggers block field modifications
- ✅ **No deletes**: Postgres triggers block deletions
- ✅ **No overwrites**: S3 bucket policy denies PutObject on existing keys
- ✅ **No deletions**: S3 bucket policy denies DeleteObject/DeleteObjectVersion

### **Access Control**
- **Writer Role**: Can only `PutObject` with Object Lock (no delete)
- **Reader Role**: Can only `GetObject` with version ID (read-only)
- **Signed URLs**: 5-minute expiry for downloads
- **Audit Logs**: Every access logged to `legal_receipt_access_log`

### **Retention Enforcement**
- **COMPLIANCE Mode**: Cannot be shortened, even by AWS root account
- **Far-Future Date**: 2099-12-31 (75+ years)
- **Annual Extension**: Automatic job adds 10 years when within 5 years of expiry
- **Legal Holds**: Block deletion indefinitely during disputes

### **Data Integrity**
- **SHA-256 Hashes**: Terms, Privacy, and PDF document hashes stored
- **Version IDs**: Immutable S3 version IDs tracked in Postgres
- **Dual Storage**: Both Postgres record and S3 object must match
- **Audit Trail**: Complete history of access and modifications

### **Disaster Recovery**
- **Cross-Region Replication**: Backup bucket in us-west-2
- **Independent KMS Keys**: Separate encryption keys for primary/backup
- **Versioning Enabled**: All object versions retained
- **CloudTrail Logging**: API calls logged for forensic analysis

---

## 📊 **Monitoring & Alerts**

### **CloudWatch Alarms**
- ❌ DeleteObject attempts (should be denied)
- ❌ PutObject without Object Lock
- ❌ Unencrypted uploads
- ⚠️ Retention dates within 5 years of expiry

### **EventBridge Rules**
- Alert on any S3 DeleteObject API calls
- Alert on retention extension job failures
- Alert on legal hold applications

### **Audit Reports**
```sql
-- Receipts created per month
SELECT 
  DATE_TRUNC('month', accepted_at) AS month,
  COUNT(*) AS receipts_created
FROM legal_receipts
GROUP BY month
ORDER BY month DESC;

-- Access patterns
SELECT 
  access_type,
  COUNT(*) AS access_count,
  DATE_TRUNC('day', accessed_at) AS date
FROM legal_receipt_access_log
GROUP BY access_type, date
ORDER BY date DESC;

-- Receipts needing extension soon
SELECT * FROM get_receipts_needing_extension();
```

---

## 🧪 **Testing**

### **Test Receipt Creation**
```bash
curl -X POST http://localhost:3001/api/legal-receipts/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "termsVersion": "v2.0",
    "privacyVersion": "v2.0",
    "termsHash": "abc123...",
    "privacyHash": "def456..."
  }'
```

### **Test Signed URL**
```bash
curl http://localhost:3001/api/legal-receipts/receipt-1234/download
```

### **Test Annual Extension Job**
```bash
node scripts/annual-retention-extension.js
```

---

## 💰 **Cost Estimation**

### **S3 Storage Costs**
- **Standard Storage**: $0.023/GB/month
- **Intelligent Tiering**: $0.0125/GB/month (after 90 days)
- **Expected**: ~1KB per receipt = $0.000023/month/receipt
- **10,000 receipts**: ~$2.30/year

### **S3 API Costs**
- **PutObject**: $0.005 per 1,000 requests
- **GetObject**: $0.0004 per 1,000 requests
- **Expected**: <$1/month for typical usage

### **KMS Costs**
- **Key Storage**: $1/month per key
- **Encryption/Decryption**: $0.03 per 10,000 requests
- **Expected**: ~$2/month

### **Total Estimated Cost**
- **Year 1 (10,000 receipts)**: ~$40/year
- **Year 10 (100,000 receipts)**: ~$60/year
- **Perpetual storage**: Minimal incremental cost (Intelligent Tiering)

---

## 🚨 **Legal Compliance**

### **E-SIGN Act Compliance**
✅ User intent to sign electronically (checkbox)  
✅ Electronic record provided to user (PDF receipt)  
✅ Record retention (immutable S3 storage)  
✅ Signature verification (SHA-256 hashes + metadata)

### **GDPR Compliance**
✅ Minimal PII in receipts (name, email, ID only)  
✅ Right to access (signed URLs)  
✅ Data portability (PDF download)  
⚠️ Right to erasure (Object Lock blocks deletion - legal basis required)

### **Discovery & Litigation**
✅ Legal holds prevent deletion during disputes  
✅ Complete audit trail of all access  
✅ Hash verification proves document integrity  
✅ Cross-region backup ensures availability

---

## 📞 **Support & Maintenance**

### **Manual Retention Extension**
```javascript
const { extendSpecificReceipt } = require('./scripts/annual-retention-extension');
await extendSpecificReceipt('receipt-1234', 20); // Extend by 20 years
```

### **Verify Object Lock Status**
```bash
aws s3api head-object \
  --bucket fortheweebs-legal-receipts \
  --key legal-receipts/2025/12/user-123/receipt-abc.pdf \
  --version-id VERSION_ID
```

### **Check Retention Date**
```sql
SELECT receipt_id, retain_until_date, legal_hold
FROM legal_receipts
WHERE receipt_id = 'receipt-1234';
```

---

## ✅ **Deployment Checklist**

- [ ] Enable Object Lock on AWS account
- [ ] Deploy CloudFormation stack (`legal-receipts-bucket.yaml`)
- [ ] Create Supabase tables (`legal-receipts-schema.sql`)
- [ ] Apply S3 bucket policy (`s3-bucket-policy.json`)
- [ ] Configure environment variables (`.env`)
- [ ] Register API routes (`server.js`)
- [ ] Install NPM dependencies
- [ ] Setup annual retention extension job (Lambda or cron)
- [ ] Configure CloudWatch alarms
- [ ] Test receipt creation and download
- [ ] Run retention extension job manually (verify)
- [ ] Update signup flow to create receipts
- [ ] Document for team (this file)

---

## 🎯 **Result: Lifetime-Locked Legal Protection**

Every user acceptance is now:
- ✅ **Immutable** (write-once, no modifications)
- ✅ **Perpetual** (2099-12-31 retention, extended annually)
- ✅ **Auditable** (full access logs + CloudTrail)
- ✅ **Recoverable** (cross-region backup)
- ✅ **Compliant** (E-SIGN Act, GDPR, litigation holds)

**Your legal receipts will outlive your platform.** 🚀
