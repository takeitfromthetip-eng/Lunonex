/**
 * Legal Receipts Configuration - Lifetime-Locked Storage
 * 
 * ARCHITECTURE:
 * - Immutable write-once storage with AWS S3 Object Lock (COMPLIANCE mode)
 * - Far-future retention dates (2099-12-31) with annual extension jobs
 * - Legal holds for disputes (blocks deletion even past retain date)
 * - Dual evidence: Postgres record + sealed PDF in S3
 * - Zero delete/overwrite paths enforced via bucket policy
 * - Cross-region replication for disaster recovery
 * - Full audit logging with CloudTrail + S3 access logs
 */

const crypto = require('crypto');

// AWS S3 Configuration for Legal Receipts
const LEGAL_RECEIPTS_CONFIG = {
  // Primary bucket (Object Lock enabled)
  bucket: process.env.AWS_LEGAL_RECEIPTS_BUCKET || 'fortheweebs-legal-receipts',
  region: process.env.AWS_REGION || 'us-east-1',
  
  // Backup bucket (cross-region replication)
  backupBucket: process.env.AWS_LEGAL_RECEIPTS_BACKUP_BUCKET || 'fortheweebs-legal-receipts-backup',
  backupRegion: 'us-west-2',
  
  // KMS encryption keys
  kmsKeyId: process.env.AWS_LEGAL_RECEIPTS_KMS_KEY,
  backupKmsKeyId: process.env.AWS_LEGAL_RECEIPTS_BACKUP_KMS_KEY,
  
  // Object Lock settings
  objectLock: {
    mode: 'COMPLIANCE', // Cannot be shortened or removed, even by root
    retainUntilDate: '2099-12-31T23:59:59Z', // Far-future date
    legalHoldEnabled: true // Enable legal holds for disputes
  },
  
  // Retention extension (annual job to keep perpetually ahead)
  retentionExtension: {
    enabled: true,
    extendByYears: 10, // Add 10 years when within 5 years of expiry
    checkIntervalDays: 365 // Run annually
  },
  
  // Access control
  accessControl: {
    writerRole: 'arn:aws:iam::ACCOUNT_ID:role/LegalReceiptsWriter',
    readerRole: 'arn:aws:iam::ACCOUNT_ID:role/LegalReceiptsReader',
    signedUrlExpirySeconds: 300 // 5 minutes for downloads
  },
  
  // Audit logging
  logging: {
    accessLogsBucket: 'fortheweebs-legal-receipts-logs',
    cloudTrailEnabled: true,
    alertOnDeleteAttempts: true
  }
};

// Generate unique receipt ID (immutable key)
function generateReceiptId(userId, timestamp) {
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}-${timestamp}-${crypto.randomBytes(16).toString('hex')}`)
    .digest('hex');
  
  return `receipt-${timestamp}-${hash.substring(0, 16)}`;
}

// Calculate document hash for integrity verification
function calculateDocumentHash(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');
}

// Generate S3 key path (write-once, no overwrites)
function generateS3Key(userId, receiptId, documentType = 'acceptance') {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  
  // Path: legal-receipts/{year}/{month}/{userId}/{receiptId}-{type}.pdf
  return `legal-receipts/${year}/${month}/${userId}/${receiptId}-${documentType}.pdf`;
}

// Far-future retention date (2099-12-31)
function getFarFutureRetentionDate() {
  return new Date('2099-12-31T23:59:59Z');
}

// Check if retention date needs extension
function needsRetentionExtension(currentRetainUntil) {
  const fiveYearsFromNow = new Date();
  fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
  
  return new Date(currentRetainUntil) < fiveYearsFromNow;
}

// Calculate new retention date (extend by 10 years)
function extendRetentionDate(currentRetainUntil, yearsToAdd = 10) {
  const newDate = new Date(currentRetainUntil);
  newDate.setFullYear(newDate.getFullYear() + yearsToAdd);
  return newDate;
}

// Receipt metadata structure
function createReceiptMetadata(acceptanceData) {
  return {
    receiptId: generateReceiptId(acceptanceData.userId, acceptanceData.timestamp),
    userId: acceptanceData.userId,
    email: acceptanceData.email,
    acceptedAt: acceptanceData.timestamp,
    ipAddress: acceptanceData.ipAddress,
    userAgent: acceptanceData.userAgent,
    termsVersion: acceptanceData.termsVersion,
    privacyVersion: acceptanceData.privacyVersion,
    termsHash: acceptanceData.termsHash,
    privacyHash: acceptanceData.privacyHash,
    documentHash: null, // Set after PDF generation
    s3Key: null, // Set after upload
    s3VersionId: null, // Immutable version ID
    retainUntilDate: getFarFutureRetentionDate().toISOString(),
    legalHold: false, // Set to true during disputes
    createdAt: new Date().toISOString(),
    immutable: true // Flag indicating write-once status
  };
}

// Legal hold management
const LEGAL_HOLD_REASONS = {
  DISPUTE: 'User dispute filed - evidence preservation required',
  INVESTIGATION: 'Internal investigation - record retention required',
  LITIGATION: 'Active litigation - legal hold applied',
  REGULATORY: 'Regulatory audit - compliance hold applied',
  COURT_ORDER: 'Court order received - mandatory retention'
};

module.exports = {
  LEGAL_RECEIPTS_CONFIG,
  generateReceiptId,
  calculateDocumentHash,
  generateS3Key,
  getFarFutureRetentionDate,
  needsRetentionExtension,
  extendRetentionDate,
  createReceiptMetadata,
  LEGAL_HOLD_REASONS
};
