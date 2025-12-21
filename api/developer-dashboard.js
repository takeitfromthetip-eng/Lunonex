/**
 * FORTHEWEEBS API MARKETPLACE - DEVELOPER DASHBOARD
 * 
 * Analytics, usage stats, billing history. Show devs their ROI. 📊💰
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================================================
// DASHBOARD - OVERVIEW
// ============================================================================

/**
 * GET /api/developer/dashboard
 * Main dashboard with key metrics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all active keys
    const { data: keys } = await supabase
      .from('api_keys')
      .select('id, this_month_requests, api_plans(requests_per_month)')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Calculate total usage across all keys
    const totalRequests = keys?.reduce((sum, k) => sum + k.this_month_requests, 0) || 0;
    const totalLimit = keys?.reduce((sum, k) => sum + (k.api_plans?.requests_per_month || 0), 0) || 0;

    // Get usage stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usageData } = await supabase
      .from('api_usage')
      .select('created_at, status_code, response_time_ms, charged_to_dev, cost_to_us')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Calculate metrics
    const successfulRequests = usageData?.filter(u => u.status_code >= 200 && u.status_code < 300).length || 0;
    const failedRequests = usageData?.filter(u => u.status_code >= 400).length || 0;
    const avgResponseTime = usageData?.length > 0
      ? Math.round(usageData.reduce((sum, u) => sum + (u.response_time_ms || 0), 0) / usageData.length)
      : 0;
    const totalRevenue = usageData?.reduce((sum, u) => sum + (u.charged_to_dev || 0), 0) || 0;
    const totalCost = usageData?.reduce((sum, u) => sum + (u.cost_to_us || 0), 0) || 0;

    // Get billing info
    const { data: transactions } = await supabase
      .from('api_transactions')
      .select('amount, created_at, status')
      .eq('user_id', userId)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(1);

    const lastPayment = transactions?.[0];

    res.json({
      success: true,
      dashboard: {
        usage: {
          thisMonth: totalRequests,
          limit: totalLimit,
          percentUsed: totalLimit > 0 ? Math.round((totalRequests / totalLimit) * 100) : 0,
          last30Days: usageData?.length || 0
        },
        performance: {
          successRate: successfulRequests + failedRequests > 0
            ? Math.round((successfulRequests / (successfulRequests + failedRequests)) * 100)
            : 100,
          avgResponseTime: avgResponseTime,
          totalSuccessful: successfulRequests,
          totalFailed: failedRequests
        },
        billing: {
          totalSpent: totalRevenue,
          estimatedCost: totalCost,
          savings: Math.max(0, totalRevenue - totalCost),
          lastPayment: lastPayment ? {
            amount: lastPayment.amount / 100,
            date: lastPayment.created_at
          } : null
        },
        activeKeys: keys?.length || 0
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ============================================================================
// ANALYTICS - USAGE OVER TIME
// ============================================================================

/**
 * GET /api/developer/analytics/usage
 * Usage breakdown by day/week/month
 */
router.get('/analytics/usage', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { period = '30d', keyId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    }

    // Build query
    let query = supabase
      .from('api_usage')
      .select('created_at, status_code, response_time_ms, feature_id')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (keyId) {
      query = query.eq('api_key_id', keyId);
    }

    const { data: usage, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    // Group by day
    const dailyUsage = {};
    const featureUsage = {};

    usage.forEach(record => {
      const date = record.created_at.split('T')[0];
      
      // Daily totals
      if (!dailyUsage[date]) {
        dailyUsage[date] = { total: 0, successful: 0, failed: 0, avgResponseTime: [] };
      }
      dailyUsage[date].total++;
      if (record.status_code >= 200 && record.status_code < 300) {
        dailyUsage[date].successful++;
      } else if (record.status_code >= 400) {
        dailyUsage[date].failed++;
      }
      if (record.response_time_ms) {
        dailyUsage[date].avgResponseTime.push(record.response_time_ms);
      }

      // Feature breakdown
      featureUsage[record.feature_id] = (featureUsage[record.feature_id] || 0) + 1;
    });

    // Calculate averages
    Object.keys(dailyUsage).forEach(date => {
      const times = dailyUsage[date].avgResponseTime;
      dailyUsage[date].avgResponseTime = times.length > 0
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;
    });

    res.json({
      success: true,
      period,
      analytics: {
        daily: Object.keys(dailyUsage).sort().map(date => ({
          date,
          ...dailyUsage[date]
        })),
        features: Object.entries(featureUsage)
          .sort((a, b) => b[1] - a[1])
          .map(([feature, count]) => ({ feature, count })),
        totalRequests: usage.length
      }
    });

  } catch (error) {
    console.error('Usage analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// ============================================================================
// ANALYTICS - COST BREAKDOWN
// ============================================================================

/**
 * GET /api/developer/analytics/costs
 * Cost analysis and profit margins
 */
router.get('/analytics/costs', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { period = '30d' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    const { data: usage, error } = await supabase
      .from('api_usage')
      .select('created_at, feature_id, cost_to_us, charged_to_dev, profit')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch cost data' });
    }

    // Analyze by feature
    const featureCosts = {};
    let totalCost = 0;
    let totalCharged = 0;
    let totalProfit = 0;

    usage.forEach(record => {
      if (!featureCosts[record.feature_id]) {
        featureCosts[record.feature_id] = {
          requests: 0,
          cost: 0,
          charged: 0,
          profit: 0
        };
      }

      const fc = featureCosts[record.feature_id];
      fc.requests++;
      fc.cost += record.cost_to_us || 0;
      fc.charged += record.charged_to_dev || 0;
      fc.profit += record.profit || 0;

      totalCost += record.cost_to_us || 0;
      totalCharged += record.charged_to_dev || 0;
      totalProfit += record.profit || 0;
    });

    res.json({
      success: true,
      costs: {
        summary: {
          totalCost: parseFloat(totalCost.toFixed(4)),
          totalCharged: parseFloat(totalCharged.toFixed(4)),
          totalProfit: parseFloat(totalProfit.toFixed(4)),
          profitMargin: totalCharged > 0 ? Math.round((totalProfit / totalCharged) * 100) : 0
        },
        byFeature: Object.entries(featureCosts)
          .map(([feature, data]) => ({
            feature,
            requests: data.requests,
            cost: parseFloat(data.cost.toFixed(4)),
            charged: parseFloat(data.charged.toFixed(4)),
            profit: parseFloat(data.profit.toFixed(4)),
            avgCostPerRequest: parseFloat((data.cost / data.requests).toFixed(4))
          }))
          .sort((a, b) => b.charged - a.charged)
      }
    });

  } catch (error) {
    console.error('Cost breakdown error:', error);
    res.status(500).json({ error: 'Failed to generate cost breakdown' });
  }
});

// ============================================================================
// BILLING - TRANSACTION HISTORY
// ============================================================================

/**
 * GET /api/developer/billing/transactions
 * Payment history
 */
router.get('/billing/transactions', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 50, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: transactions, error, count } = await supabase
      .from('api_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount / 100,
        currency: t.currency,
        status: t.status,
        billingPeriod: t.billing_period_start ? {
          start: t.billing_period_start,
          end: t.billing_period_end,
          requests: t.requests_in_period,
          overage: t.overage_requests
        } : null,
        stripeInvoiceId: t.stripe_invoice_id,
        createdAt: t.created_at,
        paidAt: t.paid_at
      })),
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count
      }
    });

  } catch (error) {
    console.error('Billing transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

// ============================================================================
// WEBHOOKS - MANAGEMENT
// ============================================================================

/**
 * POST /api/developer/webhooks
 * Register webhook endpoint
 */
router.post('/webhooks', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { url, events, keyId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'URL and events array required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid webhook URL' });
    }

    // Generate webhook secret
    const secret = 'whsec_' + require('crypto').randomBytes(24).toString('hex');

    const { data: webhook, error } = await supabase
      .from('api_webhooks')
      .insert({
        user_id: userId,
        api_key_id: keyId,
        url,
        secret,
        events
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create webhook' });
    }

    res.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret, // ⚠️ Only shown once
        events: webhook.events,
        createdAt: webhook.created_at
      }
    });

  } catch (error) {
    console.error('Webhook registration error:', error);
    res.status(500).json({ error: 'Failed to register webhook' });
  }
});

/**
 * GET /api/developer/webhooks
 * List webhooks
 */
router.get('/webhooks', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: webhooks, error } = await supabase
      .from('api_webhooks')
      .select('id, url, events, is_active, last_triggered_at, failure_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Webhooks fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch webhooks' });
    }

    res.json({
      success: true,
      webhooks
    });

  } catch (error) {
    console.error('List webhooks error:', error);
    res.status(500).json({ error: 'Failed to list webhooks' });
  }
});

module.exports = router;
