// Terms of Service Addendum - Print-on-Demand & Content Creation

export const PRINT_ON_DEMAND_TERMS = {
  title: 'Print-on-Demand & Content Creation Terms',
  version: '1.0',
  effective_date: '2025-11-10',

  sections: [
    {
      id: 'intellectual_property',
      title: '📜 Intellectual Property Rights',
      content: `
**YOU CERTIFY THAT:**

1. All content you upload is 100% original OR you have explicit written permission to use it commercially
2. You own all copyrights, trademarks, and IP rights to your content
3. Your content does NOT infringe on any third-party rights
4. You will not create counterfeit or knock-off products of existing brands

**WE RESERVE THE RIGHT TO:**

- Remove any content suspected of copyright infringement
- Terminate accounts for repeat violations
- Report counterfeiting attempts to copyright holders and law enforcement
- Refuse service to anyone violating these terms
      `
    },
    {
      id: 'prohibited_content',
      title: '🚫 Strictly Prohibited Content',
      content: `
**YOU MAY NOT CREATE:**

1. **Counterfeit Trading Cards**: No fake Pokémon, Yu-Gi-Oh!, Magic: The Gathering, or any established TCG cards
2. **Copyrighted Characters**: No Marvel, DC, Disney, anime characters without licenses
3. **Hate Content**: No racism, hate speech, or discriminatory content
4. **Illegal Content**: No content depicting illegal activities, drugs, or violence
5. **Minor Safety**: No content sexualizing or endangering minors (zero tolerance)
6. **Adult Content**: Must be behind age gate and clearly labeled

**PENALTIES:**
- First violation: Warning + content removal
- Second violation: 30-day suspension
- Third violation: Permanent ban + report to authorities (if illegal)
      `
    },
    {
      id: 'dmca_policy',
      title: '⚖️ DMCA & Copyright Claims',
      content: `
**IF YOU BELIEVE YOUR COPYRIGHT WAS VIOLATED:**

1. Send DMCA takedown notice to: legal@fortheweebs.com
2. Include: Your contact info, description of copyrighted work, location of infringement
3. We will investigate and respond within 48 hours
4. Content may be removed pending investigation

**IF YOUR CONTENT IS REMOVED:**

1. You may file a counter-notice with evidence of ownership
2. We will review counter-notice within 14 days
3. If valid, content will be restored
4. If invalid, removal is permanent

**FALSE CLAIMS:**
Filing false DMCA notices is perjury under U.S. law (17 USC § 512(f)) and subject to prosecution.
      `
    },
    {
      id: 'revenue_split',
      title: '💰 Revenue Share & Payments',
      content: `
**PRINT-ON-DEMAND ECONOMICS:**

- You receive: 75% of retail price
- Platform receives: 25% (covers printing, shipping, customer service, fraud prevention)
- No upfront costs to you
- You're paid monthly via direct deposit/PayPal/Stripe
- Minimum payout: $25

**CHARGEBACKS & REFUNDS:**
- Customer refunds come from platform's 25% share (you keep your 75%)
- Excessive chargebacks (>5%) may result in account review
- Fraudulent orders: You're protected
      `
    },
    {
      id: 'anti_fraud',
      title: '🛡️ Anti-Fraud Measures',
      content: `
**TO PREVENT COUNTERFEITING:**

1. **AI Content Scanning**: All uploads scanned for copyrighted materials
2. **Manual Review**: Orders >500 units flagged for manual review
3. **Account Verification**: 
   - <100 cards: Email verification only
   - 100-1000 cards: Payment method verified + 3-day hold
   - >1000 cards: ID verification + 7-day hold
4. **Reporting**: We cooperate with law enforcement on counterfeiting investigations

**WHY WE DO THIS:**
- Protects you from legal liability
- Protects legitimate copyright holders
- Maintains platform integrity
- Required by print partners
      `
    },
    {
      id: 'liability',
      title: '⚠️ Liability & Indemnification',
      content: `
**YOU AGREE TO:**

1. Indemnify ForTheWeebs against any copyright claims arising from your content
2. Accept full legal responsibility for content you create and sell
3. Pay any legal fees/damages if we're sued because of your content
4. Release us from liability for any disputes with customers or copyright holders

**WE ARE NOT LIABLE FOR:**
- Copyright infringement by users
- Quality issues with printed products (covered by print partner)
- Lost revenue due to account suspension for TOS violations
- Third-party legal action against you

**DISPUTE RESOLUTION:**
Any disputes governed by arbitration in [Your Jurisdiction]. Class action waiver applies.
      `
    }
  ],

  acceptance_required: true,
  acceptance_text: 'I have read and agree to the Print-on-Demand Terms. I certify that all content I upload is original or properly licensed, and I understand I may face legal consequences for copyright infringement.',

  updates_policy: 'We may update these terms at any time. Continued use after updates = acceptance of new terms.'
};

export function generateLegalAgreement() {
  return {
    ...PRINT_ON_DEMAND_TERMS,
    signature_fields: [
      'full_name',
      'date',
      'ip_address',
      'user_id'
    ],
    legal_notices: [
      'This is a legally binding contract',
      'Violations may result in criminal prosecution',
      'You have 30 days to review before first print order',
      'Questions? Contact: legal@fortheweebs.com'
    ]
  };
}
