# Legal Receipts Operations Guide

## Overview
Complete operational procedures for lifetime-locked legal receipt infrastructure with AWS S3 Object Lock, automated retention, legal holds, and self-healing audit system.

---

## Architecture Summary

### Storage Layers
1. **Primary Storage**: AWS S3 with Object Lock COMPLIANCE mode
2. **Cold Archive**: Lifecycle rules to Glacier Deep Archive after 90 days
3. **Cross-Region Backup**: Optional replication to secondary region
4. **Audit Logs**: Separate Object Lock bucket for immutable audit trail

### Access Control (IAM)
- **Writer Role**: Can only `PutObject` with retention (cannot read or delete)
- **Reader Role**: Can only `GetObject` and `GetObjectRetention` (cannot write or delete)
- **Admin Role**: Can apply/remove legal holds (MFA enforced)
- **No deletes allowed anywhere** (enforced by bucket policy)

---

## Daily Operations

### 1. Receipt Generation (Automatic)
**Trigger**: User accepts Terms v2.0 + Privacy v2.0  
**Process**: API creates PDF receipt → uploads to S3 with Object Lock → stores metadata in Postgres

```javascript
// Automatically called during signup
POST /api/legal-receipts/create
{
  "userId": "user-123",
  "acceptedAt": "2025-01-05T12:00:00Z",
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "termsVersion": "2.0",
  "privacyVersion": "2.0"
}
```

**Result**:
- PDF generated with immutable content hash
- Uploaded to S3: `receipts/LR-20250105-ABC123/receipt.pdf`
- Retention set to 2099-12-31 (75 years)
- Database record created in `legal_receipts` table

---

### 2. Manual Legal Hold (Admin Only)

#### Apply Legal Hold (Freeze Receipt)
```bash
aws s3api put-object-legal-hold \
  --bucket fortheweebs-legal-receipts \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=ON \
  --profile legal-hold-admin
```

**Effect**: Receipt cannot be deleted, even after retain-until date passes.

#### Remove Legal Hold (Unfreeze Receipt)
```bash
aws s3api put-object-legal-hold \
  --bucket fortheweebs-legal-receipts \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=OFF \
  --profile legal-hold-admin
```

**Effect**: Receipt follows normal Object Lock retention rules.

#### Check Legal Hold Status
```bash
aws s3api get-object-legal-hold \
  --bucket fortheweebs-legal-receipts \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --profile legal-hold-admin
```

---

### 3. Automated Audit Scripts

#### List All Legal Holds
```bash
node scripts/legal-hold/list-legal-holds.js
```

**Output**: JSON list of all receipts with hold status (ON/OFF/MISSING/ERROR)

#### Export to CSV
```bash
node scripts/legal-hold/export-audit-csv.js legal-hold-audit-2025-01-05.csv
```

**Output**: CSV file with user_id, receipt_id, hold_status, accepted_at

#### Sync to Database
```bash
node scripts/legal-hold/sync-audit-to-db.js
```

**Effect**: Inserts S3 status into `legal_hold_audit_inventory` table for searchable queries

#### Detect Discrepancies
```bash
node scripts/legal-hold/detect-discrepancies.js
```

**Effect**: Compares database vs S3, logs mismatches to `legal_hold_discrepancies` table

#### Auto-Correct Database
```bash
# Dry run (preview changes)
DRY_RUN=true node scripts/legal-hold/auto-correct-audit.js

# Apply corrections
node scripts/legal-hold/auto-correct-audit.js
```

**Effect**: Updates database to match S3 (source of truth), sends Slack/email alerts

---

## Weekly Maintenance

### Monday: Full Audit Sync
```bash
# 1. Export current state to CSV (backup)
node scripts/legal-hold/export-audit-csv.js weekly-audit-$(date +%Y-%m-%d).csv

# 2. Sync S3 status to database
node scripts/legal-hold/sync-audit-to-db.js

# 3. Detect any discrepancies
node scripts/legal-hold/detect-discrepancies.js

# 4. Auto-correct if needed
node scripts/legal-hold/auto-correct-audit.js
```

### Wednesday: Discrepancy Review
```sql
-- Check for any unresolved discrepancies
SELECT 
  receipt_id,
  db_status,
  s3_status,
  detected_at,
  corrected
FROM legal_hold_discrepancies
WHERE corrected = false
ORDER BY detected_at DESC;
```

### Friday: Legal Hold Inventory
```bash
# Generate weekly report
node scripts/legal-hold/list-legal-holds.js > weekly-holds-$(date +%Y-%m-%d).json
```

---

## Monthly Procedures

### First Monday: Retention Review
```sql
-- Find receipts approaching retention expiry (within 5 years)
SELECT 
  receipt_id,
  user_id,
  retain_until_date,
  DATE_PART('year', retain_until_date - NOW()) AS years_remaining
FROM legal_receipts
WHERE retain_until_date < NOW() + INTERVAL '5 years'
ORDER BY retain_until_date ASC;
```

### Mid-Month: CloudTrail Audit
```bash
# Review all legal hold actions
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=PutObjectLegalHold \
  --start-time $(date -d '30 days ago' +%s) \
  --max-results 100
```

### End-of-Month: Compliance Report
```sql
-- Summary statistics
SELECT 
  COUNT(*) AS total_receipts,
  COUNT(CASE WHEN legal_hold_status = 'ON' THEN 1 END) AS holds_active,
  COUNT(CASE WHEN legal_hold_status = 'OFF' THEN 1 END) AS holds_inactive,
  MIN(accepted_at) AS oldest_receipt,
  MAX(accepted_at) AS newest_receipt
FROM legal_receipts;
```

---

## Annual Tasks

### January 1st: Retention Extension (Automated)
**Lambda Job**: `scripts/annual-retention-extension.js`  
**Trigger**: EventBridge cron rule `0 0 1 1 ? *` (midnight, January 1st)

**Process**:
1. Query all receipts within 5 years of retention expiry
2. Extend `retain_until_date` by 10 years
3. Update S3 Object Lock retention
4. Log extension to `legal_receipt_retention_extensions` table

**Manual Verification**:
```sql
-- Check extensions performed this year
SELECT 
  receipt_id,
  previous_retain_until,
  new_retain_until,
  years_extended,
  extended_at
FROM legal_receipt_retention_extensions
WHERE extended_at >= DATE_TRUNC('year', NOW())
ORDER BY extended_at DESC;
```

### Quarterly: IAM Credential Rotation
```bash
# Generate new access keys for admin role
aws iam create-access-key --user-name legal-hold-admin

# Update environment variables
export AWS_ACCESS_KEY_ID=<new-key-id>
export AWS_SECRET_ACCESS_KEY=<new-secret-key>

# Delete old access keys
aws iam delete-access-key --user-name legal-hold-admin --access-key-id <old-key-id>
```

### Annual: Disaster Recovery Test
```bash
# Test cross-region replication
aws s3api list-objects-v2 \
  --bucket fortheweebs-legal-receipts-backup \
  --prefix receipts/ \
  --max-keys 100

# Verify Object Lock on backup bucket
aws s3api get-object-lock-configuration \
  --bucket fortheweebs-legal-receipts-backup
```

---

## Alerts & Monitoring

### Slack Alerts (Automatic)
Set `SLACK_WEBHOOK_URL` environment variable to receive:
- ⚠️ Discrepancies detected (from `detect-discrepancies.js`)
- 🔧 Auto-corrections applied (from `auto-correct-audit.js`)
- ❌ Delete attempts blocked (from CloudWatch Events)

### Email Alerts (Automatic)
Set `SES_ALERT_EMAIL` and `SES_FROM_EMAIL` to receive:
- Weekly audit summaries
- Monthly compliance reports
- Critical security events

### CloudWatch Alarms
1. **Delete Attempt Alert**: Triggers when S3 bucket policy blocks delete operation
2. **Retention Extension Failure**: Triggers if Lambda job fails on January 1st
3. **Legal Hold Unauthorized Access**: Triggers if non-admin attempts legal hold operation

---

## Troubleshooting

### Issue: Discrepancy Won't Auto-Correct
**Symptom**: `auto-correct-audit.js` fails to update database  
**Cause**: Database trigger blocking updates  
**Solution**: Check if `prevent_immutable_updates()` trigger is interfering with `legal_hold_status` field

```sql
-- Temporarily disable trigger (dangerous!)
ALTER TABLE legal_receipts DISABLE TRIGGER prevent_immutable_updates;

-- Run correction manually
UPDATE legal_receipts 
SET legal_hold_status = 'ON' 
WHERE receipt_id = 'LR-20250105-ABC123';

-- Re-enable trigger
ALTER TABLE legal_receipts ENABLE TRIGGER prevent_immutable_updates;
```

### Issue: Legal Hold Command Fails
**Symptom**: `AccessDenied` error when applying legal hold  
**Cause**: Not using admin role credentials  
**Solution**: Ensure AWS profile is set to `legal-hold-admin`

```bash
# Verify current identity
aws sts get-caller-identity

# Should show: arn:aws:iam::123456789012:role/LegalHoldAdminRole
```

### Issue: Retention Extension Didn't Run
**Symptom**: No entries in `legal_receipt_retention_extensions` table after January 1st  
**Cause**: Lambda job failed or not triggered  
**Solution**: Check Lambda logs and EventBridge rule

```bash
# Check Lambda execution logs
aws logs tail /aws/lambda/annual-retention-extension --follow

# Test Lambda manually
aws lambda invoke \
  --function-name annual-retention-extension \
  --payload '{}' \
  response.json
```

---

## Security Best Practices

### 1. MFA Enforcement
Always require MFA for admin role:
```json
{
  "Condition": {
    "Bool": {"aws:MultiFactorAuthPresent": "true"}
  }
}
```

### 2. IP Whitelisting
Restrict admin access to corporate network:
```json
{
  "Condition": {
    "IpAddress": {
      "aws:SourceIp": ["203.0.113.0/24"]
    }
  }
}
```

### 3. Session Duration Limits
Set maximum session duration for admin role:
```bash
aws iam update-role \
  --role-name LegalHoldAdminRole \
  --max-session-duration 3600  # 1 hour
```

### 4. Audit Trail Immutability
Push audit CSV snapshots to separate Object Lock bucket:
```bash
aws s3 cp legal-hold-audit.csv \
  s3://fortheweebs-audit-logs/legal-hold-audits/$(date +%Y-%m-%d).csv \
  --server-side-encryption aws:kms \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date $(date -d '+75 years' +%Y-%m-%dT%H:%M:%S)
```

---

## Compliance Checklist

### Daily
- ✅ Receipts generated for all new signups
- ✅ Receipts uploaded with Object Lock enabled
- ✅ Retention dates set to far-future (2099-12-31)

### Weekly
- ✅ Audit sync completed (DB matches S3)
- ✅ No unresolved discrepancies
- ✅ Legal hold inventory exported

### Monthly
- ✅ CloudTrail logs reviewed for unauthorized access
- ✅ Compliance report generated
- ✅ No receipts approaching deletion

### Quarterly
- ✅ IAM credentials rotated
- ✅ Admin role access reviewed
- ✅ Disaster recovery tested

### Annually
- ✅ Retention extension job ran successfully
- ✅ All receipts extended by 10 years
- ✅ Cross-region replication verified

---

## Emergency Procedures

### Unauthorized Legal Hold Removal
```bash
# 1. Re-apply legal hold immediately
aws s3api put-object-legal-hold \
  --bucket fortheweebs-legal-receipts \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=ON

# 2. Log incident
psql -d supabase_db -c "
  INSERT INTO legal_hold_audit_log 
    (receipt_id, action, reason, applied_by, notes, success) 
  VALUES 
    ('LR-20250105-ABC123', 'apply', 'TAMPERING_DETECTED', 'security-team@example.com', 'Emergency re-application after unauthorized removal', true);
"

# 3. Revoke admin access
aws iam list-access-keys --user-name legal-hold-admin \
  | jq -r '.AccessKeyMetadata[].AccessKeyId' \
  | xargs -I {} aws iam update-access-key --user-name legal-hold-admin --access-key-id {} --status Inactive
```

### S3 Bucket Deletion Attempt
**Automatic**: Bucket policy blocks all deletes, EventBridge sends alert  
**Manual**: Review CloudTrail logs to identify attacker

```bash
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteObject \
  --start-time $(date -d '1 hour ago' +%s)
```

### Database Corruption
**Symptom**: `legal_receipts` table has missing records  
**Recovery**: S3 is source of truth; rebuild database from S3 metadata

```bash
node scripts/rebuild-receipts-from-s3.js  # TODO: Create this script
```

---

## Cost Optimization

### Current Costs (Est. 10,000 receipts/year)
- **S3 Standard (0-90 days)**: $0.023/GB * 0.5GB = $0.01/month
- **Glacier Deep Archive (90+ days)**: $0.00099/GB * 5GB = $0.005/month
- **Object Lock**: Free
- **KMS Encryption**: $1/month (first 20k requests free)
- **Cross-Region Replication**: $0.02/GB * 5GB = $0.10/month
- **CloudTrail Logs**: $2/month (first trail free)
- **Lambda (retention extension)**: <$0.01/year (runs once)
- **Total**: ~$3-4/month = **~$40/year**

### Optimizations
1. **Lifecycle Rule**: Move to Glacier after 90 days (90% cost reduction)
2. **Intelligent Tiering**: Automatically move rarely accessed objects to cheaper storage
3. **Batch Operations**: Use S3 Batch Operations for bulk retention extensions (cheaper than Lambda)

---

## Support Contacts

- **AWS Support**: https://console.aws.amazon.com/support
- **Supabase Support**: https://supabase.com/support
- **Legal Team**: legal@fortheweebs.com
- **Compliance Officer**: compliance@fortheweebs.com
- **Security Incidents**: security@fortheweebs.com

---

## Additional Resources

- [AWS S3 Object Lock Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Legal Receipts Architecture](./LEGAL_RECEIPTS_LIFETIME_STORAGE.md)
- [IAM Policy Guide](./LEGAL_HOLD_IAM_POLICY.md)
- [Bucket Policy JSON](./aws/s3-bucket-policy.json)
- [CloudFormation Template](./aws/legal-receipts-bucket.yaml)
