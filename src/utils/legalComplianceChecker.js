/**
 * Legal Compliance Checker
 *
 * Ensures platform stays legally compliant:
 * - COPPA (Children's Online Privacy Protection Act)
 * - GDPR (General Data Protection Regulation)
 * - DMCA (Digital Millennium Copyright Act)
 * - 18 U.S.C. § 2257 (Adult content age verification)
 * - Section 230 (Content moderation requirements)
 * - State-specific laws
 */

class LegalComplianceChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.criticalIssues = [];
  }

  /**
   * Run full compliance check
   */
  async runFullCheck() {
    console.log('⚖️ Running legal compliance check...');

    this.violations = [];
    this.warnings = [];
    this.criticalIssues = [];

    // Run all checks
    await this.checkCOPPA();
    await this.checkGDPR();
    await this.checkDMCA();
    await this.check2257Compliance();
    await this.checkContentModeration();
    await this.checkAgeVerification();
    await this.checkDataPrivacy();
    await this.checkTermsOfService();
    await this.checkPrivacyPolicy();

    const report = this.generateReport();
    console.log('✅ Compliance check complete');

    return report;
  }

  /**
   * COPPA Compliance - No users under 13
   */
  async checkCOPPA() {
    const issues = [];

    // Check if age gate exists
    const hasAgeGate = this.checkFileExists('src/components/AgeGate.jsx');
    if (!hasAgeGate) {
      issues.push({
        severity: 'CRITICAL',
        law: 'COPPA',
        issue: 'No age gate found',
        fix: 'Create age verification before allowing access',
        file: 'src/components/AgeGate.jsx'
      });
    }

    // Check minimum age enforcement
    const minAge = parseInt(process.env.MINIMUM_AGE || '18');
    if (minAge < 13) {
      issues.push({
        severity: 'CRITICAL',
        law: 'COPPA',
        issue: 'Minimum age below 13',
        fix: 'Set MINIMUM_AGE=18 in .env (18+ recommended for adult platform)',
        file: '.env'
      });
    }

    if (issues.length > 0) {
      this.criticalIssues.push(...issues);
    } else {
      console.log('✅ COPPA compliant');
    }

    return issues;
  }

  /**
   * GDPR Compliance - EU data protection
   */
  async checkGDPR() {
    const issues = [];

    // Check privacy policy exists
    const hasPrivacyPolicy = this.checkFileExists('public/legal/privacy-policy.html');
    if (!hasPrivacyPolicy) {
      issues.push({
        severity: 'CRITICAL',
        law: 'GDPR',
        issue: 'No privacy policy found',
        fix: 'Create privacy policy at public/legal/privacy-policy.html',
        file: 'public/legal/privacy-policy.html'
      });
    }

    // Check data deletion capability
    const hasDataDeletion = this.checkFileExists('api/gdpr-delete-user.js');
    if (!hasDataDeletion) {
      issues.push({
        severity: 'HIGH',
        law: 'GDPR',
        issue: 'No user data deletion endpoint',
        fix: 'Create GDPR-compliant data deletion API',
        file: 'api/gdpr-delete-user.js'
      });
    }

    // Check data export capability
    const hasDataExport = this.checkFileExists('api/gdpr-export-user-data.js');
    if (!hasDataExport) {
      issues.push({
        severity: 'HIGH',
        law: 'GDPR',
        issue: 'No user data export endpoint',
        fix: 'Create GDPR-compliant data export API',
        file: 'api/gdpr-export-user-data.js'
      });
    }

    // Check cookie consent
    const hasCookieConsent = this.checkFileExists('src/components/CookieConsent.jsx');
    if (!hasCookieConsent) {
      this.warnings.push({
        severity: 'MEDIUM',
        law: 'GDPR',
        issue: 'No cookie consent banner',
        fix: 'Add cookie consent for EU visitors',
        file: 'src/components/CookieConsent.jsx'
      });
    }

    if (issues.length > 0) {
      this.criticalIssues.push(...issues.filter(i => i.severity === 'CRITICAL'));
      this.violations.push(...issues.filter(i => i.severity === 'HIGH'));
    } else {
      console.log('✅ GDPR compliant');
    }

    return issues;
  }

  /**
   * DMCA Compliance - Copyright takedowns
   */
  async checkDMCA() {
    const issues = [];

    // Check DMCA policy exists
    const hasDMCAPolicy = this.checkFileExists('public/legal/dmca-policy.html');
    if (!hasDMCAPolicy) {
      issues.push({
        severity: 'CRITICAL',
        law: 'DMCA',
        issue: 'No DMCA policy found',
        fix: 'Create DMCA takedown policy',
        file: 'public/legal/dmca-policy.html'
      });
    }

    // Check DMCA handler exists
    const hasDMCAHandler = this.checkFileExists('api/dmca-handler.js');
    if (!hasDMCAHandler) {
      issues.push({
        severity: 'CRITICAL',
        law: 'DMCA',
        issue: 'No DMCA takedown handler',
        fix: 'Create DMCA request processing API',
        file: 'api/dmca-handler.js'
      });
    }

    // Check designated agent info
    const custodianEmail = process.env.CUSTODIAN_EMAIL;
    if (!custodianEmail || custodianEmail === 'custodian@fortheweebs.com') {
      this.warnings.push({
        severity: 'MEDIUM',
        law: 'DMCA',
        issue: 'DMCA agent email not configured',
        fix: 'Set real CUSTODIAN_EMAIL in .env and register with Copyright Office',
        file: '.env'
      });
    }

    if (issues.length > 0) {
      this.criticalIssues.push(...issues);
    } else {
      console.log('✅ DMCA compliant');
    }

    return issues;
  }

  /**
   * 2257 Compliance - Adult content age verification
   */
  async check2257Compliance() {
    const issues = [];

    // Check ID encryption key exists
    const hasEncryptionKey = !!process.env.ID_ENCRYPTION_KEY;
    if (!hasEncryptionKey) {
      issues.push({
        severity: 'CRITICAL',
        law: '18 U.S.C. § 2257',
        issue: 'No ID encryption key configured',
        fix: 'Generate and set ID_ENCRYPTION_KEY in .env',
        file: '.env'
      });
    }

    // Check custodian info
    const custodianName = process.env.CUSTODIAN_NAME;
    if (!custodianName || custodianName === 'ForTheWeebs LLC') {
      this.warnings.push({
        severity: 'HIGH',
        law: '18 U.S.C. § 2257',
        issue: 'Custodian of records not configured',
        fix: 'Set real custodian info in .env (required for adult content)',
        file: '.env'
      });
    }

    // Check age verification for adult content
    const hasAgeVerification = this.checkFileExists('src/utils/ageVerification.js');
    if (!hasAgeVerification) {
      this.warnings.push({
        severity: 'HIGH',
        law: '18 U.S.C. § 2257',
        issue: 'No age verification system for adult content',
        fix: 'Implement age verification before allowing adult content',
        file: 'src/utils/ageVerification.js'
      });
    }

    if (issues.length > 0) {
      this.criticalIssues.push(...issues);
    } else {
      console.log('✅ 2257 compliant');
    }

    return issues;
  }

  /**
   * Content Moderation - Section 230 protections
   */
  async checkContentModeration() {
    const issues = [];

    // Check moderation system exists
    const hasModeration = this.checkFileExists('src/utils/uploadModerationFlow.js');
    if (!hasModeration) {
      issues.push({
        severity: 'CRITICAL',
        law: 'Section 230',
        issue: 'No content moderation system',
        fix: 'Implement content scanning before storage',
        file: 'src/utils/uploadModerationFlow.js'
      });
    }

    // Check CSAM detection
    const hasCSAMDetection = !!process.env.OPENAI_API_KEY;
    if (!hasCSAMDetection) {
      issues.push({
        severity: 'CRITICAL',
        law: 'CSAM Laws',
        issue: 'No CSAM detection configured',
        fix: 'Set OPENAI_API_KEY for GPT-4 Vision scanning',
        file: '.env'
      });
    }

    // Check PhotoDNA for user-generated content
    const hasPhotoDNA = !!process.env.PHOTODNA_API_KEY;
    if (!hasPhotoDNA) {
      this.warnings.push({
        severity: 'CRITICAL',
        law: 'Section 230 / CSAM',
        issue: 'PhotoDNA not configured - social features should stay locked',
        fix: 'Apply for PhotoDNA before enabling social media',
        file: '.env'
      });
    }

    if (issues.length > 0) {
      this.criticalIssues.push(...issues);
    } else {
      console.log('✅ Content moderation compliant');
    }

    return issues;
  }

  /**
   * Age Verification
   */
  async checkAgeVerification() {
    const issues = [];

    // Check minimum age is set
    const minAge = parseInt(process.env.MINIMUM_AGE || '0');
    if (minAge < 18) {
      this.warnings.push({
        severity: 'HIGH',
        law: 'State Laws',
        issue: 'Minimum age below 18 for adult platform',
        fix: 'Set MINIMUM_AGE=18 in .env',
        file: '.env'
      });
    }

    console.log('✅ Age verification checked');
    return issues;
  }

  /**
   * Data Privacy
   */
  async checkDataPrivacy() {
    const issues = [];

    // Check data privacy enforcement
    const hasPrivacyEnforcement = this.checkFileExists('utils/dataPrivacyEnforcement.js');
    if (!hasPrivacyEnforcement) {
      issues.push({
        severity: 'CRITICAL',
        law: 'GDPR / Privacy Laws',
        issue: 'No data privacy enforcement',
        fix: 'User data selling must be blocked',
        file: 'utils/dataPrivacyEnforcement.js'
      });
    }

    if (issues.length > 0) {
      this.criticalIssues.push(...issues);
    } else {
      console.log('✅ Data privacy compliant');
    }

    return issues;
  }

  /**
   * Terms of Service
   */
  async checkTermsOfService() {
    const hasTOS = this.checkFileExists('public/legal/terms-of-service.html');
    if (!hasTOS) {
      this.criticalIssues.push({
        severity: 'CRITICAL',
        law: 'General Legal',
        issue: 'No Terms of Service found',
        fix: 'Create terms of service',
        file: 'public/legal/terms-of-service.html'
      });
    } else {
      console.log('✅ Terms of Service exists');
    }
  }

  /**
   * Privacy Policy
   */
  async checkPrivacyPolicy() {
    const hasPolicy = this.checkFileExists('public/legal/privacy-policy.html');
    if (!hasPolicy) {
      this.criticalIssues.push({
        severity: 'CRITICAL',
        law: 'GDPR / Privacy Laws',
        issue: 'No Privacy Policy found',
        fix: 'Create privacy policy',
        file: 'public/legal/privacy-policy.html'
      });
    } else {
      console.log('✅ Privacy Policy exists');
    }
  }

  /**
   * Check if file exists (simplified check)
   */
  checkFileExists(path) {
    try {
      const fs = require('fs');
      return fs.existsSync(path);
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    const totalIssues = this.criticalIssues.length + this.violations.length + this.warnings.length;

    const report = {
      timestamp: new Date().toISOString(),
      compliant: this.criticalIssues.length === 0,
      launchReady: this.criticalIssues.length === 0 && this.violations.length === 0,
      summary: {
        critical: this.criticalIssues.length,
        high: this.violations.length,
        medium: this.warnings.length,
        total: totalIssues
      },
      criticalIssues: this.criticalIssues,
      violations: this.violations,
      warnings: this.warnings,
      recommendation: this.getRecommendation()
    };

    return report;
  }

  /**
   * Get launch recommendation
   */
  getRecommendation() {
    if (this.criticalIssues.length > 0) {
      return 'DO NOT LAUNCH - Critical legal issues must be resolved first';
    }

    if (this.violations.length > 0) {
      return 'LAUNCH WITH CAUTION - Resolve high-priority issues ASAP';
    }

    if (this.warnings.length > 0) {
      return 'SAFE TO LAUNCH - Address warnings when possible';
    }

    return 'FULLY COMPLIANT - Safe to launch';
  }

  /**
   * Print report to console
   */
  printReport(report) {
    console.log('\n⚖️ ═══════════════════════════════════════════════════════');
    console.log('   LEGAL COMPLIANCE REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Status: ${report.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
    console.log(`Launch Ready: ${report.launchReady ? '✅ YES' : '❌ NO'}\n`);

    console.log('Summary:');
    console.log(`  Critical Issues: ${report.summary.critical}`);
    console.log(`  High Priority: ${report.summary.high}`);
    console.log(`  Warnings: ${report.summary.medium}`);
    console.log(`  Total: ${report.summary.total}\n`);

    if (report.criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      report.criticalIssues.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.law}] ${issue.issue}`);
        console.log(`     Fix: ${issue.fix}`);
        console.log(`     File: ${issue.file}\n`);
      });
    }

    if (report.violations.length > 0) {
      console.log('⚠️  HIGH PRIORITY:');
      report.violations.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.law}] ${issue.issue}`);
        console.log(`     Fix: ${issue.fix}\n`);
      });
    }

    if (report.warnings.length > 0) {
      console.log('💡 WARNINGS:');
      report.warnings.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.law}] ${issue.issue}`);
      });
      console.log('');
    }

    console.log(`Recommendation: ${report.recommendation}`);
    console.log('\n═══════════════════════════════════════════════════════\n');
  }
}

// Export singleton
const legalComplianceChecker = new LegalComplianceChecker();

export default legalComplianceChecker;

// CLI usage
if (typeof require !== 'undefined' && require.main === module) {
  (async () => {
    const checker = new LegalComplianceChecker();
    const report = await checker.runFullCheck();
    checker.printReport(report);
    process.exit(report.launchReady ? 0 : 1);
  })();
}
