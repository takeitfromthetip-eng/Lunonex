// CONTENT MODERATION - NSFW detection, age gate, content approval

import React, { useState } from 'react';
import './ContentModeration.css';

// Simple NSFW keyword detection (client-side fallback)
const NSFW_KEYWORDS = [
  'nsfw', 'adult', 'explicit', 'nude', 'naked', 'sex', 'porn', 'hentai',
  'ecchi', 'lewd', 'r18', 'xxx', '18+', 'mature', 'erotic'
];

const VIOLENCE_KEYWORDS = [
  'gore', 'blood', 'violence', 'death', 'murder', 'kill', 'weapon',
  'gun', 'knife', 'horror', 'scary', 'disturbing'
];

export function ContentModeration() {
  return null; // Utility functions only
}

// Age Gate Component
export function AgeGate({ onVerify }) {
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (!year || year < 1900 || year > currentYear) {
      setError('Please enter a valid birth year');
      return;
    }

    if (age < 18) {
      setError('You must be 18 or older to view this content');
      return;
    }

    // Store verification in localStorage
    localStorage.setItem('ageVerified', 'true');
    localStorage.setItem('ageVerifiedAt', Date.now().toString());
    onVerify(true);
  };

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <h1>🔞 Age Verification Required</h1>
        <p className="age-gate-warning">
          This content may contain adult material. You must be 18 or older to proceed.
        </p>

        <div className="age-gate-form">
          <label>Enter Your Birth Year:</label>
          <input
            type="number"
            placeholder="YYYY"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            min="1900"
            max={new Date().getFullYear()}
          />

          {error && <div className="age-gate-error">{error}</div>}

          <button className="age-gate-verify-btn" onClick={handleVerify}>
            ✓ I am 18 or older
          </button>

          <button className="age-gate-exit-btn" onClick={() => window.history.back()}>
            ← Go Back
          </button>
        </div>

        <p className="age-gate-disclaimer">
          By proceeding, you confirm that you are of legal age in your jurisdiction
          and agree to view adult content at your own discretion.
        </p>
      </div>
    </div>
  );
}

// NSFW Content Wrapper
export function NSFWContent({ children, isNSFW, user = null }) {
  const [verified, setVerified] = useState(() => {
    // AUTO-VERIFY: User has payment history = 18+
    if (user && (user.hasCompletedPurchase || user.hasReceivedPayout || user.stripeAccountVerified)) {
      return true; // Payment = age verified
    }

    const stored = localStorage.getItem('ageVerified');
    const verifiedAt = localStorage.getItem('ageVerifiedAt');

    // Verification expires after 24 hours
    if (stored && verifiedAt) {
      const hoursSince = (Date.now() - parseInt(verifiedAt)) / 1000 / 60 / 60;
      return hoursSince < 24;
    }
    return false;
  });

  if (!isNSFW) {
    return <>{children}</>;
  }

  if (!verified) {
    return <AgeGate onVerify={setVerified} />;
  }

  return (
    <div className="nsfw-content-wrapper">
      <div className="nsfw-warning-banner">
        🔞 This content is marked as NSFW/Adult
        {user?.hasCompletedPurchase && <span> (Age verified via payment)</span>}
      </div>
      {children}
    </div>
  );
}

// NSFW Blur Overlay (for thumbnails)
export function NSFWBlur({ src, alt, isNSFW, onClick, user = null }) {
  const [revealed, setRevealed] = useState(false);
  const [ageVerified, setAgeVerified] = useState(() => {
    // AUTO-VERIFY: User has payment history = 18+
    if (user && (user.hasCompletedPurchase || user.hasReceivedPayout || user.stripeAccountVerified)) {
      return true;
    }

    const stored = localStorage.getItem('ageVerified');
    return stored === 'true';
  });

  if (!isNSFW) {
    return <img src={src} alt={alt} onClick={onClick} />;
  }

  if (!ageVerified) {
    return (
      <div className="nsfw-blur-container" onClick={() => {
        const year = prompt('Enter your birth year to view NSFW content:');
        if (year) {
          const age = new Date().getFullYear() - parseInt(year);
          if (age >= 18) {
            localStorage.setItem('ageVerified', 'true');
            localStorage.setItem('ageVerifiedAt', Date.now().toString());
            setAgeVerified(true);
          } else {
            alert('You must be 18 or older');
          }
        }
      }}>
        <div className="nsfw-blur-overlay">
          <div className="nsfw-blur-icon">🔞</div>
          <div className="nsfw-blur-text">NSFW Content</div>
          <div className="nsfw-blur-subtext">Click to verify age</div>
        </div>
      </div>
    );
  }

  return (
    <div className="nsfw-blur-container">
      {!revealed && (
        <div className="nsfw-blur-overlay" onClick={(e) => {
          e.stopPropagation();
          setRevealed(true);
        }}>
          <div className="nsfw-blur-icon">🔞</div>
          <div className="nsfw-blur-text">NSFW Content</div>
          <div className="nsfw-blur-subtext">Click to reveal</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={revealed ? '' : 'blurred'}
        onClick={onClick}
      />
    </div>
  );
}

// Content Analysis Utilities
export const analyzeContent = (title = '', description = '', tags = []) => {
  const text = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

  const hasNSFWKeywords = NSFW_KEYWORDS.some(keyword => text.includes(keyword));
  const hasViolenceKeywords = VIOLENCE_KEYWORDS.some(keyword => text.includes(keyword));

  let contentRating = 'safe';
  let flags = [];

  if (hasNSFWKeywords) {
    contentRating = 'nsfw';
    flags.push('adult_content');
  }

  if (hasViolenceKeywords) {
    flags.push('violence');
    if (contentRating === 'safe') {
      contentRating = 'mature';
    }
  }

  return {
    isNSFW: contentRating === 'nsfw',
    isMature: contentRating === 'mature' || contentRating === 'nsfw',
    contentRating,
    flags,
    confidence: hasNSFWKeywords || hasViolenceKeywords ? 0.8 : 0.3
  };
};

// Content Approval Status
export const ContentApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged'
};

// Moderation Queue Item Component
export function ModerationQueueItem({ artwork, onApprove, onReject, onFlag }) {
  const analysis = analyzeContent(artwork.title, artwork.description, artwork.tags);

  return (
    <div className="moderation-queue-item">
      <div className="moderation-thumbnail">
        <img src={artwork.url} alt={artwork.title} />
        {analysis.isNSFW && <div className="nsfw-badge">🔞 NSFW</div>}
      </div>

      <div className="moderation-details">
        <h3>{artwork.title || 'Untitled'}</h3>
        <p>{artwork.description}</p>

        <div className="moderation-tags">
          {artwork.tags?.map((tag, idx) => (
            <span key={idx} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="moderation-analysis">
          <strong>Auto-Analysis:</strong>
          <div>Rating: {analysis.contentRating}</div>
          <div>Flags: {analysis.flags.join(', ') || 'None'}</div>
          <div>Confidence: {(analysis.confidence * 100).toFixed(0)}%</div>
        </div>

        <div className="moderation-metadata">
          <div>Uploaded by: {artwork.userId}</div>
          <div>Date: {new Date(artwork.uploadedAt).toLocaleString()}</div>
          <div>Size: {(artwork.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      </div>

      <div className="moderation-actions">
        <button className="approve-btn" onClick={() => onApprove(artwork)}>
          ✓ Approve
        </button>
        <button className="reject-btn" onClick={() => onReject(artwork)}>
          ✕ Reject
        </button>
        <button className="flag-btn" onClick={() => onFlag(artwork)}>
          ⚠️ Flag
        </button>
      </div>
    </div>
  );
}

export default ContentModeration;
