import React, { useEffect } from 'react';

const PaymentSuccess = () => {
  const params = new URLSearchParams(window.location.search);
  const itemCount = params.get('items') || '0';

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/dashboard#aicompanion';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>🎉</div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.subtitle}>
          Your {itemCount} item{itemCount !== '1' ? 's' : ''} ha{itemCount !== '1' ? 've' : 's'} been added to your account.
        </p>

        <div style={styles.checkmark}>
          <svg style={styles.checkmarkSvg} viewBox="0 0 52 52">
            <circle style={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
            <path style={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <div style={styles.infoBox}>
          <p>✅ Payment confirmed</p>
          <p>✅ Items delivered to inventory</p>
          <p>✅ Receipt sent to email</p>
        </div>

        <p style={styles.redirect}>Redirecting to dashboard in 5 seconds...</p>

        <button
          onClick={() => window.location.href = '/dashboard#aicompanion'}
          style={styles.button}
        >
          Go to Dashboard Now
        </button>

        <button
          onClick={() => window.location.href = '/dashboard#inventory'}
          style={styles.buttonSecondary}
        >
          View My Inventory
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '3rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  successIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
    animation: 'bounce 1s ease-in-out',
  },
  title: {
    fontSize: '2rem',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  checkmark: {
    width: '80px',
    height: '80px',
    margin: '2rem auto',
  },
  checkmarkSvg: {
    width: '100%',
    height: '100%',
  },
  checkmarkCircle: {
    strokeDasharray: 166,
    strokeDashoffset: 166,
    stroke: '#10b981',
    strokeWidth: 2,
    strokeMiterlimit: 10,
    fill: 'none',
    animation: 'stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
  },
  checkmarkCheck: {
    transformOrigin: '50% 50%',
    strokeDasharray: 48,
    strokeDashoffset: 48,
    stroke: '#10b981',
    strokeWidth: 3,
    animation: 'stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
  },
  infoBox: {
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  redirect: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'background 0.3s',
  },
  buttonSecondary: {
    width: '100%',
    padding: '1rem',
    background: 'transparent',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

export default PaymentSuccess;
