# 💰 Stripe Payout to Chime - Setup Guide

**Goal:** Get money from ForTheWeebs subscriptions into your Chime account automatically.

---

## 🎯 Quick Setup (10 Minutes)

### **Step 1: Get Your Chime Account Info**

You'll need:
- ✅ **Routing Number:** Check your Chime app
- ✅ **Account Number:** Check your Chime app

**Where to Find in Chime App:**
1. Open Chime app
2. Tap "Settings" ⚙️
3. Tap "Account info"
4. Copy both numbers

**Chime Bank Details:**
- **Bank Name:** The Bancorp Bank or Stride Bank, N.A.
- **Account Type:** Checking
- **Routing Number:** Usually `031101279` (Bancorp) or `084301840` (Stride)
- **Your Account Number:** 8-12 digits in your Chime app

---

## 💳 Step 2: Connect Chime to Stripe

### **Option A: Via Stripe Dashboard (Easiest)**

1. **Go to Stripe Dashboard:**
   https://dashboard.stripe.com/login

2. **Navigate to Payouts:**
   - Click "Balance" in left sidebar
   - Click "Payouts" tab
   - Click "Add bank account" or "Edit payout details"

3. **Enter Chime Info:**
   ```
   Country: United States
   Currency: USD
   Bank name: The Bancorp Bank (or Stride Bank)
   Routing number: [Your Chime routing number]
   Account number: [Your Chime account number]
   Account holder name: [Your legal name]
   Account type: Checking
   ```

4. **Verify Account:**
   - Stripe will send 2 small deposits (few cents)
   - Check Chime app in 1-2 days
   - Return to Stripe and enter deposit amounts
   - Account verified! ✅

---

### **Option B: Via Stripe API (For Automation)**

If you want to set this up programmatically:

```javascript
// api/stripe-setup-payout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupPayout() {
  // Create bank account
  const bankAccount = await stripe.accounts.createExternalAccount(
    'acct_YOUR_STRIPE_ACCOUNT_ID', // Your connected account ID
    {
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        routing_number: 'YOUR_CHIME_ROUTING',
        account_number: 'YOUR_CHIME_ACCOUNT',
      }
    }
  );

  console.log('Bank account added:', bankAccount.id);
}
```

But honestly, **use the dashboard** - it's easier and you only do it once.

---

## ⚙️ Step 3: Configure Payout Schedule

### **Recommended Settings:**

1. **Go to:** https://dashboard.stripe.com/settings/payouts

2. **Set Payout Schedule:**
   - **Frequency:** Daily (get paid every day!)
   - **Delay:** 2 days (Stripe standard)
   - **Alternative:** Weekly on Friday
   - **Alternative:** Monthly on 1st

3. **Enable Instant Payouts** (Optional):
   - Costs 1% fee
   - Get money in 30 minutes
   - Only available after account verified

**Recommended for You:**
```
Payout schedule: Daily
Delay: 2 days
Minimum payout: $10
```

This means: Revenue from Monday arrives in Chime on Wednesday.

---

## 💵 How Money Flows

### **User Pays → You Get Paid:**

```
1. User subscribes for $50/month
   ↓
2. Stripe charges their card
   ↓
3. Stripe takes fee (~3% = $1.50)
   ↓
4. Your balance: $48.50
   ↓
5. After 2 days: Payout to Chime
   ↓
6. Money appears in Chime! 💰
```

**Timeline:**
- User pays: Monday 10am
- Available balance: Monday 10am
- Payout initiated: Wednesday (2 day delay)
- Money in Chime: Thursday (1 day transfer)

**Total:** ~3 days from payment to your account

---

## 🔐 Verification Requirements

### **Stripe Needs to Verify You:**

Before large payouts, Stripe requires:

1. **Personal Info:**
   - Full legal name
   - Date of birth
   - SSN or EIN
   - Home address
   - Phone number

2. **Business Info (if applicable):**
   - Business name: "ForTheWeebs" or your legal name
   - Business type: Sole Proprietor / LLC / Corporation
   - Business address
   - Business website: https://fortheweebs.com
   - Product description: "Creator tools platform"

3. **Bank Verification:**
   - Confirm micro-deposits (see Step 2)

**Where to Complete:**
https://dashboard.stripe.com/settings/account

**Why Required:**
- Anti-fraud protection
- IRS reporting (you'll get 1099-K if >$600/year)
- Federal banking regulations

---

## 🚨 Important Notes About Chime

### **Will Stripe Work With Chime?**

**YES** - Chime works with Stripe! ✅

**But be aware:**
- ✅ Chime accepts ACH transfers (Stripe uses ACH)
- ✅ No issues receiving business payments
- ✅ Many creators use Chime successfully
- ⚠️ Large deposits may trigger Chime review
- ⚠️ Keep records for tax purposes

### **If You Receive Large Payments:**

Chime may flag deposits >$1,000 for verification.

**To avoid issues:**
1. Keep Stripe invoices as proof
2. Have business documentation ready
3. Contact Chime support if flagged
4. Consider business bank account if >$10k/month

**Alternative Banks (For Later):**
- Mercury (designed for startups)
- Relay (free business banking)
- Chase Business (traditional)

But Chime is fine to start! Many creators use it.

---

## 💰 Fees Breakdown

### **What You Actually Receive:**

**User Pays $50 Subscription:**
```
Gross revenue:        $50.00
Stripe fee (2.9%):    -$1.45
Stripe fixed fee:     -$0.30
Your net revenue:     $48.25
Transfer to Chime:    $48.25 (no fee)
```

**Owner Perks (You):**
- ✅ You pay 0% platform fee (you're the owner!)
- ✅ No monthly platform fees
- ✅ No withdrawal fees
- ✅ Just Stripe's standard rates

**Creators (Your Users) Pay:**
- Creator fee: 5-10% (you set this)
- Stripe fee: 2.9% + $0.30
- Platform keeps the creator fee
- Creator gets the rest

---

## 🧪 Test the Setup

### **Step 1: Test Payment (Test Mode)**

```bash
# Use Stripe test mode first
# In .env use test keys:
STRIPE_SECRET_KEY=sk_test_...

# Test card number:
4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345
```

1. Create test subscription
2. Check Stripe dashboard test mode
3. See balance accumulate
4. Note: Test mode won't actually send money

### **Step 2: Go Live**

1. **Switch to Live Keys:**
   ```env
   # .env
   STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```

2. **Make Real Test Purchase:**
   - Use your own card
   - Buy $10 subscription
   - Check Stripe live dashboard
   - Wait 2-3 days
   - Check Chime account for deposit! 💰

---

## 📊 Monitor Your Payouts

### **Stripe Dashboard:**

**Check Balance:**
https://dashboard.stripe.com/balance

Shows:
- Pending balance (not paid out yet)
- Available balance (ready for payout)
- Total volume

**Check Payout History:**
https://dashboard.stripe.com/payouts

Shows:
- Date of payout
- Amount
- Status (paid/pending/failed)
- Arrival date

**Check Failed Payouts:**
If payout fails:
- Wrong account number
- Chime account closed
- Insufficient info provided

Fix and retry from dashboard.

---

## 🔧 Troubleshooting

### **Problem: "Bank account verification failed"**

**Solution:**
1. Double-check routing/account numbers
2. Make sure name matches Chime account
3. Wait 2-3 business days for micro-deposits
4. Enter exact amounts (e.g., $0.32 and $0.45)

---

### **Problem: "Payouts paused - verification needed"**

**Solution:**
1. Go to: https://dashboard.stripe.com/settings/account
2. Complete identity verification
3. Upload ID if requested
4. Confirm business details
5. Usually approved in 1-2 days

---

### **Problem: "Chime flagged the deposit"**

**Solution:**
1. Contact Chime support: 1-844-244-6363
2. Explain: "Business revenue from Stripe"
3. Provide Stripe payout details
4. Usually resolved in 24 hours

---

### **Problem: "Haven't received money yet"**

**Check Timeline:**
- Payment made: Day 0
- Stripe releases: Day 2
- Bank transfer: Day 3-4
- Total: 3-4 days

**If longer:**
1. Check Stripe payout status
2. Verify Chime account number correct
3. Check if Chime flagged deposit
4. Contact Stripe support if >7 days

---

## 📱 Enable Stripe Mobile App

Download Stripe app for easy monitoring:
- iOS: https://apps.apple.com/app/stripe-dashboard/id978516833
- Android: https://play.google.com/store/apps/details?id=com.stripe.android.dashboard

**Benefits:**
- See revenue in real-time
- Get payout notifications
- Monitor subscriptions
- Check for issues

---

## 💡 Pro Tips

### **Maximize Your Revenue:**

1. **Enable Automatic Tax:**
   - Stripe calculates sales tax automatically
   - You stay compliant
   - https://dashboard.stripe.com/settings/tax

2. **Set Up Email Receipts:**
   - Stripe emails receipts to customers
   - Professional branding
   - https://dashboard.stripe.com/settings/emails

3. **Track Revenue:**
   - Use Stripe reporting
   - Export to CSV for taxes
   - https://dashboard.stripe.com/reports

4. **Save 15% on Taxes:**
   - Form an LLC
   - Deduct business expenses
   - Talk to accountant (worth it!)

---

## 🎯 Final Checklist

Before launching payments:

- [ ] Chime account active & verified
- [ ] Routing & account numbers copied
- [ ] Stripe dashboard account created
- [ ] Bank account added to Stripe
- [ ] Micro-deposits verified (takes 2-3 days)
- [ ] Identity verification completed
- [ ] Payout schedule set (daily recommended)
- [ ] Test payment made & received
- [ ] Stripe mobile app installed
- [ ] Bookkeeping system ready (spreadsheet or QuickBooks)

---

## 📊 Expected Revenue (Examples)

### **Scenario 1: 10 Users at $50/month**
```
Gross revenue:     $500/month
Stripe fees:       -$16.50
Your net:          $483.50/month
Annual:            $5,802/year
```

### **Scenario 2: 100 Users at $100/month**
```
Gross revenue:     $10,000/month
Stripe fees:       -$320
Your net:          $9,680/month
Annual:            $116,160/year 💰
```

### **Scenario 3: 1000 Users at $50/month**
```
Gross revenue:     $50,000/month
Stripe fees:       -$1,600
Your net:          $48,400/month
Annual:            $580,800/year 🚀
```

---

## 🎉 You're All Set!

Once Chime is connected:
- ✅ Money automatically transfers
- ✅ No manual withdrawals needed
- ✅ Get paid every 2-3 days
- ✅ Track everything in Stripe dashboard
- ✅ Receive notifications in app
- ✅ Focus on building, not payments

---

## 📞 Support Contacts

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com/support
- Phone: 1-888-926-2289
- Chat: Available in dashboard

**Chime Support:**
- Phone: 1-844-244-6363
- Chat: Available in app
- Hours: 24/7

**Tax Questions:**
- Consult CPA or accountant
- Expect 1099-K from Stripe if >$600/year
- Save ~30% for taxes (estimated)

---

## 🚀 Ready to Get Paid!

**Steps:**
1. Add Chime to Stripe (10 min)
2. Verify micro-deposits (2-3 days)
3. Launch ForTheWeebs
4. Start getting subscribers
5. Watch money roll in! 💰

**Next:** Update your legal policies so everything's compliant.
