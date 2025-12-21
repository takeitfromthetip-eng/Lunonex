import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import "./TermsOfService.css";

const PRIVACY_POLICY_TEXT = `ForTheWeebs Privacy Policy - Effective Date: January 1, 2026

This Privacy Policy explains how ForTheWeebs collects, uses, shares, and protects your personal information. By using ForTheWeebs, you consent to the practices described herein. This Policy complies with GDPR, CCPA, and other applicable privacy laws.

ForTheWeebs is an adult content platform (18+) offering AI tools, social media, messaging, and subscription perks. Donations are voluntary, non-refundable, and not tax-deductible. Perks are courtesy gifts, not purchases. All sales are final.

INFORMATION WE COLLECT:
- Account Information: Username, email, password, age verification
- Payment Information: Processed by Stripe/Segpay (we don't store card numbers)
- User Content: Posts, images, videos, messages
- Technical Data: IP address, browser, device identifiers, cookies
- Legal Compliance Data: 18 U.S.C. § 2257 record-keeping for creators

HOW WE USE INFORMATION:
- Operate and improve ForTheWeebs
- Process donations and provide perks
- Enforce Terms of Service
- Comply with legal obligations (DMCA, 2257)
- Protect against fraud and abuse

YOUR RIGHTS (GDPR/CCPA):
- Access, rectify, or delete your data
- Data portability and opt-out options
- Non-discrimination for exercising rights
- Breach notification within 72 hours
Contact: privacy@fortheweebs.com

DATA SECURITY: Encryption, access controls, monitoring. No system is 100% secure.
AGE REQUIREMENT: 18+ only. Underage accounts terminated immediately.
INTERNATIONAL TRANSFERS: Data may be processed outside your jurisdiction.
CHANGES: 30 days notice for policy updates.

Owner: Jacob Morris, North Carolina
Email: privacy@fortheweebs.com`;

const TERMS_TEXT = `# Fortheweebs Terms of Service

_Last updated: November 2025_

## ⚠️ OUR PROMISE TO YOU - WE NEVER SELL YOUR DATA

**THIS IS NON-NEGOTIABLE:** ForTheWeebs does not sell, rent, trade, or monetize your personal information. Period. We will never traffic your data to third parties, advertisers, data brokers, or anyone else. Your information belongs to YOU, not to us, and certainly not to corporations looking to exploit it.

We believe selling user data is a grimy, unethical way to make money. We built this platform for creators and fans to connect directly, not to harvest your information for profit. This guarantee is permanent and applies at every level of our operation.

**What this means:**
- Your email, payment info, browsing history, and personal data stay private
- We only share what's legally required (tax forms, payment processing)
- No targeted advertising based on your data
- No data mining or selling to third-party marketers
- You can request deletion of your data at any time

If anyone ever tries to change this policy, we'll notify you 90 days in advance so you can delete your account first. That's a promise.

---

## 1. Introduction
Welcome to Fortheweebs ("the Platform"). By accessing or using Fortheweebs, you agree to be bound by these Terms of Service ("Terms"). These Terms govern your relationship with Fortheweebs, including your use of the Platform as a creator, subscriber, or visitor.
---
## 2. Platform Scope
Fortheweebs provides infrastructure for creators to publish content, manage subscriptions, and engage with their audience. Fortheweebs does not produce, endorse, or monitor creator content. The Platform is a neutral automation and orchestration service.
---
## 3. Creator Independence
Creators operate as independent entities. Fortheweebs does not employ, contract, or represent creators in any legal or editorial capacity. Creators are solely responsible for:
- The content they publish
- Their interactions with users
- Compliance with applicable laws and regulations
Fortheweebs assumes no responsibility or liability for creator actions or content.
---
## 4. Content Responsibility
Creators are fully responsible for the legality, accuracy, and appropriateness of their content. This includes but is not limited to:
- Copyrighted material
- Adult content
- Defamatory or misleading statements
- Violations of local, national, or international law
Fortheweebs does not pre-screen or moderate content and holds no obligation to do so.
---
## 5. Liability Disclaimer
Fortheweebs shall not be liable for:
- Any content posted by creators
- Any damages, losses, or disputes arising from creator activity
- Any consequences resulting from content takedowns, legal action, or third-party claims
- Any data breaches, technical failures, or future incidents that may arise from use of the Platform
Users and creators agree that Fortheweebs is not responsible for resolving any issues related to their content, conduct, or data exposure.
---
## 6. Indemnification
Creators agree to indemnify and hold harmless Fortheweebs, its founders, affiliates, and agents from any claims, liabilities, damages, or expenses (including legal fees) arising from:
- Their content
- Their conduct on the Platform
`;

export const TermsOfService = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    setAccepted(e.target.checked);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  const handleButtonClick = async (e) => {
    e.stopPropagation();
    if (!accepted || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        setIsSubmitting(false);
        return;
      }

      // Get user's IP address
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      // Call legal receipts API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/legal-receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          termsContent: TERMS_TEXT,
          privacyContent: PRIVACY_POLICY_TEXT,
          ipAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create legal receipt');
      }

      const receipt = await response.json();
      console.log('✅ Legal receipt created:', receipt.receiptId);
      
      onAccept();
    } catch (error) {
      console.error('Error creating legal receipt:', error);
      alert('Failed to process acceptance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="terms-container">
      <h2>Terms of Service</h2>
      <div className="terms-content">
        <pre className="terms-pre">{TERMS_TEXT}</pre>
      </div>
  <label 
        className="terms-label"
        onClick={handleCheckboxClick}
      >
        <input 
          type="checkbox" 
          checked={accepted} 
          onChange={handleCheckboxChange}
          onClick={handleCheckboxClick}
        />
        I accept the Terms of Service
      </label>
      <button
        disabled={!accepted || isSubmitting}
        className={`terms-button${(!accepted || isSubmitting) ? " disabled" : ""}`}
        onClick={handleButtonClick}
      >
        {isSubmitting ? 'Processing...' : 'Continue'}
      </button>
    </div>
  );
};
