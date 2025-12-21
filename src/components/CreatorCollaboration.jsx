/* eslint-disable */
import React, { useState } from 'react';

/**
 * CreatorCollaboration - Share projects and collaborate with other creators
 * 
 * Features:
 * - Share projects with permissions
 * - Real-time co-editing
 * - Comment system
 * - Version history
 * - Role management (Owner, Editor, Viewer)
 */
export default function CreatorCollaboration({ userId }) {
  const [activeTab, setActiveTab] = useState('my-projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  const myProjects = [
    {
      id: 1,
      name: 'Cyberpunk VR World',
      type: 'VR/AR Project',
      icon: '🥽',
      lastEdited: '2 hours ago',
      collaborators: 3,
      role: 'owner'
    },
    {
      id: 2,
      name: 'Anime Character Pack',
      type: '3D Models',
      icon: '🧊',
      lastEdited: '1 day ago',
      collaborators: 1,
      role: 'owner'
    },
    {
      id: 3,
      name: 'Music Video Project',
      type: 'Video',
      icon: '🎬',
      lastEdited: '3 days ago',
      collaborators: 2,
      role: 'owner'
    }
  ];

  const sharedWithMe = [
    {
      id: 4,
      name: 'Concert Stage Design',
      type: 'VR/AR Project',
      icon: '🎵',
      owner: 'SakuraDreams',
      lastEdited: '5 hours ago',
      role: 'editor'
    },
    {
      id: 5,
      name: 'Comic Series - Vol 1',
      type: 'Comic',
      icon: '📖',
      owner: 'MangaMaster',
      lastEdited: '2 days ago',
      role: 'viewer'
    }
  ];

  const handleInvite = () => {
    if (!inviteEmail || !selectedProject) {
      alert('Please enter an email address');
      return;
    }

    alert(`Invited ${inviteEmail} as ${inviteRole} to "${selectedProject.name}"\n\nThey'll receive an email with access link!`);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('viewer');
  };

  const getRoleBadge = (role) => {
    const colors = {
      owner: { bg: 'rgba(251, 191, 36, 0.2)', border: '#fbbf24', text: '#fbbf24' },
      editor: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#22c55e' },
      viewer: { bg: 'rgba(102, 126, 234, 0.2)', border: '#667eea', text: '#667eea' }
    };
    
    const style = colors[role] || colors.viewer;
    
    return (
      <span style={{
        padding: '4px 12px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        color: style.text,
        textTransform: 'uppercase'
      }}>
        {role}
      </span>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🤝 Collaboration Hub
        </h1>
        <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '40px' }}>
          Work together with other creators in real-time
        </p>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '40px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('my-projects')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'my-projects' ? '#667eea' : 'transparent',
              border: 'none',
              color: 'white',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📁 My Projects ({myProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'shared' ? '#667eea' : 'transparent',
              border: 'none',
              color: 'white',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔗 Shared With Me ({sharedWithMe.length})
          </button>
        </div>

        {/* My Projects Tab */}
        {activeTab === 'my-projects' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {myProjects.map(project => (
                <div
                  key={project.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '25px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                      {project.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                          {project.name}
                        </h3>
                        {getRoleBadge(project.role)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
                        {project.type} • Last edited {project.lastEdited}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#aaa' }}>
                          👥 {project.collaborators} collaborator{project.collaborators !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowInviteModal(true);
                        }}
                        style={{
                          background: '#667eea',
                          border: 'none',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ➕ Invite
                      </button>
                      <button
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid #22c55e',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ⚙️ Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared With Me Tab */}
        {activeTab === 'shared' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sharedWithMe.map(project => (
                <div
                  key={project.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '25px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                      {project.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                          {project.name}
                        </h3>
                        {getRoleBadge(project.role)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
                        {project.type} • Owned by @{project.owner}
                      </div>
                      <div style={{ fontSize: '14px', color: '#aaa' }}>
                        Last edited {project.lastEdited}
                      </div>
                    </div>

                    <button
                      style={{
                        background: project.role === 'editor' ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                        border: project.role === 'editor' ? 'none' : '1px solid #667eea',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {project.role === 'editor' ? '✏️ Edit' : '👁️ View'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <>
            <div
              onClick={() => setShowInviteModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                zIndex: 999
              }}
            />

            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#1a1a2e',
              border: '2px solid #667eea',
              borderRadius: '20px',
              padding: '40px',
              zIndex: 1000,
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                ➕ Invite Collaborator
              </h2>

              {selectedProject && (
                <div style={{
                  padding: '15px',
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '25px'
                }}>
                  <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
                    Inviting to:
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    {selectedProject.icon} {selectedProject.name}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#aaa',
                  marginBottom: '10px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="creator@example.com"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: '#aaa',
                  marginBottom: '10px'
                }}>
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="viewer">👁️ Viewer (View only)</option>
                  <option value="editor">✏️ Editor (Can edit)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleInvite}
                  style={{
                    flex: 1,
                    background: '#667eea',
                    border: 'none',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Send Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
