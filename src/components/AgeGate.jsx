import { useState, useEffect } from 'react';

/**
 * AGE VERIFICATION GATE (18+)
 * Required by Google Play and Apple App Store for mature content
 * Shows on first launch, stores verification in localStorage
 * OWNER (polotuspossumus@gmail.com) bypasses this check
 */
export default function AgeGate({ onVerified }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Owner never sees age gate
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('ownerEmail');
    if (userEmail === 'polotuspossumus@gmail.com') {
      onVerified?.();
      return;
    }
    
    // Check if user has already verified age
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      setShow(true);
    } else {
      onVerified?.();
    }
  }, [onVerified]);

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    localStorage.setItem('ageVerifiedDate', new Date().toISOString());
    setShow(false);
    onVerified?.();
  };

  const handleExit = () => {
    alert('You must be 18 or older to use ForTheWeebs.');
    // Close app or redirect to safe page
    window.location.href = 'about:blank';
  };

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icon}>🔞</div>
        <h1 style={styles.title}>Age Verification Required</h1>
        <p style={styles.description}>
          ForTheWeebs contains user-generated content intended for adults only.
          You must be 18 years or older to continue.
        </p>
        <div style={styles.warning}>
          <strong>⚠️ This app may contain:</strong>
          <ul style={styles.list}>
            <li>Adult themes and content</li>
            <li>User-generated media</li>
            <li>Mature discussions</li>
          </ul>
        </div>
        <p style={styles.question}>Are you 18 years of age or older?</p>
        <div style={styles.buttons}>
          <button 
            onClick={handleConfirm}
            style={{...styles.button, ...styles.yesButton}}
          >
            ✓ Yes, I'm 18 or Older
          </button>
          <button 
            onClick={handleExit}
            style={{...styles.button, ...styles.noButton}}
          >
            ✗ No, Exit App
          </button>
        </div>
        <p style={styles.legal}>
          By clicking "Yes", you confirm that you are of legal age to view adult content
          in your jurisdiction and agree to our{' '}
          <a href="/tos" style={styles.link}>Terms of Service</a> and{' '}
          <a href="/privacy" style={styles.link}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    border: '2px solid #667eea',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
  },
  icon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  title: {
    color: '#ffffff',
    fontSize: '28px',
    marginBottom: '16px',
    fontWeight: 'bold'
  },
  description: {
    color: '#a0a0a0',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  warning: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left',
    color: '#ffc107'
  },
  list: {
    marginTop: '8px',
    marginBottom: 0,
    paddingLeft: '20px',
    color: '#ffffff'
  },
  question: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '24px'
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexDirection: 'column'
  },
  button: {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  yesButton: {
    backgroundColor: '#667eea',
    color: '#ffffff',
  },
  noButton: {
    backgroundColor: '#333',
    color: '#ffffff',
  },
  legal: {
    color: '#666',
    fontSize: '12px',
    lineHeight: '1.4',
    marginTop: '16px'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none'
  }
};
