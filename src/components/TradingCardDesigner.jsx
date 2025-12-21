/* eslint-disable */
import React, { useState } from 'react';
import './TradingCardDesigner.css';
import { checkContentLegality, generateLegalDisclaimer } from '../utils/legalProtections';
import { PRINT_ON_DEMAND_TERMS } from '../utils/printOnDemandTerms';

export function TradingCardDesigner({ userId }) {
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copyrightWarning, setCopyrightWarning] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Check content for copyright issues
  const validateContent = (text, cardData = null) => {
    const check = checkContentLegality(text, cardData);
    if (!check.isLegal) {
      setCopyrightWarning(check.issues);
      return false;
    }
    return true;
  };

  // TRADEMARK/COPYRIGHT PROTECTION
  const BLOCKED_TERMS = [
    'pokemon', 'pokémon', 'pikachu', 'charizard', 'nintendo',
    'yugioh', 'yu-gi-oh', 'konami', 'blue-eyes', 'dark magician',
    'magic the gathering', 'mtg', 'wizards of the coast', 'black lotus',
    'marvel', 'dc comics', 'disney', 'star wars', 'harry potter',
    'dragon ball', 'naruto', 'one piece', 'digimon'
  ];

  const checkCopyright = (text, imageName = '') => {
    const lowerText = (text + ' ' + imageName).toLowerCase();
    for (const term of BLOCKED_TERMS) {
      if (lowerText.includes(term)) {
        return {
          blocked: true,
          reason: `"${term}" is a trademarked term. Please use only original content.`
        };
      }
    }
    return { blocked: false };
  };

  const TEMPLATES = {
    'pokemon': {
      name: 'Pokémon Style',
      icon: '⚡',
      description: 'Classic TCG layout with HP, attacks, and weakness',
      elements: ['image', 'name', 'hp', 'type', 'attack1', 'attack2', 'weakness', 'rarity']
    },
    'yugioh': {
      name: 'Yu-Gi-Oh! Style',
      icon: '🃏',
      description: 'Monster/spell/trap cards with ATK/DEF',
      elements: ['image', 'name', 'level', 'attribute', 'type', 'description', 'atk', 'def']
    },
    'magic': {
      name: 'Magic Style',
      icon: '🔮',
      description: 'MTG-inspired with mana cost and abilities',
      elements: ['image', 'name', 'manaCost', 'type', 'abilities', 'power', 'toughness']
    },
    'sports': {
      name: 'Sports Card',
      icon: '⚾',
      description: 'Player stats and info',
      elements: ['photo', 'name', 'team', 'position', 'stats', 'rookie', 'autograph']
    },
    'character': {
      name: 'Character Card',
      icon: '👤',
      description: 'RPG/Anime character cards',
      elements: ['portrait', 'name', 'class', 'level', 'skills', 'backstory', 'stats']
    },
    'collectible': {
      name: 'Art Collectible',
      icon: '🎨',
      description: 'Pure art showcase cards',
      elements: ['artwork', 'title', 'artist', 'edition', 'rarity', 'serialNumber']
    }
  };

  const CARD_SIZES = {
    'standard': { name: 'Standard (2.5" x 3.5")', width: 250, height: 350 },
    'mini': { name: 'Mini (1.75" x 2.5")', width: 175, height: 250 },
    'jumbo': { name: 'Jumbo (5" x 7")', width: 500, height: 700 }
  };

  const FINISHES = [
    { value: 'matte', label: 'Matte', icon: '📄' },
    { value: 'glossy', label: 'Glossy', icon: '✨' },
    { value: 'foil', label: 'Foil', icon: '🌟', premium: true },
    { value: 'holographic', label: 'Holographic', icon: '🌈', premium: true },
    { value: 'textured', label: 'Textured', icon: '🎯', premium: true }
  ];

  const RARITY_TIERS = [
    { value: 'common', label: 'Common', color: '#6b7280' },
    { value: 'uncommon', label: 'Uncommon', color: '#10b981' },
    { value: 'rare', label: 'Rare', color: '#3b82f6' },
    { value: 'epic', label: 'Epic', color: '#8b5cf6' },
    { value: 'legendary', label: 'Legendary', color: '#f59e0b' },
    { value: 'mythic', label: 'Mythic', color: '#ec4899' }
  ];

  const createNewCard = (template) => {
    const newCard = {
      id: `card_${Date.now()}`,
      template,
      size: 'standard',
      finish: 'matte',
      rarity: 'common',
      copyrightVerified: false,
      originalWork: false,
      frontDesign: {
        background: '#1a1a2e',
        image: null,
        elements: {}
      },
      backDesign: {
        background: '#8b5cf6',
        pattern: 'default',
        logo: null,
        customArt: null
      }
    };
    setCards([...cards, newCard]);
    setCurrentCard(newCard);
  };

  const verifyCopyright = async (cardData) => {
    // Check for copyrighted terms
    const bannedTerms = [
      'pokemon', 'pikachu', 'charizard', 'nintendo',
      'yugioh', 'yu-gi-oh', 'konami', 'blue-eyes', 'exodia',
      'magic the gathering', 'mtg', 'wizards of the coast', 'planeswalker',
      'digimon', 'bandai',
      'one piece', 'naruto', 'dragon ball'
    ];

    const cardText = JSON.stringify(cardData.frontDesign.elements).toLowerCase();

    for (const term of bannedTerms) {
      if (cardText.includes(term)) {
        return {
          verified: false,
          reason: `Copyright Issue: Cannot use "${term}" - belongs to existing franchise. Create original content only.`
        };
      }
    }

    return { verified: true, reason: 'Original content verified' };
  };

  return (
    <div className="trading-card-designer">
      <div className="tcd-header">
        <h1>🎴 Trading Card Designer</h1>
        <p className="tcd-subtitle">
          Design custom trading cards with professional templates
        </p>
        <div className="copyright-notice">
          <strong>⚠️ Copyright Policy:</strong> Only create original cards with your own artwork and characters.
          Copying Pokémon, Yu-Gi-Oh!, Magic: The Gathering, or any copyrighted franchise is strictly prohibited
          and will result in immediate account suspension.
        </div>
      </div>

      {!currentCard ? (
        <div className="template-selector">
          <h2>Choose a Template</h2>
          <div className="templates-grid">
            {Object.entries(TEMPLATES).map(([key, template]) => (
              <div
                key={key}
                className="template-card"
                onClick={() => {
                  setSelectedTemplate(key);
                  createNewCard(key);
                }}
              >
                <div className="template-icon">{template.icon}</div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="template-elements">
                  {template.elements.slice(0, 4).map((el, idx) => (
                    <span key={idx} className="element-tag">{el}</span>
                  ))}
                  {template.elements.length > 4 && (
                    <span className="element-tag">+{template.elements.length - 4}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-editor">
          <div className="editor-sidebar">
            <div className="sidebar-section">
              <h3>📐 Card Size</h3>
              <select
                value={currentCard.size}
                onChange={(e) => setCurrentCard({ ...currentCard, size: e.target.value })}
              >
                {Object.entries(CARD_SIZES).map(([key, size]) => (
                  <option key={key} value={key}>{size.name}</option>
                ))}
              </select>
            </div>

            <div className="sidebar-section">
              <h3>✨ Finish</h3>
              <div className="finish-options">
                {FINISHES.map((finish) => (
                  <button
                    key={finish.value}
                    className={`finish-btn ${currentCard.finish === finish.value ? 'active' : ''} ${finish.premium ? 'premium' : ''}`}
                    onClick={() => setCurrentCard({ ...currentCard, finish: finish.value })}
                  >
                    <span className="finish-icon">{finish.icon}</span>
                    <span>{finish.label}</span>
                    {finish.premium && <span className="premium-badge">PRO</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>💎 Rarity</h3>
              <div className="rarity-options">
                {RARITY_TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    className={`rarity-btn ${currentCard.rarity === tier.value ? 'active' : ''}`}
                    style={{
                      borderColor: currentCard.rarity === tier.value ? tier.color : 'transparent',
                      color: tier.color
                    }}
                    onClick={() => setCurrentCard({ ...currentCard, rarity: tier.value })}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>🎨 Design Elements</h3>
              <div className="element-controls">
                {TEMPLATES[currentCard.template].elements.map((element) => (
                  <div key={element} className="element-control">
                    <label>{element}</label>
                    <input
                      type="text"
                      placeholder={`Enter ${element}...`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newCard = { ...currentCard };
                        newCard.frontDesign.elements[element] = value;
                        setCurrentCard(newCard);

                        // Real-time copyright check
                        const check = checkContentLegality(value, newCard);
                        if (!check.isLegal) {
                          setCopyrightWarning(check.issues);
                        } else {
                          setCopyrightWarning(null);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>🖼️ Upload Artwork</h3>
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  id="card-image"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const copyrightCheck = checkCopyright('', file.name);
                      if (copyrightCheck.blocked) {
                        setCopyrightWarning(copyrightCheck.reason);
                        e.target.value = '';
                        return;
                      }
                      // Process image upload here
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newCard = { ...currentCard };
                        newCard.frontDesign.image = event.target.result;
                        setCurrentCard(newCard);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="card-image" className="upload-btn">
                  ☁️ Upload Front Image
                </label>
                <p className="upload-hint">300 DPI recommended • Must be original artwork</p>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>✅ Copyright Verification</h3>
              <div className="copyright-check">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentCard?.originalWork || false}
                    onChange={(e) => {
                      const newCard = { ...currentCard };
                      newCard.originalWork = e.target.checked;
                      setCurrentCard(newCard);
                    }}
                  />
                  <span style={{ color: '#fff', fontSize: '0.95rem' }}>
                    I certify this is 100% my original work and does not infringe on any copyrights or trademarks
                  </span>
                </label>
                {!currentCard?.originalWork && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    ⚠️ Required before printing/selling cards
                  </p>
                )}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>🔄 Card Back Design</h3>
              <div className="upload-area">
                <input type="file" accept="image/*" id="card-back" style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const newCard = { ...currentCard };
                        newCard.backDesign.logo = event.target.result;
                        setCurrentCard(newCard);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="card-back" className="upload-btn">
                  ☁️ Upload Back Design
                </label>
                <p className="upload-hint">Custom artwork or pattern</p>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={currentCard.backDesign.background}
                  onChange={(e) => {
                    const newCard = { ...currentCard };
                    newCard.backDesign.background = e.target.value;
                    setCurrentCard(newCard);
                  }}
                  style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="sidebar-section">
              <h3>✅ Copyright Verification</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentCard.originalWork}
                  onChange={(e) => setCurrentCard({ ...currentCard, originalWork: e.target.checked })}
                />
                <span>I certify this is 100% original content</span>
              </label>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                No Pokémon, Yu-Gi-Oh!, MTG, or copyrighted characters
              </p>
              <button
                className="btn-secondary"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={async () => {
                  const result = await verifyCopyright(currentCard);
                  if (result.verified) {
                    setCurrentCard({ ...currentCard, copyrightVerified: true });
                    alert('✅ ' + result.reason);
                  } else {
                    alert('❌ ' + result.reason);
                  }
                }}
              >
                🔍 Verify Content
              </button>
              {currentCard.copyrightVerified && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  ✅ Verified Original Content
                </div>
              )}
            </div>

            <div className="sidebar-actions">
              <button className="btn-secondary" onClick={() => setCurrentCard(null)}>
                ← Back to Templates
              </button>
              <button
                className="btn-primary"
                disabled={!currentCard.originalWork || !currentCard.copyrightVerified || copyrightWarning !== null}
                style={{
                  opacity: (!currentCard.originalWork || !currentCard.copyrightVerified || copyrightWarning !== null) ? 0.5 : 1,
                  cursor: (!currentCard.originalWork || !currentCard.copyrightVerified || copyrightWarning !== null) ? 'not-allowed' : 'pointer'
                }}
                onClick={() => {
                  if (!termsAccepted) {
                    setShowTermsModal(true);
                  } else {
                    // Save card logic
                    setCards([...cards, { ...currentCard, id: Date.now() }]);
                    setCurrentCard(null);
                  }
                }}
              >
                💾 Save Card
              </button>
            </div>
          </div>

          <div className="card-preview-area">
            <div className="preview-tabs">
              <button
                className={`preview-tab ${currentCard.viewSide === 'front' ? 'active' : ''}`}
                onClick={() => setCurrentCard({ ...currentCard, viewSide: 'front' })}
              >
                Front
              </button>
              <button
                className={`preview-tab ${currentCard.viewSide === 'back' ? 'active' : ''}`}
                onClick={() => setCurrentCard({ ...currentCard, viewSide: 'back' })}
              >
                Back
              </button>
            </div>

            {currentCard.viewSide !== 'back' ? (
              <div
                className="card-canvas"
                style={{
                  width: CARD_SIZES[currentCard.size].width,
                  height: CARD_SIZES[currentCard.size].height,
                  background: currentCard.frontDesign.background,
                  position: 'relative',
                  border: `3px solid ${RARITY_TIERS.find(t => t.value === currentCard.rarity)?.color}`,
                  boxShadow: currentCard.finish === 'holographic'
                    ? '0 0 30px rgba(139, 92, 246, 0.6)'
                    : '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div className="card-template-overlay">
                  <div className="card-name">{currentCard.frontDesign.elements.name || 'Card Name'}</div>
                  <div className="card-image-slot">
                    {currentCard.frontDesign.image ? (
                      <img src={currentCard.frontDesign.image} alt="Card art" />
                    ) : (
                      <div className="image-placeholder">
                        <span>🖼️</span>
                        <span>Upload Image</span>
                      </div>
                    )}
                  </div>
                  <div className="card-details">
                    {Object.entries(currentCard.frontDesign.elements).map(([key, value]) => (
                      key !== 'name' && value && (
                        <div key={key} className="card-detail-item">
                          <strong>{key}:</strong> {value}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="card-canvas"
                style={{
                  width: CARD_SIZES[currentCard.size].width,
                  height: CARD_SIZES[currentCard.size].height,
                  background: currentCard.backDesign.background,
                  position: 'relative',
                  border: `3px solid ${RARITY_TIERS.find(t => t.value === currentCard.rarity)?.color}`,
                  boxShadow: currentCard.finish === 'holographic'
                    ? '0 0 30px rgba(139, 92, 246, 0.6)'
                    : '0 8px 24px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {currentCard.backDesign.customArt ? (
                  <img
                    src={currentCard.backDesign.customArt}
                    alt="Card back"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '2rem'
                  }}>
                    <div style={{
                      width: '60%',
                      height: '60%',
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 700,
                      background: 'rgba(0, 0, 0, 0.2)'
                    }}>
                      {currentCard.frontDesign.elements.name || 'Your Brand'}
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                      Trading Card Game
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="preview-info">
              <p><strong>Template:</strong> {TEMPLATES[currentCard.template].name}</p>
              <p><strong>Size:</strong> {CARD_SIZES[currentCard.size].name}</p>
              <p><strong>Finish:</strong> {FINISHES.find(f => f.value === currentCard.finish)?.label}</p>
              <p><strong>Rarity:</strong> {RARITY_TIERS.find(t => t.value === currentCard.rarity)?.label}</p>
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className="saved-cards">
          <h2>Your Cards ({cards.length})</h2>
          <div className="cards-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className="saved-card-thumb"
                onClick={() => setCurrentCard(card)}
              >
                <div className="thumb-preview" style={{ borderColor: RARITY_TIERS.find(t => t.value === card.rarity)?.color }}>
                  {card.frontDesign.elements.name || 'Untitled Card'}
                </div>
                <span className="thumb-info">
                  {TEMPLATES[card.template].icon} {TEMPLATES[card.template].name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copyright Warning Modal */}
      {copyrightWarning && copyrightWarning.length > 0 && (
        <div className="modal-overlay" onClick={() => setCopyrightWarning(null)}>
          <div className="modal-content copyright-warning-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Copyright Violation Detected
            </h2>
            <div className="warning-issues">
              {copyrightWarning.map((issue, idx) => (
                <div key={idx} className={`warning-issue ${issue.severity}`} style={{
                  background: issue.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  border: `1px solid ${issue.severity === 'critical' ? '#ef4444' : '#fbbf24'}`,
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '0.75rem'
                }}>
                  <strong style={{ color: issue.severity === 'critical' ? '#ef4444' : '#fbbf24' }}>
                    {issue.type.toUpperCase()}:
                  </strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.5rem' }}>{issue.message}</p>
                </div>
              ))}
            </div>
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid #6366f1',
              padding: '1rem',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <p style={{ color: '#818cf8', fontSize: '0.9rem' }}>
                <strong>💡 Legal Notice:</strong> Using trademarked names or copyrighted characters violates intellectual property law and our Terms of Service. Create original content or obtain proper licensing.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setCopyrightWarning(null)}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-content terms-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#818cf8', marginBottom: '1rem' }}>📋 Print-on-Demand Terms of Service</h2>
            <div className="terms-content" style={{
              maxHeight: '400px',
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              {PRINT_ON_DEMAND_TERMS.sections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{section.title}</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
            <label className="checkbox-label" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid #6366f1',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 500 }}>
                I have read and agree to the Print-on-Demand Terms of Service. I certify all content is 100% original and I accept full legal responsibility.
              </span>
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowTermsModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!termsAccepted) {
                    alert('❌ You must accept the terms to continue');
                    return;
                  }
                  setShowTermsModal(false);
                  // Save card logic
                  setCards([...cards, { ...currentCard, id: Date.now() }]);
                  setCurrentCard(null);
                }}
                disabled={!termsAccepted}
                style={{
                  flex: 1,
                  opacity: termsAccepted ? 1 : 0.5,
                  cursor: termsAccepted ? 'pointer' : 'not-allowed'
                }}
              >
                Accept & Save Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
