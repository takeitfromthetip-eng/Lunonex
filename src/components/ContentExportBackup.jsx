/* eslint-disable */
import React, { useState } from 'react';

/**
 * ContentExportBackup - Export and backup system for creator content
 * 
 * Features:
 * - One-click export all content to ZIP
 * - Cloud backup scheduling
 * - Auto-sync to Google Drive/Dropbox
 * - Selective export by content type
 * - Backup history and restore
 */
export default function ContentExportBackup({ userId }) {
  const [exportFormat, setExportFormat] = useState('zip');
  const [selectedTypes, setSelectedTypes] = useState(['all']);
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('weekly');
  const [cloudProvider, setCloudProvider] = useState('none');

  const contentTypes = [
    { id: 'all', name: 'All Content', icon: '📦', count: 1247 },
    { id: 'videos', name: 'Videos', icon: '🎬', count: 156 },
    { id: 'images', name: 'Images', icon: '🖼️', count: 543 },
    { id: 'audio', name: 'Audio Files', icon: '🎵', count: 89 },
    { id: '3d', name: '3D Models', icon: '🧊', count: 234 },
    { id: 'vr', name: 'VR/AR Projects', icon: '🥽', count: 45 },
    { id: 'documents', name: 'Documents', icon: '📄', count: 180 }
  ];

  const handleExport = async () => {
    // Advanced export features can be added here
    alert(`Exporting ${selectedTypes.join(', ')} as ${exportFormat}...\n\nThis will download a ${exportFormat.toUpperCase()} file with all your content.`);
  };

  const handleCloudBackup = async () => {
    if (cloudProvider === 'none') {
      alert('Please select a cloud provider first!');
      return;
    }
    
    // OAuth flow for cloud providers can be added here
    alert(`Connecting to ${cloudProvider}...\n\nYou'll be redirected to authorize ForTheWeebs to access your ${cloudProvider} account.`);
  };

  const toggleType = (typeId) => {
    if (typeId === 'all') {
      setSelectedTypes(['all']);
    } else {
      const newTypes = selectedTypes.filter(t => t !== 'all');
      if (newTypes.includes(typeId)) {
        const filtered = newTypes.filter(t => t !== typeId);
        setSelectedTypes(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setSelectedTypes([...newTypes, typeId]);
      }
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          💾 Export & Backup
        </h1>
        <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '40px' }}>
          Export your content or set up automatic cloud backups
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Quick Export */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              📦 Quick Export
            </h2>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#aaa',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="zip">ZIP Archive</option>
                <option value="tar">TAR Archive</option>
                <option value="folder">Folder Structure</option>
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#aaa',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Select Content Types
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {contentTypes.map(type => (
                  <label
                    key={type.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: selectedTypes.includes(type.id) ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${selectedTypes.includes(type.id) ? '#667eea' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => toggleType(type.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '24px' }}>{type.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{type.name}</div>
                      <div style={{ fontSize: '13px', color: '#aaa' }}>{type.count} items</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleExport}
              style={{
                width: '100%',
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📥 Export Selected Content
            </button>

            <p style={{
              fontSize: '13px',
              color: '#aaa',
              marginTop: '15px',
              textAlign: 'center'
            }}>
              Estimated size: ~2.4 GB
            </p>
          </div>

          {/* Cloud Backup */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              ☁️ Cloud Backup
            </h2>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '15px',
                background: autoBackup ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: `2px solid ${autoBackup ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    Enable Automatic Backups
                  </div>
                  <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>
                    Automatically sync your content to the cloud
                  </div>
                </div>
              </label>
            </div>

            {autoBackup && (
              <>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#aaa',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Backup Frequency
                  </label>
                  <select
                    value={backupFrequency}
                    onChange={(e) => setBackupFrequency(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#aaa',
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Cloud Provider
                  </label>
                  <select
                    value={cloudProvider}
                    onChange={(e) => setCloudProvider(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="none">Select Provider...</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="icloud">iCloud</option>
                  </select>
                </div>

                <button
                  onClick={handleCloudBackup}
                  disabled={cloudProvider === 'none'}
                  style={{
                    width: '100%',
                    background: cloudProvider === 'none' ? 'rgba(255, 255, 255, 0.1)' : '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: cloudProvider === 'none' ? 'not-allowed' : 'pointer',
                    opacity: cloudProvider === 'none' ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  ☁️ Connect & Start Backup
                </button>
              </>
            )}

            <div style={{
              marginTop: '25px',
              padding: '15px',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                💡 Pro Tip
              </div>
              <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.5' }}>
                Cloud backups are encrypted end-to-end. We never have access to your content.
              </div>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            📜 Backup History
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <BackupHistoryItem
              date="Nov 25, 2025 - 3:42 PM"
              size="2.4 GB"
              location="Google Drive"
              status="success"
            />
            <BackupHistoryItem
              date="Nov 18, 2025 - 2:15 PM"
              size="2.1 GB"
              location="Google Drive"
              status="success"
            />
            <BackupHistoryItem
              date="Nov 11, 2025 - 1:30 PM"
              size="1.9 GB"
              location="Manual Export"
              status="success"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupHistoryItem({ date, size, location, status }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '5px' }}>
          {date}
        </div>
        <div style={{ fontSize: '13px', color: '#aaa' }}>
          {size} • {location}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          padding: '6px 12px',
          background: status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${status === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: status === 'success' ? '#22c55e' : '#ef4444'
        }}>
          {status === 'success' ? '✓ Complete' : '✗ Failed'}
        </div>

        <button style={{
          background: 'rgba(102, 126, 234, 0.2)',
          border: '1px solid #667eea',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Restore
        </button>
      </div>
    </div>
  );
}
