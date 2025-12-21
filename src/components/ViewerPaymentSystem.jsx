import React, { useState } from 'react';

/**
 * Viewer Payment System
 *
 * Payment Structure:
 * - Creators: Get adult access automatically (they're creating content)
 * - Viewers: $15/month for adult content access
 * - Per-Creator Fees: Viewers pay each creator's individual fee
 * - Exemptions: Owner + $1000 tier holders (100 people) get FREE access to everything
 */

export const ViewerPaymentSystem = ({ userId, userType, tier, subscriptions = [] }) => {
  const [activeTab, setActiveTab] = useState('adult-access');
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [processing, setProcessing] = useState(false);

  // Check if user is exempt from all payments
  const isExempt = userId === "owner" || tier === "SUPER_ADMIN" || tier === "super_admin";

  // Check if user has adult access
  const hasAdultAccess = userType === "creator" || isExempt || subscriptions.includes('adult-access');

  // Mock creator data - in production this comes from database
  const availableCreators = [
    { id: 'creator_1', name: 'Polotus Possumus', fee: 5.99, subscribers: 1234, rating: 4.8 },
    { id: 'creator_2', name: 'AnimeLord99', fee: 3.99, subscribers: 892, rating: 4.6 },
    { id: 'creator_3', name: 'WaifuArtist', fee: 7.99, subscribers: 2156, rating: 4.9 },
    { id: 'creator_4', name: 'EcchiKing', fee: 4.99, subscribers: 1567, rating: 4.7 },
  ];

  const handleSubscribeAdultAccess = async () => {
    setProcessing(true);
    // In production, this calls Stripe/PayPal API
    setTimeout(() => {
      alert('Adult Access subscription activated! $15/month');
      setProcessing(false);
    }, 2000);
  };

  const handleSubscribeToCreator = async (creator) => {
    if (isExempt) {
      alert(`You have FREE access to ${creator.name} as a $1000 tier holder!`);
      return;
    }

    setProcessing(true);
    // In production, this calls payment API
    setTimeout(() => {
      alert(`Subscribed to ${creator.name} for $${creator.fee}/month!`);
      setSelectedCreators(prev => [...prev, creator.id]);
      setProcessing(false);
    }, 2000);
  };

  const handleUnsubscribe = async (creatorId) => {
    setProcessing(true);
    setTimeout(() => {
      alert('Unsubscribed successfully');
      setSelectedCreators(prev => prev.filter(id => id !== creatorId));
      setProcessing(false);
    }, 1000);
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      borderRadius: '20px',
      color: '#fff',
      minHeight: '80vh'
    }}>
      {/* Exempt User Banner */}
      {isExempt && (
        <div style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          padding: '20px 40px',
          borderRadius: '15px',
          marginBottom: '30px',
          textAlign: 'center',
          color: '#000',
          fontWeight: '700',
          fontSize: '1.2rem',
          boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)'
        }}>
          👑 VIP ACCESS - You have FREE access to ALL content and ALL creators! 👑
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: '900',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {userType === 'creator' ? 'Creator Dashboard' : 'Viewer Subscriptions'}
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          {userType === 'creator'
            ? 'You have automatic adult access as a creator'
            : isExempt
              ? 'VIP access to all content and creators'
              : 'Subscribe to access adult content and your favorite creators'
          }
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('adult-access')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'adult-access' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            border: activeTab === 'adult-access' ? 'none' : '2px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔞 Adult Access
        </button>
        <button
          onClick={() => setActiveTab('creators')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'creators' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            border: activeTab === 'creators' ? 'none' : '2px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          👥 Creator Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'billing' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            border: activeTab === 'billing' ? 'none' : '2px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          💳 Billing
        </button>
      </div>

      {/* Adult Access Tab */}
      {activeTab === 'adult-access' && (
        <div>
          {/* Creator Auto-Access */}
          {userType === 'creator' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.2) 0%, rgba(32, 201, 151, 0.2) 100%)',
              border: '2px solid rgba(40, 167, 69, 0.5)',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Adult Access Active</h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                As a creator, you automatically have access to all adult content at no charge.
              </p>
            </div>
          )}

          {/* Exempt User Access */}
          {isExempt && userType !== 'creator' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👑</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>VIP Adult Access</h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                As a $1000 tier holder, you have FREE lifetime access to all adult content.
              </p>
            </div>
          )}

          {/* Viewer Payment Required */}
          {!isExempt && userType !== 'creator' && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              padding: '40px'
            }}>
              {hasAdultAccess ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.2) 0%, rgba(32, 201, 151, 0.2) 100%)',
                  border: '2px solid rgba(40, 167, 69, 0.5)',
                  borderRadius: '15px',
                  padding: '30px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✅</div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Adult Access Active</h3>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '20px' }}>
                    $15.00/month - Next billing date: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}
                  </p>
                  <button style={{
                    padding: '12px 30px',
                    background: 'rgba(255,0,0,0.2)',
                    border: '2px solid rgba(255,0,0,0.5)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '15px',
                    padding: '40px',
                    marginBottom: '30px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔞</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '15px' }}>
                      Adult Content Access
                    </h2>
                    <div style={{
                      fontSize: '3rem',
                      fontWeight: '900',
                      marginBottom: '10px',
                      color: '#FFD700'
                    }}>
                      $15/month
                    </div>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px' }}>
                      Unlock access to all adult-rated content across the platform
                    </p>
                    <button
                      onClick={handleSubscribeAdultAccess}
                      disabled={processing}
                      style={{
                        padding: '20px 60px',
                        background: processing ? '#666' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        color: '#fff',
                        fontSize: '1.3rem',
                        fontWeight: '900',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        boxShadow: '0 6px 20px rgba(240, 147, 251, 0.5)'
                      }}
                    >
                      {processing ? 'Processing...' : 'Subscribe Now'}
                    </button>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '15px',
                    padding: '30px'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>What's Included:</h3>
                    <ul style={{ fontSize: '1.1rem', lineHeight: '2', paddingLeft: '20px' }}>
                      <li>✅ Access to all adult-rated content</li>
                      <li>✅ No content restrictions or blurring</li>
                      <li>✅ HD quality streaming</li>
                      <li>✅ Cancel anytime, no commitment</li>
                      <li>✅ Separate from per-creator fees</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Creators Tab */}
      {activeTab === 'creators' && (
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>
            Available Creators
          </h2>

          {isExempt && (
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'center',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              👑 You have FREE access to all creators as a VIP member!
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {availableCreators.map(creator => {
              const isSubscribed = selectedCreators.includes(creator.id) || isExempt;

              return (
                <div
                  key={creator.id}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '15px',
                    padding: '30px',
                    border: isSubscribed ? '2px solid #28a745' : '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                  }}>
                    👤
                  </div>

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', textAlign: 'center' }}>
                    {creator.name}
                  </h3>

                  <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FFD700' }}>
                      {isExempt ? 'FREE' : `$${creator.fee}/mo`}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    <span>⭐ {creator.rating}</span>
                    <span>👥 {creator.subscribers.toLocaleString()}</span>
                  </div>

                  {isSubscribed ? (
                    <div>
                      <div style={{
                        background: 'rgba(40, 167, 69, 0.2)',
                        border: '2px solid rgba(40, 167, 69, 0.5)',
                        borderRadius: '10px',
                        padding: '12px',
                        textAlign: 'center',
                        marginBottom: '10px',
                        fontWeight: '600',
                        color: '#28a745'
                      }}>
                        ✅ {isExempt ? 'VIP Access' : 'Subscribed'}
                      </div>
                      {!isExempt && (
                        <button
                          onClick={() => handleUnsubscribe(creator.id)}
                          disabled={processing}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,0,0,0.2)',
                            border: '2px solid rgba(255,0,0,0.5)',
                            borderRadius: '10px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: processing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Unsubscribe
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribeToCreator(creator)}
                      disabled={processing}
                      style={{
                        width: '100%',
                        padding: '15px',
                        background: processing ? '#666' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: processing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Subscribe
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '40px'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Billing Summary</h2>

          {isExempt ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              borderRadius: '15px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👑</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>VIP Status</h3>
              <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                You have FREE lifetime access to all content and creators as a $1000 tier holder.
              </p>
              <div style={{
                marginTop: '30px',
                fontSize: '3rem',
                fontWeight: '900',
                color: '#FFD700'
              }}>
                $0.00/month
              </div>
            </div>
          ) : (
            <div>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '10px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Current Subscriptions:</h3>

                {hasAdultAccess && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '15px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}>
                    <span>🔞 Adult Content Access</span>
                    <span style={{ fontWeight: '700' }}>$15.00/mo</span>
                  </div>
                )}

                {selectedCreators.map(creatorId => {
                  const creator = availableCreators.find(c => c.id === creatorId);
                  return creator ? (
                    <div
                      key={creatorId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '15px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      <span>👤 {creator.name}</span>
                      <span style={{ fontWeight: '700' }}>${creator.fee}/mo</span>
                    </div>
                  ) : null;
                })}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                padding: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>Total Monthly:</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFD700' }}>
                  ${(hasAdultAccess ? 15 : 0) + selectedCreators.reduce((sum, id) => {
                    const creator = availableCreators.find(c => c.id === id);
                    return sum + (creator?.fee || 0);
                  }, 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
