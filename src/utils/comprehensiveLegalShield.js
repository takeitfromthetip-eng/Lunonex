/* eslint-disable */
// COMPREHENSIVE LEGAL SHIELD - Platform-wide protection system
// Protects ForTheWeebs from ALL potential legal liabilities

export const PLATFORM_LEGAL_SHIELD = {
  // SECTION 1: USER-GENERATED CONTENT LIABILITY SHIELD
  ugc_protection: {
    safe_harbor_compliance: true, // DMCA Safe Harbor (17 USC § 512)
    section_230_immunity: true, // Communications Decency Act § 230
    platform_not_publisher: true, // We're a hosting platform, not content publisher
    expedited_takedown: true, // Remove content within 24 hours of valid notice
    user_liability_only: true // Users liable for their content, not platform
  },

  // SECTION 2: AGE VERIFICATION & COPPA COMPLIANCE
  age_protection: {
    minimum_age: 13, // COPPA compliance (Children's Online Privacy Protection Act)
    age_gate_required: true,
    parental_consent_under_13: true, // Requires verifiable parental consent
    age_restricted_content_18: true, // Adult content requires 18+ verification
    age_verification_methods: [
      'Credit card verification (must be 18+)',
      'ID document upload + facial recognition',
      'Third-party age verification service (Yoti, Jumio)',
      'SSN last 4 digits + DOB matching'
    ],
    teen_restrictions: {
      age_13_17: ['Cannot sell adult content', 'Cannot process payments without parent', 'Limited to $500/month revenue']
    }
  },

  // SECTION 3: INTELLECTUAL PROPERTY MEGA-SHIELD
  ip_protection: {
    trademark_blocking: true,
    copyright_scanning: true,
    patent_awareness: true,
    trade_secret_protection: true,

    // Image content scanning (AI-powered)
    image_scanning: {
      enabled: true,
      providers: ['Google Cloud Vision API', 'AWS Rekognition', 'Clarifai'],
      detection_types: [
        'Copyrighted characters (Pokemon, Marvel, Disney, etc.)',
        'Logo detection (brand logos)',
        'Face recognition (celebrities, public figures)',
        'Explicit content detection',
        'Violence/gore detection',
        'Text extraction from images (checks for trademarks)'
      ],
      auto_reject_confidence: 0.85, // 85% confidence = auto-reject
      manual_review_confidence: 0.65 // 65-84% = human review
    },

    // Audio/music protection for video content
    audio_scanning: {
      enabled: true,
      providers: ['ACRCloud', 'Audible Magic', 'YouTube Content ID equivalent'],
      blocks: ['Copyrighted music', 'Sound effects from games/movies', 'Voice samples from shows']
    },

    // International trademark protection
    international_trademarks: [
      // Japanese companies
      '株式会社ポケモン', '任天堂', 'コナミ', 'バンダイナムコ', 'スクウェア・エニックス',
      // European variants
      'Pokémon', 'Digimon', 'Yu-Gi-Oh!', 'Magic: The Gathering',
      // Chinese/Korean
      '腾讯', '网易', 'Nexon', 'NCsoft'
    ]
  },

  // SECTION 4: FINANCIAL/PAYMENT PROTECTION
  financial_shield: {
    // IRS compliance
    tax_reporting: {
      form_1099k_threshold: 600, // Report to IRS if user earns $600+
      require_w9_above: 600, // Collect W-9 for US users, W-8 for international
      automatic_withholding_no_w9: 0.24, // 24% backup withholding if no tax form
      state_sales_tax_collection: true // Collect sales tax based on buyer location
    },

    // Anti-money laundering (Bank Secrecy Act compliance)
    aml_kyc: {
      enabled: true,
      suspicious_activity_reporting: true, // Report to FinCEN if suspicious
      transaction_limits_unverified: 2000, // $2,000 limit without full KYC
      identity_verification_required_above: 2000,
      high_risk_countries_blocked: ['North Korea', 'Iran', 'Syria', 'Cuba'], // OFAC sanctions
      pep_screening: true // Screen for Politically Exposed Persons
    },

    // Chargeback protection
    chargeback_shield: {
      user_liable_for_fraudulent_chargebacks: true,
      automatic_account_suspension_on_chargeback: true,
      chargeback_fee_passed_to_seller: true, // Stripe charges $15/chargeback
      dispute_evidence_collection: true, // Collect proof of delivery, IP logs, etc.
      three_strikes_permanent_ban: true
    },

    // Payment processor compliance
    stripe_paypal_compliance: {
      prohibited_items_blocked: true, // Stripe/PayPal prohibited items list
      no_adult_content_via_paypal: true, // PayPal bans adult content
      adult_content_processors: ['CCBill', 'Epoch', 'Segpay'], // Alternative for 18+ content
      no_weapons_drugs_illegal: true,
      no_counterfeit_goods: true,
      no_pyramid_schemes: true
    }
  },

  // SECTION 5: PRIVACY & DATA PROTECTION
  privacy_shield: {
    // GDPR compliance (European Union)
    gdpr_compliance: {
      enabled: true,
      data_processing_agreement: true,
      right_to_access: true, // Users can download their data
      right_to_erasure: true, // "Right to be forgotten"
      right_to_portability: true,
      data_breach_notification_72hrs: true, // Must notify within 72 hours
      dpo_contact: 'privacy@fortheweebs.com', // Data Protection Officer
      cookie_consent_required: true,
      eu_representative_required: true // If >10M EU users
    },

    // CCPA compliance (California)
    ccpa_compliance: {
      enabled: true,
      do_not_sell_option: true, // "Do Not Sell My Personal Information"
      data_disclosure: true, // Disclose what data we collect
      opt_out_of_sale: true,
      consumer_request_verification: true
    },

    // General data protection
    data_security: {
      encryption_at_rest: true, // AES-256 encryption
      encryption_in_transit: true, // TLS 1.3
      password_hashing: 'bcrypt', // Never store plain text passwords
      pii_minimization: true, // Collect only necessary data
      data_retention_limits: {
        inactive_accounts: '3 years',
        deleted_accounts: '30 days grace period',
        financial_records: '7 years', // IRS requirement
        dmca_notices: '3 years'
      },
      third_party_audits: true, // SOC 2 Type II compliance
      penetration_testing: 'Quarterly'
    }
  },

  // SECTION 6: CONTENT MODERATION SHIELD
  content_moderation: {
    prohibited_content_categories: [
      'Child sexual abuse material (CSAM) - ZERO TOLERANCE - FEDERAL CRIME',
      'Child exploitation / sexualization of minors',
      'Human trafficking / exploitation',
      'Terrorism / terrorist recruitment / ISIS propaganda',
      'Credible threats of violence (specific person + intent + means)',
      'Non-consensual intimate imagery (revenge porn)',
      'Doxxing / posting private information to cause harm',
      'Hate speech targeting protected classes (race, religion, ethnicity, national origin, sexual orientation, gender identity, disability)',
      'Real animal cruelty (actual abuse, not fictional/cartoon)',
      'Copyright infringement (traced/stolen copyrighted characters)',
      'Trademark violation (fake Pokemon/Yu-Gi-Oh!/Magic cards)',
      'Counterfeit goods (fake branded products)',
      'Illegal drugs sales / weapons trafficking',
      'Fraud / scams / phishing'
    ],

    // ALLOWED CONTENT (18+ with age gate):
    allowed_adult_content: [
      'NSFW artwork (nudity, sexual content)',
      'Adult comics / hentai / doujinshi',
      'Erotic fiction / smut',
      'Fetish art (as long as legal)',
      'Graphic violence / gore / horror (fictional)',
      'Blood / dismemberment / body horror (fictional)',
      'Monster girls / furry NSFW',
      'Consensual BDSM / kink content',
      'All adult content MUST have 18+ age gate'
    ],

    // CSAM detection (CRITICAL - Federal law requires reporting)
    csam_protection: {
      enabled: true,
      scanning_technology: 'PhotoDNA (Microsoft) + CSAI Match (Google)',
      ncmec_reporting: true, // Report to National Center for Missing & Exploited Children
      immediate_account_termination: true,
      law_enforcement_cooperation: true,
      ip_logging_for_csam: true,
      zero_appeals_for_csam: true
    },

    // Automated content moderation (AI ONLY - no human team)
    automated_moderation: {
      ai_text_scanning: true, // Scan all text for prohibited content (CSAM, terrorism, hate speech)
      ai_image_scanning: true, // PhotoDNA for CSAM, Google Vision for copyright
      ai_video_scanning: true,
      ai_audio_scanning: true,
      profanity_filter: false, // Allow swearing/profanity
      spam_detection: true,
      bot_detection: true,
      csam_only_strict_enforcement: true, // ONLY strict enforcement for CSAM/child exploitation
      gore_violence_allowed: true, // Graphic violence/gore is ALLOWED (18+ age gate)
      adult_content_allowed: true, // NSFW/sexual content is ALLOWED (18+ age gate)
      hate_speech_detection: true, // Flag racial slurs, Nazi symbols, targeted harassment
      terrorism_detection: true // Flag ISIS propaganda, terrorist recruitment
    },

    // NO human moderation team - AI handles everything
    human_moderation: {
      enabled: false, // AI-only moderation
      note: 'Platform uses automated AI moderation only. Appeals reviewed by AI + admin dashboard.'
    }
  },

  // SECTION 7: PLATFORM LIABILITY WAIVERS
  liability_waivers: {
    // Terms of Service must include:
    terms_of_service: {
      acceptance_required: true,
      clickwrap_agreement: true, // User must click "I Agree"
      version_tracking: true, // Track which TOS version user agreed to
      notification_of_changes: true, // Email users when TOS changes

      key_clauses: [
        'LIMITATION OF LIABILITY - Platform not liable for user actions',
        'INDEMNIFICATION - Users agree to defend platform in lawsuits',
        'NO WARRANTIES - Platform provided "as is" without guarantees',
        'FORCE MAJEURE - Not liable for events beyond our control',
        'DISPUTE RESOLUTION - Mandatory arbitration (avoids class action lawsuits)',
        'JURISDICTION - Disputes resolved in [YOUR STATE] courts',
        'SEVERABILITY - If one clause invalid, rest of TOS still valid',
        'ASSIGNMENT - We can transfer rights to another company',
        'NO AGENCY - Users are not employees/agents of platform'
      ]
    },

    // Specific waivers
    specific_waivers: {
      no_guarantee_of_sales: true, // Not responsible if creators don't make money
      no_guarantee_of_uptime: true, // Not liable for server downtime
      no_guarantee_of_print_quality: true, // Print-on-demand issues are printer's fault
      no_guarantee_of_payment_processing: true, // If Stripe bans user, not our fault
      no_liability_for_hacks: true, // If user's account is hacked (weak password)
      no_liability_for_third_party_services: true, // If AWS goes down, not our fault
      no_liability_for_user_disputes: true, // Buyer/seller disputes are between them
      no_liability_for_lost_data: true, // Users should backup their own work
      no_liability_for_account_termination: true // We can ban users at will
    }
  },

  // SECTION 8: ACCESSIBILITY COMPLIANCE
  accessibility_shield: {
    ada_compliance: true, // Americans with Disabilities Act
    wcag_2_1_aa_standard: true, // Web Content Accessibility Guidelines
    screen_reader_support: true,
    keyboard_navigation: true,
    alt_text_for_images: true,
    closed_captions_for_videos: true,
    color_contrast_ratio: '4.5:1 minimum',
    no_seizure_triggering_content: true // No rapid flashing
  },

  // SECTION 9: EXPORT CONTROL & SANCTIONS
  export_control: {
    ofac_screening: true, // Office of Foreign Assets Control
    embargoed_countries_blocked: ['Cuba', 'Iran', 'North Korea', 'Syria', 'Crimea'],
    export_controlled_technology: false, // We don't export controlled tech
    denied_persons_screening: true, // Screen against Treasury's SDN list
    automatic_ip_blocking: true // Block IPs from sanctioned countries
  },

  // SECTION 10: EMPLOYMENT LAW SHIELD
  employment_shield: {
    users_are_independent_contractors: true, // NOT employees
    no_minimum_wage_obligation: true,
    no_benefits_obligation: true,
    no_workers_comp_obligation: true,
    no_unemployment_insurance: true,
    irs_1099_reporting: true, // Report as contractors
    right_to_work_verification: false, // Not required for contractors

    contractor_agreement_clauses: [
      'Independent contractor status',
      'No employee relationship',
      'Responsible for own taxes',
      'No benefits provided',
      'Can be terminated at will',
      'No exclusive relationship',
      'Work-for-hire copyright assignment'
    ]
  },

  // SECTION 11: CONTEST/SWEEPSTAKES COMPLIANCE
  contest_compliance: {
    official_rules_required: true,
    no_purchase_necessary_disclosure: true, // Required by law
    odds_disclosure: true,
    prize_value_disclosure: true,
    void_where_prohibited: true, // Some states ban certain contests
    age_restrictions: '18+ or parental consent',
    state_registrations: {
      florida_bond_required_above_5000: true, // FL requires $5k bond for prizes >$5k
      new_york_registration_above_5000: true,
      rhode_island_registration_above_500: true
    },
    tax_reporting: {
      form_1099_misc_for_prizes_over_600: true, // Report prizes to IRS
      withholding_for_non_us_winners: true
    }
  },

  // SECTION 12: ANTI-SPAM COMPLIANCE
  anti_spam: {
    can_spam_compliance: true, // CAN-SPAM Act
    unsubscribe_link_required: true,
    physical_address_in_emails: true,
    no_deceptive_subject_lines: true,
    honor_unsubscribe_within_10_days: true,
    gdpr_email_consent: true, // EU requires explicit consent
    casl_compliance: true, // Canada's Anti-Spam Legislation
    double_opt_in_for_marketing: true
  },

  // SECTION 13: ALGORITHMIC TRANSPARENCY
  algorithmic_accountability: {
    eu_ai_act_compliance: true, // EU regulation on AI systems
    no_discriminatory_algorithms: true,
    explanation_of_ranking: true, // Why certain content is promoted
    appeal_process_for_ai_decisions: true,
    human_review_option: true,
    bias_auditing: 'Annual',
    transparency_report: 'Quarterly' // Publish moderation statistics
  },

  // SECTION 14: INSURANCE REQUIREMENTS
  insurance_coverage: {
    general_liability_insurance: '$2 million',
    cyber_liability_insurance: '$5 million', // Data breach coverage
    errors_omissions_insurance: '$1 million', // Professional liability
    directors_officers_insurance: '$2 million', // Protects company leadership
    business_interruption_insurance: '$1 million'
  }
};

// AUTOMATED LEGAL COMPLIANCE CHECKER
export function checkPlatformCompliance(content, contentType, userId, userAge, userCountry) {
  const violations = [];
  const warnings = [];

  // Age verification check
  if (userAge < 13) {
    violations.push({
      type: 'COPPA_VIOLATION',
      severity: 'CRITICAL',
      message: 'User under 13 without parental consent - IMMEDIATE ACCOUNT SUSPENSION REQUIRED',
      action: 'SUSPEND_ACCOUNT',
      legal_risk: 'FTC fine up to $43,280 per violation'
    });
  }

  // CSAM check (placeholder - would use PhotoDNA API)
  if (contentType === 'image' && detectCSAM(content)) {
    violations.push({
      type: 'CSAM_DETECTED',
      severity: 'CRITICAL_FEDERAL_CRIME',
      message: 'Child sexual abuse material detected',
      action: 'IMMEDIATE_NCMEC_REPORT',
      legal_risk: 'Federal crime - mandatory reporting required',
      law_enforcement_notification: true
    });
  }

  // Sanctions screening
  if (PLATFORM_LEGAL_SHIELD.export_control.embargoed_countries_blocked.includes(userCountry)) {
    violations.push({
      type: 'OFAC_VIOLATION',
      severity: 'CRITICAL',
      message: `User from embargoed country: ${userCountry}`,
      action: 'BLOCK_ACCOUNT',
      legal_risk: 'Treasury Department sanctions violation - up to $20 million fine'
    });
  }

  // Copyright check
  const copyrightCheck = checkCopyrightViolation(content, contentType);
  if (!copyrightCheck.isLegal) {
    violations.push(...copyrightCheck.violations);
  }

  // Hate speech check
  const hateCheck = detectHateSpeech(content);
  if (hateCheck.detected) {
    violations.push({
      type: 'HATE_SPEECH',
      severity: 'HIGH',
      message: 'Hate speech detected',
      action: 'REMOVE_CONTENT',
      legal_risk: 'TOS violation - potential civil liability for harassment'
    });
  }

  return {
    compliant: violations.length === 0,
    violations,
    warnings,
    recommended_action: violations.length > 0 ? violations[0].action : 'APPROVE'
  };
}

// Placeholder detection functions (would integrate with real APIs)
function detectCSAM(content) {
  // In production: Integrate PhotoDNA API or Google CSAI Match
  return false;
}

function checkCopyrightViolation(content, contentType) {
  // In production: Integrate Google Cloud Vision, AWS Rekognition
  return { isLegal: true, violations: [] };
}

function detectHateSpeech(content) {
  // In production: Integrate Perspective API (Google Jigsaw)
  const hateTerms = ['nazi', 'kkk', 'racial slurs', 'terrorist'];
  const detected = hateTerms.some(term => content.toLowerCase().includes(term));
  return { detected };
}

// LEGAL DOCUMENT GENERATOR
export function generateLegalDocuments() {
  return {
    terms_of_service: generateTOS(),
    privacy_policy: generatePrivacyPolicy(),
    dmca_policy: generateDMCAPolicy(),
    acceptable_use_policy: generateAUP(),
    cookie_policy: generateCookiePolicy(),
    contest_rules: generateContestRules(),
    contractor_agreement: generateContractorAgreement(),
    data_processing_agreement: generateDPA()
  };
}

function generateTOS() {
  return `
FORTHEWEEBS TERMS OF SERVICE
Last Updated: November 10, 2025

1. ACCEPTANCE OF TERMS
By accessing ForTheWeebs ("Platform"), you agree to these Terms of Service ("Terms"). If you disagree, do not use the Platform.

2. USER REPRESENTATIONS
You represent that:
- You are at least 13 years old (or have parental consent)
- You are not located in an embargoed country (Cuba, Iran, North Korea, Syria)
- You will not upload copyrighted, trademarked, or illegal content
- You will not engage in hate speech, harassment, or illegal activity
- All content you create is 100% original or properly licensed

3. INTELLECTUAL PROPERTY
You retain ownership of your content. By uploading, you grant ForTheWeebs a worldwide, non-exclusive, royalty-free license to host, display, and distribute your content.

You agree NOT to upload:
- Copyrighted characters (Pokémon, Marvel, Disney, etc.)
- Trademarked names or logos
- Counterfeit goods
- Stolen intellectual property

4. INDEMNIFICATION
You agree to INDEMNIFY, DEFEND, and HOLD HARMLESS ForTheWeebs from any claims, damages, or expenses (including attorney fees) arising from:
- Your content
- Your violation of these Terms
- Your violation of any law
- Copyright/trademark infringement claims

5. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW:
- ForTheWeebs is NOT LIABLE for any indirect, incidental, or consequential damages
- Total liability limited to $100 or amount paid to us in past 12 months, whichever is less
- Platform provided "AS IS" without warranties

6. DMCA COMPLIANCE
We comply with the Digital Millennium Copyright Act. If you believe content infringes your copyright, email dmca@fortheweebs.com with:
- Your contact information
- Description of copyrighted work
- URL of infringing content
- Statement of good faith belief
- Statement under penalty of perjury
- Physical or electronic signature

7. ACCOUNT TERMINATION
We may terminate your account at any time for any reason, including:
- TOS violations
- Copyright infringement (repeat offenders banned permanently)
- Hate speech or harassment
- Fraudulent chargebacks
- Suspicious activity

8. DISPUTE RESOLUTION
Any dispute shall be resolved through BINDING ARBITRATION in [YOUR STATE]. You waive the right to a jury trial and class action lawsuits.

9. GOVERNING LAW
These Terms are governed by the laws of [YOUR STATE], excluding conflict of law provisions.

10. CHANGES TO TERMS
We may update these Terms at any time. Continued use constitutes acceptance of new Terms.

11. CONTACT
Email: legal@fortheweebs.com
Address: [YOUR BUSINESS ADDRESS]

BY CLICKING "I AGREE," YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS.
  `;
}

function generatePrivacyPolicy() {
  return `
FORTHEWEEBS PRIVACY POLICY
Last Updated: November 10, 2025

This Privacy Policy explains how ForTheWeebs ("we," "us," "our") collects, uses, and protects your personal information.

1. INFORMATION WE COLLECT
- Account Information: Email, username, password (hashed)
- Profile Information: Display name, bio, avatar
- Payment Information: Processed by Stripe/PayPal (we do not store credit cards)
- Tax Information: W-9/W-8 forms for sellers earning $600+
- Content: Artwork, comics, trading cards, text
- Usage Data: IP address, browser type, pages visited, time spent
- Cookies: Authentication, preferences, analytics

2. HOW WE USE YOUR INFORMATION
- Provide Platform services
- Process payments and tax reporting
- Detect fraud and abuse
- Comply with legal obligations (DMCA, CSAM reporting, tax reporting)
- Improve Platform performance
- Send transactional emails (order confirmations, account updates)
- Marketing emails (with your consent - you can unsubscribe)

3. INFORMATION SHARING
We share your information with:
- Payment processors (Stripe, PayPal)
- Print-on-demand partners (for order fulfillment)
- Cloud hosting providers (AWS, Google Cloud)
- Analytics providers (Google Analytics)
- Law enforcement (when legally required)

We do NOT sell your personal information to third parties.

4. GDPR RIGHTS (EU USERS)
You have the right to:
- Access your personal data
- Rectify inaccurate data
- Erase your data ("right to be forgotten")
- Restrict processing
- Data portability
- Object to processing
- Withdraw consent

To exercise these rights, email privacy@fortheweebs.com

5. CCPA RIGHTS (CALIFORNIA USERS)
California residents have the right to:
- Know what personal information we collect
- Know if we sell personal information (we don't)
- Opt-out of sale (not applicable)
- Delete personal information
- Non-discrimination for exercising rights

To exercise these rights, email privacy@fortheweebs.com

6. DATA SECURITY
We use industry-standard security measures:
- TLS 1.3 encryption in transit
- AES-256 encryption at rest
- Bcrypt password hashing
- Regular security audits
- SOC 2 Type II compliance

However, no method is 100% secure. Use strong passwords and enable 2FA.

7. DATA RETENTION
- Active accounts: Indefinite
- Inactive accounts: 3 years, then deleted
- Deleted accounts: 30-day grace period, then permanent deletion
- Financial records: 7 years (IRS requirement)
- DMCA notices: 3 years

8. CHILDREN'S PRIVACY (COPPA)
Users under 13 must have verifiable parental consent. We do not knowingly collect data from children under 13 without consent.

9. INTERNATIONAL TRANSFERS
Your data may be transferred to servers in the United States. By using the Platform, you consent to this transfer.

10. COOKIES
We use cookies for:
- Authentication (required)
- Preferences (optional)
- Analytics (optional - you can opt-out)

You can control cookies in your browser settings.

11. CHANGES TO PRIVACY POLICY
We may update this policy. We will notify you via email for material changes.

12. CONTACT
Data Protection Officer: privacy@fortheweebs.com
Address: [YOUR BUSINESS ADDRESS]
  `;
}

function generateDMCAPolicy() {
  return `
DMCA COPYRIGHT POLICY
ForTheWeebs complies with the Digital Millennium Copyright Act (17 USC § 512).

DESIGNATED DMCA AGENT:
Email: dmca@fortheweebs.com
Address: [YOUR BUSINESS ADDRESS]

To file a DMCA takedown notice, include:
1. Physical or electronic signature
2. Description of copyrighted work
3. URL of infringing material
4. Your contact information
5. Statement of good faith belief
6. Statement under penalty of perjury that information is accurate

We will remove content within 24 hours of receiving a valid notice.

COUNTER-NOTICE:
If your content was removed, you may file a counter-notice with:
1. Your signature
2. Description of removed content
3. Statement under penalty of perjury that removal was a mistake
4. Consent to jurisdiction

We will restore content in 10-14 business days unless copyright owner files a lawsuit.

REPEAT INFRINGER POLICY:
Users with 3+ copyright strikes are permanently banned.
  `;
}

function generateAUP() {
  return `
ACCEPTABLE USE POLICY
You may NOT use ForTheWeebs to:
- Upload illegal content
- Infringe copyrights or trademarks
- Harass, threaten, or dox others
- Upload CSAM (child sexual abuse material) - ZERO TOLERANCE
- Promote terrorism or violence
- Engage in hate speech
- Spam or phish
- Distribute malware
- Manipulate or game the system
- Create counterfeit goods
- Violate export control laws

Violations result in content removal, account suspension, or permanent ban. Serious violations are reported to law enforcement.
  `;
}

function generateCookiePolicy() {
  return `
COOKIE POLICY
We use cookies to improve your experience.

REQUIRED COOKIES:
- Authentication (keeps you logged in)
- Security (prevents CSRF attacks)

OPTIONAL COOKIES:
- Analytics (Google Analytics) - tracks usage
- Preferences (remembers your settings)

You can disable optional cookies in your browser or account settings.
  `;
}

function generateContestRules() {
  return `
WEEKLY CONTEST OFFICIAL RULES
NO PURCHASE NECESSARY. Void where prohibited.

1. ELIGIBILITY: Open to legal residents of the 50 US states + DC, 18+ or with parental consent.
2. HOW TO ENTER: Submit artwork through ForTheWeebs Platform during contest period.
3. PRIZE: $500 cash (or equivalent in platform credits). Odds depend on number of entries.
4. WINNER SELECTION: Determined by community votes + curator panel.
5. TAXES: Winner responsible for all taxes. 1099-MISC issued if prize >$600.
6. PUBLICITY RELEASE: Winner grants ForTheWeebs right to use name/likeness for promotional purposes.
7. SPONSOR: ForTheWeebs, [YOUR ADDRESS]
  `;
}

function generateContractorAgreement() {
  return `
INDEPENDENT CONTRACTOR AGREEMENT
You acknowledge that:
- You are an independent contractor, NOT an employee
- You are not entitled to employee benefits
- You are responsible for your own taxes
- ForTheWeebs will issue 1099-MISC if you earn $600+
- This is not an exclusive relationship
- Either party can terminate at any time
- You retain copyright to your work (unless sold to buyers)
- You indemnify ForTheWeebs for any claims arising from your work
  `;
}

function generateDPA() {
  return `
DATA PROCESSING AGREEMENT (GDPR Compliance)
This Data Processing Agreement ("DPA") applies to EU users.

ForTheWeebs acts as a "Data Processor" on behalf of users (the "Data Controllers").

1. DATA PROCESSING TERMS
- We process data only as instructed by users
- We implement appropriate security measures
- We assist with GDPR rights requests
- We notify users of data breaches within 72 hours
- We delete data upon request

2. SUBPROCESSORS
We use the following subprocessors:
- AWS (hosting)
- Stripe (payments)
- Google Analytics (analytics)

3. DATA TRANSFERS
Data may be transferred to the US under Standard Contractual Clauses.

4. AUDITS
Users may request annual security audits (SOC 2 reports available).
  `;
}

export default PLATFORM_LEGAL_SHIELD;
