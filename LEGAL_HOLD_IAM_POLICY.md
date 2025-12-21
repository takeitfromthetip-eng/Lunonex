# Legal Hold IAM Policy Setup

## Overview
This IAM policy restricts `s3:PutObjectLegalHold` and `s3:GetObjectLegalHold` permissions **exclusively** to a single admin role (`LegalHoldAdminRole`). All other principals are explicitly denied, preventing unauthorized legal hold manipulation.

---

## Security Model

### ✅ What Admins Can Do (LegalHoldAdminRole)
- Apply legal holds (`PutObjectLegalHold`)
- Remove legal holds (`PutObjectLegalHold` with Status: OFF)
- Check legal hold status (`GetObjectLegalHold`)
- Read receipt PDFs (`GetObject`, `GetObjectVersion`)
- View retention settings (`GetObjectRetention`)
- List bucket contents (`ListBucket`)
- View Object Lock configuration (`GetBucketObjectLockConfiguration`)

### ❌ What Everyone Else Cannot Do
- Cannot apply legal holds
- Cannot remove legal holds
- Cannot view legal hold status
- Cannot bypass Object Lock COMPLIANCE mode
- Cannot delete receipts (enforced by S3 bucket policy + Object Lock)

---

## Setup Instructions

### Step 1: Create IAM Role
```bash
aws iam create-role \
  --role-name LegalHoldAdminRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'
```

**For Human Users:** Replace `"Principal": {"Service": "ec2.amazonaws.com"}` with:
```json
{
  "Principal": {
    "AWS": "arn:aws:iam::ACCOUNT_ID:user/admin-username"
  }
}
```

### Step 2: Attach Policy to Bucket
1. Replace placeholders in `legal-hold-admin-policy.json`:
   - `ACCOUNT_ID` - Your AWS account ID (12 digits)
   - `LEGAL_RECEIPTS_BUCKET_NAME` - Bucket name from CloudFormation output
   - `ORGANIZATION_ID` - (Optional) Your AWS Organization ID for extra security

2. Apply the policy:
```bash
aws s3api put-bucket-policy \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --policy file://aws/legal-hold-admin-policy.json
```

### Step 3: Attach IAM Permissions to Role
```bash
aws iam put-role-policy \
  --role-name LegalHoldAdminRole \
  --policy-name LegalHoldAdminPermissions \
  --policy-document file://aws/legal-hold-admin-policy.json
```

### Step 4: Assign Role to Admin User
```bash
# For EC2 instances
aws ec2 associate-iam-instance-profile \
  --instance-id i-1234567890abcdef0 \
  --iam-instance-profile Name=LegalHoldAdminRole

# For direct user access
aws iam attach-user-policy \
  --user-name admin-username \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/LegalHoldAdminPermissions
```

### Step 5: Update Backend Configuration
Add to `.env`:
```bash
AWS_LEGAL_HOLD_ADMIN_ROLE_ARN=arn:aws:iam::ACCOUNT_ID:role/LegalHoldAdminRole
```

Add to `config/legalReceipts.js`:
```javascript
// IAM role authorized for legal hold operations
LEGAL_HOLD_ADMIN_ROLE: process.env.AWS_LEGAL_HOLD_ADMIN_ROLE_ARN || 'arn:aws:iam::ACCOUNT_ID:role/LegalHoldAdminRole',

// Verify caller has admin role before legal hold operations
async verifyLegalHoldAdmin(userArn) {
  return userArn === this.LEGAL_HOLD_ADMIN_ROLE;
}
```

---

## Testing

### Test 1: Admin Can Apply Legal Hold
```bash
# Assume LegalHoldAdminRole credentials
export AWS_ACCESS_KEY_ID=<admin-access-key>
export AWS_SECRET_ACCESS_KEY=<admin-secret-key>

# Apply legal hold
aws s3api put-object-legal-hold \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=ON

# Verify
aws s3api get-object-legal-hold \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --key receipts/LR-20250105-ABC123/receipt.pdf
# Expected: {"LegalHold": {"Status": "ON"}}
```

### Test 2: Non-Admin Cannot Apply Legal Hold
```bash
# Use non-admin credentials
export AWS_ACCESS_KEY_ID=<regular-user-access-key>
export AWS_SECRET_ACCESS_KEY=<regular-user-secret-key>

# Attempt to apply legal hold
aws s3api put-object-legal-hold \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=ON
# Expected: AccessDenied error
```

### Test 3: Admin Can Remove Legal Hold
```bash
# Assume LegalHoldAdminRole credentials
aws s3api put-object-legal-hold \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=OFF

# Verify
aws s3api get-object-legal-hold \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --key receipts/LR-20250105-ABC123/receipt.pdf
# Expected: {"LegalHold": {"Status": "OFF"}}
```

---

## Multi-Admin Setup (Optional)

To allow multiple admins:

1. **Create Admin Group:**
```bash
aws iam create-group --group-name LegalHoldAdmins
```

2. **Attach Policy to Group:**
```bash
aws iam put-group-policy \
  --group-name LegalHoldAdmins \
  --policy-name LegalHoldAdminPermissions \
  --policy-document file://aws/legal-hold-admin-policy.json
```

3. **Add Users to Group:**
```bash
aws iam add-user-to-group \
  --user-name admin1 \
  --group-name LegalHoldAdmins

aws iam add-user-to-group \
  --user-name admin2 \
  --group-name LegalHoldAdmins
```

4. **Update Policy Principal:**
Replace in `legal-hold-admin-policy.json`:
```json
{
  "Principal": {
    "AWS": [
      "arn:aws:iam::ACCOUNT_ID:user/admin1",
      "arn:aws:iam::ACCOUNT_ID:user/admin2"
    ]
  }
}
```

---

## Audit Verification

### Check Who Has Legal Hold Access
```bash
# List all principals with PutObjectLegalHold permission
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::ACCOUNT_ID:role/LegalHoldAdminRole \
  --action-names s3:PutObjectLegalHold s3:GetObjectLegalHold \
  --resource-arns arn:aws:s3:::LEGAL_RECEIPTS_BUCKET_NAME/*
```

### Monitor Legal Hold Changes
```bash
# CloudTrail query for legal hold events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=PutObjectLegalHold \
  --max-results 50
```

### Database Audit Log
```sql
-- View all legal hold actions
SELECT 
  receipt_id,
  action,
  reason,
  applied_by,
  performed_at,
  success,
  error_message
FROM legal_hold_audit_log
ORDER BY performed_at DESC
LIMIT 50;

-- Find unauthorized attempts
SELECT * FROM legal_hold_audit_log
WHERE success = false
  AND applied_by NOT LIKE '%admin%';
```

---

## Security Best Practices

1. **Rotate Admin Credentials Quarterly:**
```bash
aws iam create-access-key --user-name admin-username
aws iam delete-access-key --user-name admin-username --access-key-id OLD_KEY_ID
```

2. **Enable MFA for Admin Role:**
```json
{
  "Condition": {
    "Bool": {"aws:MultiFactorAuthPresent": "true"}
  }
}
```

3. **Restrict to Specific IP Ranges:**
```json
{
  "Condition": {
    "IpAddress": {
      "aws:SourceIp": ["203.0.113.0/24", "198.51.100.0/24"]
    }
  }
}
```

4. **Log All Assume-Role Events:**
```bash
aws cloudtrail create-trail \
  --name legal-hold-admin-trail \
  --s3-bucket-name audit-logs-bucket \
  --include-global-service-events
```

---

## Emergency Procedures

### Revoke Admin Access Immediately
```bash
# Detach all policies
aws iam list-attached-role-policies --role-name LegalHoldAdminRole \
  | jq -r '.AttachedPolicies[].PolicyArn' \
  | xargs -I {} aws iam detach-role-policy --role-name LegalHoldAdminRole --policy-arn {}

# Disable all access keys
aws iam list-access-keys --user-name admin-username \
  | jq -r '.AccessKeyMetadata[].AccessKeyId' \
  | xargs -I {} aws iam update-access-key --user-name admin-username --access-key-id {} --status Inactive
```

### Investigate Suspicious Legal Hold Changes
```bash
# Get CloudTrail events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=PutObjectLegalHold \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-05T23:59:59Z \
  | jq '.Events[] | {time: .EventTime, user: .Username, ip: .SourceIPAddress, receipt: .Resources[0].ResourceName}'
```

### Restore Legal Hold on Tampered Receipt
```bash
# Re-apply legal hold
aws s3api put-object-legal-hold \
  --bucket LEGAL_RECEIPTS_BUCKET_NAME \
  --key receipts/LR-20250105-ABC123/receipt.pdf \
  --legal-hold Status=ON

# Log incident
psql -d supabase_db -c "
  INSERT INTO legal_hold_audit_log 
    (receipt_id, action, reason, applied_by, notes, success) 
  VALUES 
    ('LR-20250105-ABC123', 'apply', 'TAMPERING_DETECTED', 'security-team@example.com', 'Emergency re-application after unauthorized removal attempt', true);
"
```

---

## Cost Impact
- **IAM Policies:** Free
- **CloudTrail Logging:** ~$2/month (first trail free, $0.10/100k events after)
- **S3 Access Logs:** ~$0.10/month (minimal storage)
- **Total:** ~$2.10/month additional cost for complete audit trail

---

## Compliance Notes
- **SOC 2:** Satisfies access control requirements (AC-3, AC-6)
- **HIPAA:** Meets minimum necessary access principle (164.514(d))
- **GDPR:** Supports "appropriate technical measures" (Article 32)
- **ISO 27001:** Aligns with A.9.2.3 (Management of privileged access rights)

---

## Troubleshooting

### Error: "Access Denied" when applying legal hold
**Cause:** Caller lacks `s3:PutObjectLegalHold` permission  
**Solution:** Verify caller is using LegalHoldAdminRole credentials

### Error: "Bucket policy conflicts with IAM policy"
**Cause:** Explicit Deny in bucket policy overrides IAM Allow  
**Solution:** Check `s3-bucket-policy.json` for conflicting Deny statements

### Legal hold not persisting after application
**Cause:** Object Lock not enabled on bucket  
**Solution:** Verify Object Lock is enabled:
```bash
aws s3api get-object-lock-configuration --bucket LEGAL_RECEIPTS_BUCKET_NAME
```

### Admin role can't remove legal hold
**Cause:** `PutObjectLegalHold` permission required for both apply and remove  
**Solution:** Verify policy includes `s3:PutObjectLegalHold` (not just `GetObjectLegalHold`)

---

## Support
For issues with this IAM policy:
1. Check CloudTrail logs for AccessDenied events
2. Run `aws iam simulate-principal-policy` to test permissions
3. Verify bucket policy and IAM policy don't conflict
4. Contact AWS Support for Object Lock edge cases
