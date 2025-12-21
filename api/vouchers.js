// API routes for launch voucher system
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const crypto = require('crypto');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Initialize SES
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fortheweebs.com';
const TOTAL_VOUCHERS = 100;

// Helper function to generate voucher code
function generateVoucherCode(type) {
  const prefix = type === '15percent' ? 'FTW15' : 'FTW25';
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${randomPart}`;
}

// Helper function to generate fingerprint
function generateFingerprint(req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

// Helper function to send voucher email
async function sendVoucherEmail(email, voucherCode, voucherType) {
  const discountText = voucherType === '15percent' 
    ? '15% off any subscription tier'
    : '25% off the $1,000 elite tier';
  
  const params = {
    Source: `FORTHEWEEBS Launch Vouchers <${FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: `🎉 Your ForTheWeebs Launch Voucher: ${voucherCode}`,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .voucher-code { background: white; color: #e94560; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 24px; text-align: center; margin: 20px 0; font-weight: bold; }
                  .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                  .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎊 Your Exclusive Launch Voucher!</h1>
                  </div>
                  <div class="content">
                    <p>Congratulations! You're one of the first 100 visitors to <strong>ForTheWeebs.com</strong>.</p>
                    
                    <div class="voucher-code">${voucherCode}</div>
                    
                    <p><strong>Your Discount:</strong> ${discountText}</p>
                    
                    <p>Use this code when creating your subscription to claim your exclusive early-adopter discount.</p>
                    
                    <p><strong>⏰ Expires in 30 days</strong></p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://fortheweebs.com/signup" class="button">Sign Up Now</a>
                    </div>
                    
                    <div class="footer">
                      <p>FORTHEWEEBS - Creator-First Platform</p>
                      <p>You're receiving this because you visited our launch page.</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log('Voucher email sent successfully:', { email, voucherCode });
    return { success: true };
  } catch (error) {
    console.error('Error sending voucher email:', error);
    return { success: false, error: error.message };
  }
}

// Check voucher availability
router.get('/availability', async (req, res) => {
  try {
    const { count } = await supabase
      .from('launch_vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('claimed', true);

    const remaining = Math.max(0, TOTAL_VOUCHERS - (count || 0));

    res.status(200).json({ 
      total: TOTAL_VOUCHERS,
      claimed: count || 0,
      remaining 
    });

  } catch (error) {
    console.error('Failed to check voucher availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Claim a voucher
router.post('/claim', async (req, res) => {
  try {
    const { email, voucherType } = req.body;
    const fingerprint = generateFingerprint(req);

    if (!email || !voucherType) {
      return res.status(400).json({ error: 'Email and voucher type are required' });
    }

    if (!['15percent', '25percent'].includes(voucherType)) {
      return res.status(400).json({ error: 'Invalid voucher type' });
    }

    // Check total vouchers claimed
    const { count: totalClaimed } = await supabase
      .from('launch_vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('claimed', true);

    if (totalClaimed >= TOTAL_VOUCHERS) {
      return res.status(400).json({ error: 'All vouchers have been claimed' });
    }

    // Check if user already claimed (by email or fingerprint)
    const { data: existingClaim } = await supabase
      .from('launch_vouchers')
      .select('*')
      .or(`email.eq.${email},fingerprint.eq.${fingerprint}`)
      .eq('claimed', true)
      .single();

    if (existingClaim) {
      return res.status(400).json({ 
        error: 'You have already claimed a voucher. Each person can only claim one voucher.' 
      });
    }

    // Generate voucher code
    const voucherCode = generateVoucherCode(voucherType);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

    // Create voucher record
    const { data: voucher, error } = await supabase
      .from('launch_vouchers')
      .insert([{
        email,
        fingerprint,
        voucher_code: voucherCode,
        voucher_type: voucherType,
        discount_amount: voucherType === '15percent' ? 15 : 25,
        claimed: true,
        claimed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        redeemed: false
      }])
      .select()
      .single();

    if (error) throw error;

    // Send voucher email
    await sendVoucherEmail(email, voucherCode, voucherType);

    // Get updated remaining count
    const { count: newTotalClaimed } = await supabase
      .from('launch_vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('claimed', true);

    const remaining = TOTAL_VOUCHERS - (newTotalClaimed || 0);

    res.status(200).json({ 
      success: true,
      voucherCode,
      expiresAt: expiresAt.toISOString(),
      remainingVouchers: remaining
    });

  } catch (error) {
    console.error('Voucher claim error:', error);
    res.status(500).json({ error: 'Failed to claim voucher' });
  }
});

// Validate voucher code (for redemption during checkout)
router.post('/validate', async (req, res) => {
  try {
    const { voucherCode, subscriptionAmount } = req.body;

    if (!voucherCode) {
      return res.status(400).json({ error: 'Voucher code is required' });
    }

    // Find voucher
    const { data: voucher, error } = await supabase
      .from('launch_vouchers')
      .select('*')
      .eq('voucher_code', voucherCode.toUpperCase())
      .single();

    if (error || !voucher) {
      return res.status(404).json({ error: 'Invalid voucher code' });
    }

    // Check if already redeemed
    if (voucher.redeemed) {
      return res.status(400).json({ error: 'This voucher has already been used' });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(voucher.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ error: 'This voucher has expired' });
    }

    // Validate voucher type against subscription amount
    if (voucher.voucher_type === '25percent' && subscriptionAmount < 1000) {
      return res.status(400).json({ 
        error: 'This voucher is only valid for the $1,000 elite tier subscription' 
      });
    }

    // Calculate discount
    const discountPercent = voucher.discount_amount;
    const discountAmount = (subscriptionAmount * discountPercent) / 100;
    const finalAmount = subscriptionAmount - discountAmount;

    res.status(200).json({ 
      valid: true,
      discountPercent,
      discountAmount,
      originalAmount: subscriptionAmount,
      finalAmount,
      voucherType: voucher.voucher_type
    });

  } catch (error) {
    console.error('Voucher validation error:', error);
    res.status(500).json({ error: 'Failed to validate voucher' });
  }
});

// Redeem voucher (mark as used after successful payment)
router.post('/redeem', async (req, res) => {
  try {
    const { voucherCode, userId, subscriptionId } = req.body;

    if (!voucherCode || !userId) {
      return res.status(400).json({ error: 'Voucher code and user ID are required' });
    }

    // Find and update voucher
    const { data: voucher, error: fetchError } = await supabase
      .from('launch_vouchers')
      .select('*')
      .eq('voucher_code', voucherCode.toUpperCase())
      .single();

    if (fetchError || !voucher) {
      return res.status(404).json({ error: 'Invalid voucher code' });
    }

    if (voucher.redeemed) {
      return res.status(400).json({ error: 'Voucher already redeemed' });
    }

    // Mark as redeemed
    const { error: updateError } = await supabase
      .from('launch_vouchers')
      .update({
        redeemed: true,
        redeemed_at: new Date().toISOString(),
        redeemed_by_user_id: userId,
        subscription_id: subscriptionId
      })
      .eq('voucher_code', voucherCode.toUpperCase());

    if (updateError) throw updateError;

    res.status(200).json({ 
      success: true,
      message: 'Voucher redeemed successfully' 
    });

  } catch (error) {
    console.error('Voucher redemption error:', error);
    res.status(500).json({ error: 'Failed to redeem voucher' });
  }
});

// Admin: Get all vouchers with stats
router.get('/admin/list', async (req, res) => {
  try {
    // Admin authentication middleware ready - enable as needed
    
    const { data: vouchers, error } = await supabase
      .from('launch_vouchers')
      .select('*')
      .order('claimed_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const stats = {
      total: TOTAL_VOUCHERS,
      claimed: vouchers.filter(v => v.claimed).length,
      redeemed: vouchers.filter(v => v.redeemed).length,
      expired: vouchers.filter(v => new Date(v.expires_at) < new Date()).length,
      type15percent: vouchers.filter(v => v.voucher_type === '15percent').length,
      type25percent: vouchers.filter(v => v.voucher_type === '25percent').length
    };

    res.status(200).json({ vouchers, stats });

  } catch (error) {
    console.error('Failed to fetch vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

module.exports = router;
