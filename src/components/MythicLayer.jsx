/* eslint-disable */
import React, { useState, useEffect } from 'react';

/**
 * MYTHIC LAYER - Sovereignty & Ritual Features
 * Makes ForTheWeebs feel like a sacred creative space, not just a tool
 * Philosophy: Every creative act becomes a legacy artifact
 */
export default function MythicLayer({ userId, creatorName }) {
  const [activeRitual, setActiveRitual] = useState('showcase');
  const [avatar, setAvatar] = useState(null);
  const [creationCount, setCreationCount] = useState(0);

  useEffect(() => {
    // Load creator's mythic data
    loadMythicData();
  }, [userId]);

  const loadMythicData = async () => {
    // In production, load from database
    setCreationCount(0);
    setAvatar(generateMythicAvatar(creationCount));
  };

  const generateMythicAvatar = (count) => {
    const tiers = [
      { threshold: 0, rank: 'Initiate', icon: '🌱', color: '#4CAF50' },
      { threshold: 50, rank: 'Artisan', icon: '🎨', color: '#2196F3' },
      { threshold: 100, rank: 'Adept', icon: '⚡', color: '#9C27B0' },
      { threshold: 250, rank: 'Master', icon: '🔥', color: '#FF5722' },
      { threshold: 500, rank: 'Legend', icon: '👑', color: '#FFD700' },
      { threshold: 1000, rank: 'Mythic', icon: '🌟', color: '#E91E63' }
    ];

    const tier = [...tiers].reverse().find(t => count >= t.threshold) || tiers[0];
    return tier;
  };

  const rituals = [
    { id: 'showcase', icon: '🏛️', name: 'Artifact Showcase', desc: 'Immortalize your best work' },
    { id: 'duels', icon: '⚔️', name: 'Creator Duels', desc: 'Challenge other creators' },
    { id: 'avatar', icon: '🎭', name: 'Mythic Avatar', desc: 'Your evolving persona' },
    { id: 'legacy', icon: '🛡️', name: 'Legacy Vault', desc: 'Seal works as artifacts' },
    { id: 'contracts', icon: '📜', name: 'Creator Contracts', desc: 'Smart licensing' },
    { id: 'sovereignty', icon: '👁️', name: 'Sovereignty Console', desc: 'Full audit trail' }
  ];

  return (
    <div style={{
      padding: '40px',
      color: 'white',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* Mythic Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px',
        border: '3px solid rgba(255,215,0,0.5)',
        boxShadow: '0 0 40px rgba(102,126,234,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
            {/* Mythic Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${avatar?.color || '#666'} 0%, ${avatar?.color || '#888'} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '60px',
              border: '4px solid rgba(255,215,0,0.8)',
              boxShadow: `0 0 30px ${avatar?.color || '#666'}`,
              position: 'relative'
            }}>
              {avatar?.icon || '🌱'}
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                background: 'rgba(0,0,0,0.9)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '2px solid ' + (avatar?.color || '#666')
              }}>
                {avatar?.rank || 'Initiate'}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                {creatorName || 'Creator'}'s Mythic Realm
              </h1>
              <p style={{ fontSize: '20px', opacity: 0.9, margin: 0 }}>
                {creationCount} Artifacts Created • {avatar?.rank || 'Initiate'} Rank
              </p>
              <div style={{
                marginTop: '15px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1, height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min((creationCount % 250) / 250 * 100, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                    transition: 'width 0.5s'
                  }} />
                </div>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {250 - (creationCount % 250)} to next rank
                </span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            marginTop: '30px'
          }}>
            {['🎨 Total Artifacts', '⚡ Weekly Streak', '🔥 Epic Creations', '👥 Collaborations'].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '15px 25px',
                borderRadius: '15px',
                textAlign: 'center',
                flex: 1
              }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                  {[creationCount, 0, 0, 0][i]}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{stat}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ritual Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {rituals.map(ritual => (
          <div
            key={ritual.id}
            onClick={() => setActiveRitual(ritual.id)}
            style={{
              background: activeRitual === ritual.id
                ? 'linear-gradient(135deg, rgba(102,126,234,0.4) 0%, rgba(118,75,162,0.4) 100%)'
                : 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              padding: '25px',
              cursor: 'pointer',
              border: activeRitual === ritual.id ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>{ritual.icon}</div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{ritual.name}</h3>
            <p style={{ fontSize: '13px', opacity: 0.7, margin: 0 }}>{ritual.desc}</p>
          </div>
        ))}
      </div>

      {/* Ritual Content */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {activeRitual === 'showcase' && <ArtifactShowcase userId={userId} />}
        {activeRitual === 'duels' && <CreatorDuels userId={userId} />}
        {activeRitual === 'avatar' && <MythicAvatarStudio avatar={avatar} creationCount={creationCount} />}
        {activeRitual === 'legacy' && <LegacyVault userId={userId} />}
        {activeRitual === 'contracts' && <CreatorContracts userId={userId} />}
        {activeRitual === 'sovereignty' && <SovereigntyConsole userId={userId} />}
      </div>
    </div>
  );
}

// Artifact Showcase - Immortalize best work with full creative lineage
function ArtifactShowcase({ userId }) {
  const [artifacts, setArtifacts] = useState([
    { id: 1, title: 'Cyberpunk Sunset', type: 'image', versions: 23, views: 1543, legacy: true },
    { id: 2, title: 'Neon Dreams', type: 'video', versions: 15, views: 892, legacy: false },
    { id: 3, title: 'Synthwave Beat', type: 'audio', versions: 31, views: 2105, legacy: true }
  ]);

  return (
    <div>
      <h2 style={{ fontSize: '36px', marginBottom: '20px', textAlign: 'center' }}>
        🏛️ Artifact Showcase
      </h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '40px' }}>
        Your immortalized works with full creative lineage. Viewers see every version, edit, and checkpoint.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {artifacts.map(artifact => (
          <div key={artifact.id} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '20px',
            border: artifact.legacy ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            {artifact.legacy && (
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#FFD700',
                color: '#000',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                🛡️ LEGACY
              </div>
            )}
            
            <div style={{
              width: '100%',
              height: '180px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px'
            }}>
              {artifact.type === 'image' ? '🖼️' : artifact.type === 'video' ? '🎬' : '🎵'}
            </div>

            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{artifact.title}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.7 }}>
              <span>📝 {artifact.versions} versions</span>
              <span>👁️ {artifact.views.toLocaleString()} views</span>
            </div>

            <button style={{
              marginTop: '15px',
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              View Lineage →
            </button>
          </div>
        ))}
      </div>

      <button style={{
        marginTop: '40px',
        padding: '15px 40px',
        background: '#FFD700',
        color: '#000',
        border: 'none',
        borderRadius: '30px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'block',
        margin: '40px auto 0'
      }}>
        + Immortalize New Artifact
      </button>
    </div>
  );
}

// Creator Duels - Challenge other creators
function CreatorDuels({ userId }) {
  const [activeDuels, setActiveDuels] = useState([
    { id: 1, challenger: 'ArtisanX', theme: 'Cyberpunk City', votes: 234, timeLeft: '2d 5h' },
    { id: 2, challenger: 'PixelMage', theme: 'Sakura Dreams', votes: 189, timeLeft: '1d 12h' }
  ]);

  return (
    <div>
      <h2 style={{ fontSize: '36px', marginBottom: '20px', textAlign: 'center' }}>
        ⚔️ Creator Duels
      </h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '40px' }}>
        Challenge other creators to transform the same base asset. Community votes decide the winner.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(244,67,54,0.2) 0%, rgba(233,30,99,0.2) 100%)',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center',
          border: '2px solid #F44336'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>⚔️</div>
          <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Create Duel</h3>
          <p style={{ opacity: 0.8, marginBottom: '20px' }}>Challenge another creator</p>
          <button style={{
            padding: '12px 30px',
            background: '#F44336',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            New Challenge
          </button>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(139,195,74,0.2) 100%)',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center',
          border: '2px solid #4CAF50'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>👥</div>
          <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Join Duel</h3>
          <p style={{ opacity: 0.8, marginBottom: '20px' }}>Accept incoming challenges</p>
          <button style={{
            padding: '12px 30px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: '25px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            View Challenges
          </button>
        </div>
      </div>

      <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Active Duels</h3>
      {activeDuels.map(duel => (
        <div key={duel.id} style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>vs {duel.challenger}</h4>
            <p style={{ opacity: 0.7, margin: 0 }}>Theme: {duel.theme}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD700' }}>
              {duel.votes} votes
            </div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>⏰ {duel.timeLeft}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mythic Avatar Studio
function MythicAvatarStudio({ avatar, creationCount }) {
  return (
    <div>
      <h2 style={{ fontSize: '36px', marginBottom: '20px', textAlign: 'center' }}>
        🎭 Mythic Avatar
      </h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '40px' }}>
        Your avatar evolves as you create more. It's your visual legacy growing with you.
      </p>

      <div style={{
        display: 'flex',
        gap: '40px',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        <div style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${avatar?.color} 0%, ${avatar?.color} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '100px',
          border: '6px solid rgba(255,215,0,0.8)',
          boxShadow: `0 0 60px ${avatar?.color}`,
          position: 'relative'
        }}>
          {avatar?.icon}
        </div>

        <div>
          <h3 style={{ fontSize: '48px', marginBottom: '10px', color: avatar?.color }}>
            {avatar?.rank}
          </h3>
          <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '20px' }}>
            {creationCount} Total Creations
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '15px'
          }}>
            <h4 style={{ marginBottom: '15px' }}>Evolution Perks:</h4>
            <ul style={{ paddingLeft: '20px', opacity: 0.9 }}>
              <li>Unique signature animation</li>
              <li>Custom intro sequence</li>
              <li>Mythic border effects</li>
              <li>Priority showcase placement</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,215,0,0.1)',
        border: '2px solid #FFD700',
        borderRadius: '15px',
        padding: '25px',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '20px', marginBottom: '10px', color: '#FFD700' }}>
          Next Rank: {avatar?.rank === 'Mythic' ? 'MAX RANK' : 'Master'}
        </h4>
        <p style={{ opacity: 0.8 }}>
          Create {250 - (creationCount % 250)} more artifacts to evolve your avatar
        </p>
      </div>
    </div>
  );
}

// Legacy Vault - Seal projects as immortalized artifacts
function LegacyVault({ userId }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>
        🛡️ Legacy Vault
      </h2>
      <p style={{ opacity: 0.8, marginBottom: '40px' }}>
        Seal projects as legacy artifacts - they become read-only and immortalized forever.
      </p>

      <div style={{ fontSize: '100px', marginBottom: '30px' }}>🏛️</div>

      <div style={{
        background: 'rgba(255,215,0,0.1)',
        border: '2px solid #FFD700',
        borderRadius: '15px',
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto 30px'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#FFD700' }}>
          What is Legacy Mode?
        </h3>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', opacity: 0.9, lineHeight: '1.8' }}>
          <li>Makes project read-only (cannot be edited)</li>
          <li>Timestamped on blockchain for authenticity</li>
          <li>Featured in public Legacy Gallery</li>
          <li>Full version history preserved</li>
          <li>Becomes part of your permanent portfolio</li>
        </ul>
      </div>

      <button style={{
        padding: '15px 40px',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        border: 'none',
        borderRadius: '30px',
        color: '#000',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        🛡️ Seal as Legacy Artifact
      </button>
    </div>
  );
}

// Creator Contracts - Smart licensing
function CreatorContracts({ userId }) {
  return (
    <div>
      <h2 style={{ fontSize: '36px', marginBottom: '20px', textAlign: 'center' }}>
        📜 Creator Contracts
      </h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '40px' }}>
        Smart contracts baked into uploads. Define usage rights, licensing, and royalties.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {[
          { name: 'Personal Use', desc: 'Free for personal projects', price: '$0' },
          { name: 'Commercial', desc: 'Business usage allowed', price: '$50' },
          { name: 'Resale Rights', desc: 'Can resell derivative works', price: '$200' },
          { name: 'Exclusive', desc: 'Sole ownership transfer', price: '$1000+' }
        ].map((license, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '20px', marginBottom: '10px' }}>{license.name}</h4>
            <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '15px' }}>{license.desc}</p>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>
              {license.price}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(33,150,243,0.1)',
        border: '2px solid #2196F3',
        borderRadius: '15px',
        padding: '30px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#2196F3' }}>
          💡 Smart Contract Features
        </h3>
        <ul style={{ paddingLeft: '20px', opacity: 0.9, lineHeight: '1.8' }}>
          <li>Automatic royalty distribution (you set %)</li>
          <li>Usage tracking (who, when, where)</li>
          <li>Auto-revoke if terms violated</li>
          <li>Multi-chain support (Ethereum, Polygon, Solana)</li>
          <li>Built-in dispute resolution</li>
        </ul>
      </div>
    </div>
  );
}

// Sovereignty Console - Full audit trail
function SovereigntyConsole({ userId }) {
  const [auditLog, setAuditLog] = useState([
    { id: 1, action: 'Video Export', file: 'cyberpunk_edit.mp4', timestamp: '2 mins ago', status: 'success' },
    { id: 2, action: 'AI Upscale', file: 'portrait.jpg', timestamp: '15 mins ago', status: 'success' },
    { id: 3, action: 'Cloud Sync', file: 'project_data', timestamp: '1 hour ago', status: 'synced' },
    { id: 4, action: 'Batch Process', file: '47 images', timestamp: '3 hours ago', status: 'success' }
  ]);

  return (
    <div>
      <h2 style={{ fontSize: '36px', marginBottom: '20px', textAlign: 'center' }}>
        👁️ Sovereignty Console
      </h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '40px' }}>
        Every creative action timestamped and stored. Full transparency. You are sovereign.
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Immutable Audit Trail</h3>
        
        {auditLog.map(log => (
          <div key={log.id} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: '4px solid #4CAF50'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                {log.action}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>
                {log.file}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                background: log.status === 'success' ? 'rgba(76,175,80,0.2)' : 'rgba(33,150,243,0.2)',
                color: log.status === 'success' ? '#4CAF50' : '#2196F3',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {log.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>{log.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        {[
          { title: 'Total Actions', value: '1,247', icon: '⚡' },
          { title: 'Cloud Synced', value: '98.5%', icon: '☁️' },
          { title: 'Data Sovereignty', value: '100%', icon: '🛡️' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>{stat.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
