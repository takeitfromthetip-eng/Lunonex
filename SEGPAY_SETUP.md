# Segpay Setup Guide - Adult Content Payment Processing

## What is Segpay?
Segpay is a payment processor that specializes in high-risk merchant accounts, including adult content. They handle payments that Stripe won't accept.

## Why You Need It
- OnlyFans-style creator content requires adult-friendly payment processing
- Stripe will ban you if you process adult content
- Segpay handles subscriptions, one-time payments, and chargebacks

## Setup Steps

### 1. Sign Up for Segpay
1. Go to https://www.segpay.com
2. Click "Merchant Services" → "Apply Now"
3. Fill out application (business info required)
4. Wait 1-3 business days for approval

### 2. Get Your Credentials
Once approved, you'll receive:
- **Merchant ID** - Your unique identifier
- **API Key** - For making API calls
- **Secret Key** - For verifying webhooks

### 3. Add to Your .env File
```env
SEGPAY_MERCHANT_ID=your_merchant_id_here
SEGPAY_API_KEY=your_api_key_here
SEGPAY_SECRET=your_secret_key_here
```

### 4. Configure Webhooks
In Segpay dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/segpay/webhook`
3. Select events:
   - payment.success
   - subscription.created
   - subscription.cancelled
   - chargeback

### 5. Test Integration
```bash
# Test checkout creation
curl -X POST http://localhost:3000/api/segpay/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": 999,
    "description": "Premium Subscription",
    "isAdult": true
  }'
```

## How It Works

### For Customers:
1. Creator posts adult content
2. User clicks "Subscribe" or "Purchase"
3. App checks: Is this adult content? → Use Segpay
4. User goes to Segpay checkout
5. Payment processed
6. Webhook confirms payment
7. Access granted

### For You (Platform Owner):
- You take 10-30% commission on each transaction
- Segpay handles all payment processing
- They send you payouts (usually weekly)
- You handle the technical integration

## Payment Flow

```
User → ForTheWeebs → Segpay Checkout → Payment Success
                ↓
         Webhook to your server
                ↓
         Grant access to content
                ↓
         Creator gets paid (you keep commission)
```

## Adult Content Rules

**You MUST:**
- Verify all users are 18+
- Include 2257 compliance statements
- Have clear Terms of Service
- Moderate content (you have api/moderation.js)
- Keep records of creator identity

**Already Done:**
- ✅ Age verification in code
- ✅ Moderation system
- ✅ Legal protection docs
- ✅ Segpay integration ready

## When to Use Segpay vs Stripe

**Use Segpay for:**
- Adult/NSFW subscriptions
- OnlyFans-style content
- Adult digital products
- Anything with nudity/sexual content

**Use Stripe for:**
- Anime art (non-sexual)
- Tutorials/courses
- SFW merchandise
- Platform fees (non-adult)

## Testing Without Approval

While waiting for Segpay approval, the integration will:
- Accept requests
- Return mock checkout URLs
- Log webhook events
- Work with your existing code

Once approved, just add the real credentials to .env and it's live.

## Support

**Segpay Support:**
- Email: merchant@segpay.com
- Phone: +1 (877) 791-6934
- Developer Docs: https://developers.segpay.com

**Your Integration:**
- File: `api/segpay.js`
- Test endpoint: `http://localhost:3000/api/segpay/create-checkout`
- Webhook: `http://localhost:3000/api/segpay/webhook`

## Next Steps

1. **Apply now** at segpay.com
2. **While waiting**: Test with your platform
3. **Once approved**: Add credentials to .env
4. **Go live**: Start accepting adult content payments
5. **Profit**: Take your commission, pay creators

Your platform is ready. Just waiting on Segpay approval.
