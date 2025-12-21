# 🔞 CCBill Setup Guide - Adult Content Payments

CCBill is the **industry standard** for adult content payments. Setup is as easy as Stripe!

## 🚀 Quick Setup (5 Minutes)

### Step 1: Sign Up for CCBill
1. Go to: https://www.ccbill.com/apply
2. Fill out merchant application
3. **Required documents:**
   - Business registration (LLC or Corp)
   - Government-issued ID
   - Bank account information
   - Sample content (screenshots of your platform)
4. **Approval time:** 1-3 business days

### Step 2: Get Your Credentials
After approval, CCBill will email you:
- Account Number (e.g., `123456`)
- Subaccount Number (usually `0000`)
- Form Name (e.g., `cc_adult_content`)
- Salt Key (for webhook verification)

### Step 3: Add to .env File
```bash
# CCBill Adult Content Payments
CCBILL_ACCOUNT_NUMBER=123456
CCBILL_SUBACCOUNT=0000
CCBILL_FORM_NAME=cc_adult_content
CCBILL_SALT=your_salt_key_here
CCBILL_FLEX_ID=your_flex_id_here  # Optional - for advanced API features
```

### Step 4: Configure Webhook URL in CCBill Dashboard
1. Login to CCBill merchant portal
2. Go to **Account Info** → **Sub Account Admin**
3. Click **Advanced** → **Approval/Denial Post URL**
4. Set webhook URL:
   ```
   https://fortheweebs.vercel.app/api/ccbill/webhook
   ```
5. Click **Save Changes**

### Step 5: Test It!
```javascript
// Frontend code example
const response = await fetch('/api/ccbill/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 9.99,
    userId: user.id,
    contentId: 'adult_content_123',
    description: 'Adult content unlock',
    userEmail: user.email,
    userFirstName: user.firstName,
    userLastName: user.lastName
  })
});

const { checkoutUrl } = await response.json();
window.location.href = checkoutUrl; // Redirect to CCBill checkout
```

## ✅ What's Already Done
- ✅ API endpoints created (`/api/ccbill/*`)
- ✅ Webhook handler configured
- ✅ Payment flow integrated
- ✅ Subscription support included
- ✅ Security verification built-in

## 💰 Pricing
- **Fees:** 10.5% + $0.30 per transaction
- **Minimum:** $2.95 per transaction
- **Payout:** Weekly via wire transfer
- **Currencies:** USD (primary)

## 🔒 Security Features
- ✅ MD5 hash verification for webhooks
- ✅ Salt-based signature validation
- ✅ HTTPS required
- ✅ PCI-DSS Level 1 compliant (CCBill handles all card data)

## 🎯 Best Practices
1. **Always verify webhooks** - The code does this automatically
2. **Test with small amounts first** - Use $2.95 minimum
3. **Set clear descriptions** - Helps with chargebacks
4. **Monitor disputes** - CCBill has good chargeback protection
5. **Keep records** - Log all transactions for 7 years (legal requirement)

## 🔧 Alternative Processors (if CCBill doesn't approve)

### Option 2: Segpay
- Already integrated in `api/segpay.js`
- Signup: https://www.segpay.com/merchants/
- Fees: 10-15%
- Similar setup process

### Option 3: Paxum (Crypto-friendly)
- Signup: https://www.paxum.com/payment_gateway/apply.php
- Fees: 3-8%
- Accepts crypto + adult content
- Fastest approval (1-2 days)

## 🆘 Troubleshooting

**Problem:** "Account number not configured"
**Solution:** Add `CCBILL_ACCOUNT_NUMBER` to .env file

**Problem:** "Webhook verification failed"
**Solution:** Verify `CCBILL_SALT` matches CCBill dashboard exactly

**Problem:** "Transaction declined"
**Solution:** Check minimum amount ($2.95), test card details

**Problem:** "Subscription cancellation failed"
**Solution:** Contact CCBill to enable FlexForms API, add `CCBILL_FLEX_ID` to .env

## 📊 How It Works

1. **User clicks "Unlock Adult Content"**
2. **Your frontend calls** `/api/ccbill/create-checkout`
3. **User redirects to CCBill** secure payment page
4. **User enters card info** (CCBill handles all PCI compliance)
5. **CCBill processes payment**
6. **CCBill calls your webhook** with payment confirmation
7. **Your backend verifies webhook** and grants content access
8. **User redirected back** to your success page

## 🎉 You're Ready!

Just add those 4 lines to your .env file and you're processing adult content payments! 🚀

**Need help?** CCBill has 24/7 merchant support: support@ccbill.com
