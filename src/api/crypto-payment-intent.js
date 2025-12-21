/* eslint-disable */
/**
 * Crypto Payment Intent API
 * 
 * Bitcoin: $1000 minimum (auto-converted to USD)
 * Ethereum: $2000 minimum (auto-converted to USD)
 * 
 * Upcharge is NON-NEGOTIABLE. We don't like crypto, but we'll help you offload it.
 * 
 * Multi-Account System: Sub-account payments route to parent account's crypto wallet
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// This would typically use a crypto payment processor like:
// - Coinbase Commerce
// - BTCPay Server
// - NOWPayments
// - CoinGate
// For now, this is a reference implementation

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, unlockType, cryptoType, amount, accountId } = req.body;

        // MULTI-ACCOUNT PAYMENT ROUTING
        // If this is a sub-account, route payment to parent account's wallet
        let paymentWallet = null;
        if (accountId) {
            const supabase = createClient(
                process.env.VITE_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            
            const { data: account } = await supabase
                .from('accounts')
                .select('payment_routing_id, crypto_wallet_address')
                .eq('id', accountId)
                .single();
            
            if (account?.payment_routing_id) {
                const { data: parentAccount } = await supabase
                    .from('accounts')
                    .select('crypto_wallet_address')
                    .eq('id', account.payment_routing_id)
                    .single();
                
                paymentWallet = parentAccount?.crypto_wallet_address;
                console.log(`💰 Routing crypto payment: Sub-account ${accountId} → Parent wallet ${paymentWallet}`);
            }
        }

        // Validate crypto type and minimum amounts
        const cryptoRules = {
            bitcoin: {
                minUSD: 1000,
                currency: 'BTC',
                message: 'Bitcoin minimum: $1000 USD equivalent (reluctantly accepted)'
            },
            ethereum: {
                minUSD: 2000,
                currency: 'ETH',
                message: 'Ethereum minimum: $2000 USD equivalent (we don\'t like crypto, pay cash instead)'
            }
        };

        if (!cryptoRules[cryptoType]) {
            return res.status(400).json({
                error: 'Invalid crypto type. Only Bitcoin and Ethereum accepted (reluctantly).'
            });
        }

        const rules = cryptoRules[cryptoType];

        if (amount < rules.minUSD) {
            return res.status(400).json({
                error: `${rules.message}. Current amount: $${amount}`,
                minRequired: rules.minUSD
            });
        }

        // In production, integrate with crypto payment processor
        // Example with Coinbase Commerce:
        /*
        const Commerce = require('coinbase-commerce-node');
        const Client = Commerce.Client;
        Client.init(process.env.COINBASE_COMMERCE_API_KEY);
        
        const Charge = Commerce.resources.Charge;
        const chargeData = {
          name: `ForTheWeebs ${unlockType} Unlock`,
          description: `Unlock ${unlockType} - ${rules.currency} payment (auto-converted to USD)`,
          local_price: {
            amount: amount.toFixed(2),
            currency: 'USD'
          },
          pricing_type: 'fixed_price',
          metadata: {
            userId: userId,
            unlockType: unlockType,
            cryptoType: cryptoType,
            platform: 'ForTheWeebs',
            autoConvert: true,
            feeWarning: 'Upcharge is NON-NEGOTIABLE'
          }
        };
    
        const charge = await Charge.create(chargeData);
        */

        // Return error when crypto payment system not configured
        return res.status(503).json({
            success: false,
            error: 'Crypto payment system not configured',
            message: 'Coinbase Commerce integration is not set up yet. Please use card payment or contact support.'
        });

    } catch (error) {
        console.error('Crypto payment intent error:', error);
        return res.status(500).json({
            error: 'Failed to create crypto payment intent',
            message: error.message
        });
    }
}
