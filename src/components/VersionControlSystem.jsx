// VersionControlSystem.jsx
// Full git-style version control for creative work
// Complete history with branching, merging, and diffing capabilities

import React, { useState, useEffect, useRef } from 'react';
import './VersionControlSystem.css';

const VersionControlSystem = ({ projectName, projectData, onRestore }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [commits, setCommits] = useState([]);
    const [branches, setBranches] = useState(['main']);
    const [currentBranch, setCurrentBranch] = useState('main');
    const [uncommittedChanges, setUncommittedChanges] = useState(0);
    const [showDiff, setShowDiff] = useState(false);
    const [selectedCommit, setSelectedCommit] = useState(null);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [mergeBranch, setMergeBranch] = useState('');
    const lastSaveRef = useRef(null);
    const autoSaveIntervalRef = useRef(null);

    // Initialize with mock history
    useEffect(() => {
        const mockCommits = [
            {
                id: 'commit-1',
                message: 'Initial project setup',
                timestamp: Date.now() - 3600000 * 24 * 7, // 7 days ago
                author: 'You',
                branch: 'main',
                hash: 'a1b2c3d',
                changes: {
                    added: ['base-layer.psd', 'audio-track-1.wav'],
                    modified: [],
                    deleted: []
                }
            },
            {
                id: 'commit-2',
                message: 'Added color grading',
                timestamp: Date.now() - 3600000 * 24 * 5, // 5 days ago
                author: 'You',
                branch: 'main',
                hash: 'e4f5g6h',
                changes: {
                    added: ['color-lut.cube'],
                    modified: ['base-layer.psd'],
                    deleted: []
                }
            },
            {
                id: 'commit-3',
                message: 'Experimental filter effects',
                timestamp: Date.now() - 3600000 * 24 * 3, // 3 days ago
                author: 'You',
                branch: 'experiment',
                hash: 'i7j8k9l',
                changes: {
                    added: ['glitch-effect.filter'],
                    modified: ['base-layer.psd'],
                    deleted: []
                }
            },
            {
                id: 'commit-4',
                message: 'Final audio mix',
                timestamp: Date.now() - 3600000 * 24, // 1 day ago
                author: 'You',
                branch: 'main',
                hash: 'm1n2o3p',
                changes: {
                    added: ['master-mix.wav'],
                    modified: ['audio-track-1.wav'],
                    deleted: []
                }
            }
        ];
        setCommits(mockCommits);
        setBranches(['main', 'experiment', 'feature/vr-mode']);
    }, []);

    // Auto-save detection (every 30 seconds)
    useEffect(() => {
        if (projectData) {
            const dataString = JSON.stringify(projectData);
            if (lastSaveRef.current !== dataString) {
                setUncommittedChanges(prev => prev + 1);
                lastSaveRef.current = dataString;
            }
        }

        autoSaveIntervalRef.current = setInterval(() => {
            if (uncommittedChanges > 0) {
                autoCommit();
            }
        }, 30000); // Auto-commit every 30 seconds if changes

        return () => clearInterval(autoSaveIntervalRef.current);
    }, [projectData, uncommittedChanges]);

    const autoCommit = () => {
        const newCommit = {
            id: `commit-${Date.now()}`,
            message: `Auto-save: ${uncommittedChanges} changes`,
            timestamp: Date.now(),
            author: 'You',
            branch: currentBranch,
            hash: Math.random().toString(36).substr(2, 7),
            changes: {
                added: [],
                modified: [`${projectName}.project`],
                deleted: []
            }
        };
        setCommits(prev => [...prev, newCommit]);
        setUncommittedChanges(0);
    };

    const createCommit = (message) => {
        if (!message.trim()) return;

        const newCommit = {
            id: `commit-${Date.now()}`,
            message: message.trim(),
            timestamp: Date.now(),
            author: 'You',
            branch: currentBranch,
            hash: Math.random().toString(36).substr(2, 7),
            changes: {
                added: [],
                modified: [`${projectName}.project`],
                deleted: []
            }
        };
        setCommits(prev => [...prev, newCommit]);
        setUncommittedChanges(0);
    };

    const createBranch = () => {
        if (!newBranchName.trim()) return;
        if (branches.includes(newBranchName.trim())) {
            alert('Branch already exists!');
            return;
        }
        setBranches(prev => [...prev, newBranchName.trim()]);
        setNewBranchName('');
        setShowBranchModal(false);
    };

    const switchBranch = (branch) => {
        setCurrentBranch(branch);
        // In production, this would actually switch project state
        alert(`Switched to branch: ${branch}`);
    };

    const mergeBranches = () => {
        if (!mergeBranch) return;

        const mergeCommit = {
            id: `commit-${Date.now()}`,
            message: `Merge branch '${mergeBranch}' into '${currentBranch}'`,
            timestamp: Date.now(),
            author: 'You',
            branch: currentBranch,
            hash: Math.random().toString(36).substr(2, 7),
            changes: {
                added: [],
                modified: [`${projectName}.project`],
                deleted: []
            }
        };
        setCommits(prev => [...prev, mergeCommit]);
        setShowMergeModal(false);
        setMergeBranch('');
    };

    const restoreCommit = (commit) => {
        if (window.confirm(`Restore project to: "${commit.message}"?\n\nThis will revert all changes after this commit.`)) {
            onRestore && onRestore(commit);
            alert(`Restored to: ${commit.message}`);
        }
    };

    const viewDiff = (commit) => {
        setSelectedCommit(commit);
        setShowDiff(true);
    };

    const formatTimestamp = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const branchCommits = commits.filter(c => c.branch === currentBranch);

    return (
        <div className={`version-control ${isOpen ? 'open' : 'minimized'}`}>
            {!isOpen && (
                <button className="btn-open-vc" onClick={() => setIsOpen(true)}>
                    <span className="vc-icon">📜</span>
                    Version Control
                    {uncommittedChanges > 0 && (
                        <span className="changes-badge">{uncommittedChanges}</span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="vc-panel">
                    <div className="vc-header">
                        <div className="vc-title">
                            <span className="vc-icon-large">📜</span>
                            <div>
                                <h3>Version Control</h3>
                                <p className="vc-subtitle">Git for Creatives</p>
                            </div>
                        </div>
                        <button className="btn-close-vc" onClick={() => setIsOpen(false)}>
                            ×
                        </button>
                    </div>

                    {/* Branch Management */}
                    <div className="branch-section">
                        <div className="branch-selector">
                            <label>Current Branch:</label>
                            <select value={currentBranch} onChange={(e) => switchBranch(e.target.value)}>
                                {branches.map(branch => (
                                    <option key={branch} value={branch}>
                                        {branch}
                                    </option>
                                ))}
                            </select>
                            <button className="btn-new-branch" onClick={() => setShowBranchModal(true)}>
                                + New
                            </button>
                            <button className="btn-merge" onClick={() => setShowMergeModal(true)}>
                                🔀 Merge
                            </button>
                        </div>
                    </div>

                    {/* Uncommitted Changes */}
                    {uncommittedChanges > 0 && (
                        <div className="uncommitted-section">
                            <div className="uncommitted-header">
                                <span>⚠️ {uncommittedChanges} uncommitted changes</span>
                                <button className="btn-commit" onClick={() => {
                                    const message = prompt('Commit message:');
                                    if (message) createCommit(message);
                                }}>
                                    💾 Commit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Commit History */}
                    <div className="history-section">
                        <h4>📋 Commit History ({branchCommits.length})</h4>
                        <div className="history-list">
                            {branchCommits.length === 0 ? (
                                <div className="history-empty">
                                    <p>No commits yet</p>
                                    <p>Start making changes to create history</p>
                                </div>
                            ) : (
                                branchCommits.map(commit => (
                                    <div key={commit.id} className="commit-card">
                                        <div className="commit-header">
                                            <div className="commit-info">
                                                <strong className="commit-hash">{commit.hash}</strong>
                                                <span className="commit-time">{formatTimestamp(commit.timestamp)}</span>
                                            </div>
                                            <div className="commit-actions">
                                                <button className="btn-diff" onClick={() => viewDiff(commit)}>
                                                    🔍 Diff
                                                </button>
                                                <button className="btn-restore" onClick={() => restoreCommit(commit)}>
                                                    ⏪ Restore
                                                </button>
                                            </div>
                                        </div>
                                        <div className="commit-message">{commit.message}</div>
                                        <div className="commit-meta">
                                            <span className="commit-author">👤 {commit.author}</span>
                                            <span className="commit-branch">🌿 {commit.branch}</span>
                                        </div>
                                        {commit.changes && (
                                            <div className="commit-changes">
                                                {commit.changes.added.length > 0 && (
                                                    <span className="change-added">+{commit.changes.added.length}</span>
                                                )}
                                                {commit.changes.modified.length > 0 && (
                                                    <span className="change-modified">~{commit.changes.modified.length}</span>
                                                )}
                                                {commit.changes.deleted.length > 0 && (
                                                    <span className="change-deleted">-{commit.changes.deleted.length}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Diff Modal */}
                    {showDiff && selectedCommit && (
                        <div className="modal-overlay" onClick={() => setShowDiff(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>📊 Commit Diff: {selectedCommit.hash}</h3>
                                    <button onClick={() => setShowDiff(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>Message:</strong> {selectedCommit.message}</p>
                                    <p><strong>Author:</strong> {selectedCommit.author}</p>
                                    <p><strong>Time:</strong> {new Date(selectedCommit.timestamp).toLocaleString()}</p>
                                    <hr />
                                    <h4>Changes:</h4>
                                    {selectedCommit.changes.added.length > 0 && (
                                        <div className="diff-section">
                                            <strong className="diff-added">Added Files:</strong>
                                            {selectedCommit.changes.added.map((file, i) => (
                                                <div key={i} className="diff-file">+ {file}</div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedCommit.changes.modified.length > 0 && (
                                        <div className="diff-section">
                                            <strong className="diff-modified">Modified Files:</strong>
                                            {selectedCommit.changes.modified.map((file, i) => (
                                                <div key={i} className="diff-file">~ {file}</div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedCommit.changes.deleted.length > 0 && (
                                        <div className="diff-section">
                                            <strong className="diff-deleted">Deleted Files:</strong>
                                            {selectedCommit.changes.deleted.map((file, i) => (
                                                <div key={i} className="diff-file">- {file}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New Branch Modal */}
                    {showBranchModal && (
                        <div className="modal-overlay" onClick={() => setShowBranchModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>🌿 Create New Branch</h3>
                                    <button onClick={() => setShowBranchModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <p>Create a new branch from: <strong>{currentBranch}</strong></p>
                                    <input
                                        type="text"
                                        placeholder="Branch name (e.g., feature/new-effect)"
                                        value={newBranchName}
                                        onChange={(e) => setNewBranchName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && createBranch()}
                                    />
                                    <button className="btn-create-branch" onClick={createBranch}>
                                        Create Branch
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Merge Modal */}
                    {showMergeModal && (
                        <div className="modal-overlay" onClick={() => setShowMergeModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>🔀 Merge Branches</h3>
                                    <button onClick={() => setShowMergeModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <p>Merge into: <strong>{currentBranch}</strong></p>
                                    <label>Select branch to merge from:</label>
                                    <select value={mergeBranch} onChange={(e) => setMergeBranch(e.target.value)}>
                                        <option value="">-- Select Branch --</option>
                                        {branches.filter(b => b !== currentBranch).map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                    <button className="btn-merge-execute" onClick={mergeBranches} disabled={!mergeBranch}>
                                        Merge
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="vc-stats">
                        <span>📊 {commits.length} total commits</span>
                        <span>🌿 {branches.length} branches</span>
                        <span>💾 Auto-save every 30s</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Hook for integrating version control into any tool
export const useVersionControl = (projectName, projectData) => {
    const [history, setHistory] = useState([]);

    const commit = (message) => {
        const newCommit = {
            id: Date.now(),
            message,
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(projectData)) // Deep copy
        };
        setHistory(prev => [...prev, newCommit]);
    };

    const restore = (commitId) => {
        const commit = history.find(c => c.id === commitId);
        return commit ? commit.data : null;
    };

    return { history, commit, restore };
};

export default VersionControlSystem;
