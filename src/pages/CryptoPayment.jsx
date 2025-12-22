import React, { useState, useEffect } from 'react';


const CryptoPayment = () => {
  const paymentId = window.location.pathname.split('/payment/crypto/')[1];
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    fetchPaymentStatus();
    const interval = setInterval(fetchPaymentStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [paymentId]);

  useEffect(() => {
    if (!payment?.expires_at) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiresAt = new Date(payment.expires_at).getTime();
      const remaining = Math.max(0, expiresAt - now);

      if (remaining === 0) {
        setTimeRemaining('EXPIRED');
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [payment?.expires_at]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/crypto/payment-status/${paymentId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setPayment(data);
      setLoading(false);

      // If payment completed, redirect to success page
      if (data.status === 'completed') {
        setTimeout(() => {
          window.location.href = '/payment/success?items=' + data.items.length;
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>❌ Payment Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/dashboard'} style={styles.button}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'expired': return '#ef4444';
      case 'failed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'expired': return '⏰';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Crypto Payment</h1>
          <div style={{...styles.statusBadge, background: getStatusColor(payment.status)}}>
            {getStatusEmoji(payment.status)} {payment.status.toUpperCase()}
          </div>
        </div>

        {payment.status === 'pending' && (
          <>
            <div style={styles.timer}>
              <span>Time Remaining:</span>
              <span style={styles.timerValue}>{timeRemaining}</span>
            </div>

            <div style={styles.paymentInfo}>
              <h2>Send Payment</h2>
              <div style={styles.infoRow}>
                <span>Amount:</span>
                <strong>${payment.amount_usd}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Currency:</span>
                <strong>{payment.crypto_currency}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Crypto Amount:</span>
                <strong>{payment.crypto_amount || 'Calculating...'} {payment.crypto_currency}</strong>
              </div>
            </div>

            <div style={styles.walletSection}>
              <h3>Send to this address:</h3>
              <div style={styles.walletAddress}>
                {payment.wallet_address || 'Generating address...'}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(payment.wallet_address)}
                style={styles.copyButton}
              >
                📋 Copy Address
              </button>
            </div>

            {payment.wallet_address && (
              <div style={styles.qrSection}>
                <p>Scan QR Code:</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${payment.wallet_address}`}
                  alt="Payment QR Code"
                  style={styles.qrCode}
                />
              </div>
            )}

            <div style={styles.instructions}>
              <h3>Instructions:</h3>
              <ol>
                <li>Copy the wallet address above</li>
                <li>Open your crypto wallet app</li>
                <li>Send exactly {payment.crypto_amount} {payment.crypto_currency}</li>
                <li>Wait for confirmation (usually 1-10 minutes)</li>
              </ol>
            </div>
          </>
        )}

        {payment.status === 'confirmed' && (
          <div style={styles.processingBox}>
            <div style={styles.spinner}></div>
            <h2>Payment Confirmed!</h2>
            <p>Processing your purchase... Please wait.</p>
          </div>
        )}

        {payment.status === 'completed' && (
          <div style={styles.successBox}>
            <h2>🎉 Payment Complete!</h2>
            <p>Your items have been added to your account.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        )}

        {payment.status === 'expired' && (
          <div style={styles.expiredBox}>
            <h2>⏰ Payment Expired</h2>
            <p>This payment link has expired. Please create a new order.</p>
            <button onClick={() => window.location.href = '/dashboard'} style={styles.button}>
              Return to Store
            </button>
          </div>
        )}

        <div style={styles.itemsList}>
          <h3>Items in this order:</h3>
          {payment.items?.map((item, idx) => (
            <div key={idx} style={styles.item}>
              <span>{item.name}</span>
              <span>${item.price}</span>
            </div>
          ))}
          <div style={styles.total}>
            <strong>Total:</strong>
            <strong>${payment.amount_usd}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '1rem',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  timer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fef3c7',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
  },
  timerValue: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#d97706',
  },
  paymentInfo: {
    background: '#f3f4f6',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  walletSection: {
    marginBottom: '1.5rem',
  },
  walletAddress: {
    background: '#1f2937',
    color: '#10b981',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    wordBreak: 'break-all',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
  copyButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  qrSection: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  qrCode: {
    border: '4px solid #e5e7eb',
    borderRadius: '8px',
    marginTop: '0.5rem',
  },
  instructions: {
    background: '#dbeafe',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  itemsList: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 0',
    fontSize: '1.2rem',
  },
  processingBox: {
    textAlign: 'center',
    padding: '2rem',
  },
  successBox: {
    textAlign: 'center',
    padding: '2rem',
    background: '#d1fae5',
    borderRadius: '8px',
    color: '#065f46',
  },
  expiredBox: {
    textAlign: 'center',
    padding: '2rem',
    background: '#fee2e2',
    borderRadius: '8px',
    color: '#991b1b',
  },
  errorBox: {
    textAlign: 'center',
    padding: '2rem',
    background: '#fee2e2',
    borderRadius: '8px',
    color: '#991b1b',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem 2rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },
};

export default CryptoPayment;
