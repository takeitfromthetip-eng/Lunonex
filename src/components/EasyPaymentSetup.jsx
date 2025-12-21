import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthSupabase.jsx';

/**
 * EasyPaymentSetup - Simple payment setup for creators
 * No Stripe dashboard needed - just enter bank info and done
 */
export function EasyPaymentSetup({ userId }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: info, 2: bank details, 3: done
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [accountStatus, setAccountStatus] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    country: 'US',
    // Bank info
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking', // checking or savings
    // Personal info for verification
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn_last4: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    checkAccountStatus();
  }, [userId]);

  const checkAccountStatus = async () => {
    try {
      const response = await fetch(`/api/stripe-connect/account-status/${userId}`);
      const data = await response.json();
      setAccountStatus(data);

      if (data.connected && data.status === 'active') {
        setStep(3); // Already set up
      }
    } catch (err) {
      console.error('Error checking account status:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetupPayments = async () => {
    setProcessing(true);
    setError('');

    try {
      // Create Stripe Connect account with bank info
      const response = await fetch('/api/stripe-connect/easy-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
      } else {
        setError(data.error || 'Setup failed. Please try again.');
      }
    } catch (err) {
      setError('Error setting up payments: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        borderRadius: '20px',
        padding: '40px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>
          Payment Setup Complete!
        </h2>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          You can now receive tips, commissions, and subscription payments directly to your bank account.
        </p>
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '10px'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            💰 Platform Fee: {accountStatus?.platformFee || '15%'} (0% if you paid $15+ to unlock tools)
          </p>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Payments are deposited to your bank within 2-7 business days
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>
          💸 Get Paid
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          Set up payments in 2 minutes - no Stripe account needed!
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '40px'
      }}>
        {[1, 2, 3].map(num => (
          <div key={num} style={{
            flex: 1,
            textAlign: 'center',
            opacity: step >= num ? 1 : 0.5
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step >= num ? 'white' : 'rgba(255,255,255,0.3)',
              color: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              fontWeight: 'bold'
            }}>
              {num}
            </div>
            <div style={{ fontSize: '12px' }}>
              {num === 1 ? 'Info' : num === 2 ? 'Bank Details' : 'Done'}
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Personal Information</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Last 4 digits of SSN (for verification)</label>
            <input
              type="text"
              value={formData.ssn_last4}
              onChange={(e) => handleChange('ssn_last4', e.target.value)}
              maxLength={4}
              placeholder="1234"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.ssn_last4}
            style={{
              width: '100%',
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '15px',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Next: Bank Details →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Bank Account</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Account Holder Name</label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => handleChange('accountHolderName', e.target.value)}
              placeholder="Full name on account"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Routing Number</label>
            <input
              type="text"
              value={formData.routingNumber}
              onChange={(e) => handleChange('routingNumber', e.target.value)}
              maxLength={9}
              placeholder="9 digits"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              placeholder="Account number"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => handleChange('accountType', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px'
              }}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            🔒 Your bank info is encrypted and secure. We use Stripe for all payment processing.
          </div>

          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.2)',
              border: '2px solid #f44336',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSetupPayments}
              disabled={processing || !formData.accountHolderName || !formData.routingNumber || !formData.accountNumber}
              style={{
                flex: 2,
                background: processing ? '#999' : 'white',
                color: '#667eea',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? '⏳ Setting up...' : '✅ Complete Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EasyPaymentSetup;
