/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './CloudRenderFarm.css';

const CloudRenderFarm = () => {
    const [activeJobs, setActiveJobs] = useState([]);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [queuedJobs, setQueuedJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [uploadProgress, setUploadProgress] = useState(null);
    const [accountBalance, setAccountBalance] = useState(25.00);
    const [renderSettings, setRenderSettings] = useState({
        quality: 'high',
        resolution: '1920x1080',
        fps: 30,
        format: 'mp4',
        priority: 'normal'
    });

    // Mock render jobs data
    const mockActiveJobs = [
        {
            id: 'job_4k_video_001',
            name: 'Epic Travel Montage - 4K Export',
            type: 'video',
            status: 'rendering',
            progress: 67,
            resolution: '3840x2160',
            fps: 60,
            duration: '5:23',
            estimatedTime: '12 minutes',
            remainingTime: '4 minutes',
            cost: 5.30,
            nodes: 4,
            startedAt: '2 hours ago',
            quality: 'ultra',
            format: 'mp4'
        },
        {
            id: 'job_vr_scene_002',
            name: 'VR Gallery Environment - High Quality',
            type: 'vr',
            status: 'rendering',
            progress: 34,
            resolution: '3664x1920',
            fps: 72,
            duration: 'N/A',
            estimatedTime: '45 minutes',
            remainingTime: '30 minutes',
            cost: 12.50,
            nodes: 8,
            startedAt: '15 minutes ago',
            quality: 'ultra',
            format: 'glb'
        }
    ];

    const mockCompletedJobs = [
        {
            id: 'job_podcast_003',
            name: 'Podcast Episode 47 - Audio Master',
            type: 'audio',
            status: 'completed',
            progress: 100,
            resolution: 'N/A',
            duration: '42:15',
            completedAt: '1 hour ago',
            renderTime: '3 minutes',
            cost: 0.30,
            quality: 'high',
            format: 'wav',
            downloadUrl: 'https://cdn.fortheweebs.com/renders/podcast_ep47.wav',
            size: '124 MB'
        },
        {
            id: 'job_logo_004',
            name: 'Brand Logo Animation - 4K',
            type: 'design',
            status: 'completed',
            progress: 100,
            resolution: '3840x2160',
            completedAt: '3 hours ago',
            renderTime: '8 minutes',
            cost: 0.80,
            quality: 'ultra',
            format: 'mp4',
            downloadUrl: 'https://cdn.fortheweebs.com/renders/logo_anim_4k.mp4',
            size: '89 MB'
        },
        {
            id: 'job_photos_005',
            name: 'Wedding Photos Batch - 100 images',
            type: 'photo',
            status: 'completed',
            progress: 100,
            resolution: '6000x4000',
            completedAt: '5 hours ago',
            renderTime: '15 minutes',
            cost: 1.50,
            quality: 'ultra',
            format: 'jpg',
            downloadUrl: 'https://cdn.fortheweebs.com/renders/wedding_batch.zip',
            size: '2.3 GB'
        }
    ];

    const mockQueuedJobs = [
        {
            id: 'job_queue_006',
            name: 'Music Video - Full HD',
            type: 'video',
            status: 'queued',
            resolution: '1920x1080',
            fps: 30,
            duration: '3:45',
            estimatedCost: 3.75,
            priority: 'normal',
            queuePosition: 3
        },
        {
            id: 'job_queue_007',
            name: 'Product Showcase - 360° Render',
            type: 'design',
            status: 'queued',
            resolution: '2048x2048',
            estimatedCost: 2.10,
            priority: 'low',
            queuePosition: 7
        }
    ];

    useEffect(() => {
        setActiveJobs(mockActiveJobs);
        setCompletedJobs(mockCompletedJobs);
        setQueuedJobs(mockQueuedJobs);
    }, []);

    const handleUploadProject = () => {
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        alert('✅ Project uploaded successfully!\n\nYour render has been added to the queue.\nEstimated start time: 2 minutes');
                        setUploadProgress(null);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const handleCancelJob = (jobId) => {
        if (window.confirm('Cancel this render job? You will be refunded 50% of the cost.')) {
            setActiveJobs(activeJobs.filter(job => job.id !== jobId));
            alert('🛑 Render job cancelled. Refund issued.');
        }
    };

    const handleDownload = (job) => {
        alert(`📥 Downloading: ${job.name}\n\nSize: ${job.size}\nFormat: ${job.format.toUpperCase()}\n\nYour download will start shortly...`);
    };

    const handlePriorityBoost = (jobId) => {
        if (window.confirm('Boost this job to priority queue?\n\nCost: +$2.00\nNew estimated time: 30 seconds')) {
            alert('⚡ Priority boost activated!\n\nYour job has been moved to the front of the queue.');
            setAccountBalance(accountBalance - 2.00);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'rendering': return '#3b82f6';
            case 'completed': return '#10b981';
            case 'queued': return '#f59e0b';
            case 'failed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'video': return '🎬';
            case 'photo': return '📸';
            case 'audio': return '🎵';
            case 'design': return '🎨';
            case 'vr': return '🥽';
            default: return '📁';
        }
    };

    const totalActiveRenderTime = activeJobs.reduce((sum, job) => sum + parseInt(job.remainingTime), 0);
    const totalActiveCost = activeJobs.reduce((sum, job) => sum + job.cost, 0);

    return (
        <div className="cloud-render-farm">
            <div className="render-header">
                <div className="header-content">
                    <h1>☁️ Cloud Render Farm</h1>
                    <p className="header-subtitle">Upload projects, render overnight, wake up to finished 4K videos</p>
                    <div className="pricing-info">
                        <span className="pricing-badge">💰 $0.10/minute • 10x faster than local</span>
                        <span className="pricing-badge">⚡ GPU cluster with 128 NVIDIA A100s</span>
                    </div>
                </div>

                <div className="account-info">
                    <div className="balance-card">
                        <span className="balance-label">Account Balance</span>
                        <span className="balance-amount">${accountBalance.toFixed(2)}</span>
                        <button className="btn-add-funds">+ Add Funds</button>
                    </div>
                </div>
            </div>

            <div className="render-tabs">
                <button
                    className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </button>
                <button
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Jobs ({activeJobs.length})
                </button>
                <button
                    className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed ({completedJobs.length})
                </button>
                <button
                    className={`tab ${activeTab === 'queued' ? 'active' : ''}`}
                    onClick={() => setActiveTab('queued')}
                >
                    Queue ({queuedJobs.length})
                </button>
                <button
                    className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    Pricing
                </button>
            </div>

            {activeTab === 'dashboard' && (
                <div className="dashboard-view">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">🚀</div>
                            <div className="stat-info">
                                <span className="stat-value">{activeJobs.length}</span>
                                <span className="stat-label">Active Renders</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <span className="stat-value">{completedJobs.length}</span>
                                <span className="stat-label">Completed This Week</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-info">
                                <span className="stat-value">156 hrs</span>
                                <span className="stat-label">Time Saved (vs Local)</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">💸</div>
                            <div className="stat-info">
                                <span className="stat-value">${totalActiveCost.toFixed(2)}</span>
                                <span className="stat-label">Current Render Cost</span>
                            </div>
                        </div>
                    </div>

                    <div className="upload-section">
                        <div className="upload-card">
                            <div className="upload-icon">☁️</div>
                            <h3>Upload New Render Job</h3>
                            <p>Drag & drop your project file or click to browse</p>

                            {uploadProgress === null ? (
                                <button className="btn-upload" onClick={handleUploadProject}>
                                    📤 Upload Project
                                </button>
                            ) : (
                                <div className="upload-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{uploadProgress}%</span>
                                </div>
                            )}

                            <div className="supported-formats">
                                <span>Supported: .ftw, .mp4, .mov, .psd, .ai, .blend, .fbx</span>
                            </div>
                        </div>

                        <div className="settings-card">
                            <h3>⚙️ Default Render Settings</h3>

                            <div className="setting-group">
                                <label>Quality</label>
                                <select
                                    value={renderSettings.quality}
                                    onChange={(e) => setRenderSettings({ ...renderSettings, quality: e.target.value })}
                                >
                                    <option value="draft">Draft (Fast)</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="ultra">Ultra (Slow)</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>Resolution</label>
                                <select
                                    value={renderSettings.resolution}
                                    onChange={(e) => setRenderSettings({ ...renderSettings, resolution: e.target.value })}
                                >
                                    <option value="1280x720">720p HD</option>
                                    <option value="1920x1080">1080p Full HD</option>
                                    <option value="2560x1440">1440p QHD</option>
                                    <option value="3840x2160">4K Ultra HD</option>
                                    <option value="7680x4320">8K</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>Frame Rate</label>
                                <select
                                    value={renderSettings.fps}
                                    onChange={(e) => setRenderSettings({ ...renderSettings, fps: parseInt(e.target.value) })}
                                >
                                    <option value="24">24 fps (Film)</option>
                                    <option value="30">30 fps</option>
                                    <option value="60">60 fps (Smooth)</option>
                                    <option value="120">120 fps (Ultra Smooth)</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label>Priority</label>
                                <select
                                    value={renderSettings.priority}
                                    onChange={(e) => setRenderSettings({ ...renderSettings, priority: e.target.value })}
                                >
                                    <option value="low">Low (Cheap)</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High (+$2/job)</option>
                                    <option value="urgent">Urgent (+$5/job)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="recent-section">
                        <h2>🔥 Active Render Jobs</h2>
                        {activeJobs.length === 0 ? (
                            <div className="empty-message">No active render jobs</div>
                        ) : (
                            <div className="jobs-list">
                                {activeJobs.map(job => (
                                    <div key={job.id} className="job-card active">
                                        <div className="job-icon">{getTypeIcon(job.type)}</div>
                                        <div className="job-info">
                                            <h4>{job.name}</h4>
                                            <div className="job-meta">
                                                <span>{job.resolution}</span>
                                                <span>{job.fps} fps</span>
                                                <span>{job.quality}</span>
                                                <span>{job.nodes} nodes</span>
                                            </div>
                                            <div className="job-progress-section">
                                                <div className="progress-bar-job">
                                                    <div
                                                        className="progress-fill-job"
                                                        style={{
                                                            width: `${job.progress}%`,
                                                            background: getStatusColor(job.status)
                                                        }}
                                                    />
                                                </div>
                                                <span className="progress-percentage">{job.progress}%</span>
                                            </div>
                                            <div className="job-time-info">
                                                <span>⏱️ {job.remainingTime} remaining</span>
                                                <span>💰 ${job.cost.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="job-actions">
                                            <button
                                                className="btn-cancel"
                                                onClick={() => handleCancelJob(job.id)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'active' && (
                <div className="jobs-view">
                    <div className="view-header">
                        <h2>🚀 Active Render Jobs</h2>
                        <span className="job-count">{activeJobs.length} rendering now</span>
                    </div>

                    {activeJobs.map(job => (
                        <div key={job.id} className="job-card-detailed">
                            <div className="job-card-header">
                                <div className="job-title-section">
                                    <span className="job-type-icon">{getTypeIcon(job.type)}</span>
                                    <h3>{job.name}</h3>
                                    <span className="status-badge rendering">Rendering</span>
                                </div>
                                <div className="job-cost-section">
                                    <span className="cost-label">Cost</span>
                                    <span className="cost-amount">${job.cost.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="job-card-body">
                                <div className="job-specs">
                                    <div className="spec-item">
                                        <span className="spec-label">Resolution</span>
                                        <span className="spec-value">{job.resolution}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Frame Rate</span>
                                        <span className="spec-value">{job.fps} fps</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Quality</span>
                                        <span className="spec-value">{job.quality}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Nodes</span>
                                        <span className="spec-value">{job.nodes} GPUs</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Started</span>
                                        <span className="spec-value">{job.startedAt}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Remaining</span>
                                        <span className="spec-value">{job.remainingTime}</span>
                                    </div>
                                </div>

                                <div className="job-progress-detailed">
                                    <div className="progress-header">
                                        <span>Progress</span>
                                        <span className="progress-percent-detailed">{job.progress}%</span>
                                    </div>
                                    <div className="progress-bar-detailed">
                                        <div
                                            className="progress-fill-detailed"
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    </div>
                                    <div className="progress-footer">
                                        <span>{job.remainingTime} remaining of {job.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="job-card-actions">
                                <button
                                    className="btn-action-secondary"
                                    onClick={() => handleCancelJob(job.id)}
                                >
                                    🛑 Cancel Job
                                </button>
                                <button
                                    className="btn-action-primary"
                                    onClick={() => handlePriorityBoost(job.id)}
                                >
                                    ⚡ Priority Boost (+$2)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'completed' && (
                <div className="jobs-view">
                    <div className="view-header">
                        <h2>✅ Completed Renders</h2>
                        <span className="job-count">{completedJobs.length} ready to download</span>
                    </div>

                    {completedJobs.map(job => (
                        <div key={job.id} className="job-card-detailed completed">
                            <div className="job-card-header">
                                <div className="job-title-section">
                                    <span className="job-type-icon">{getTypeIcon(job.type)}</span>
                                    <h3>{job.name}</h3>
                                    <span className="status-badge completed">Completed</span>
                                </div>
                                <div className="job-download-section">
                                    <span className="download-size">{job.size}</span>
                                </div>
                            </div>

                            <div className="job-card-body">
                                <div className="job-specs">
                                    <div className="spec-item">
                                        <span className="spec-label">Resolution</span>
                                        <span className="spec-value">{job.resolution}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Format</span>
                                        <span className="spec-value">{job.format.toUpperCase()}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Quality</span>
                                        <span className="spec-value">{job.quality}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Render Time</span>
                                        <span className="spec-value">{job.renderTime}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Completed</span>
                                        <span className="spec-value">{job.completedAt}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Cost</span>
                                        <span className="spec-value">${job.cost.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="job-card-actions">
                                <button
                                    className="btn-action-primary-large"
                                    onClick={() => handleDownload(job)}
                                >
                                    📥 Download ({job.size})
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'queued' && (
                <div className="jobs-view">
                    <div className="view-header">
                        <h2>⏳ Render Queue</h2>
                        <span className="job-count">{queuedJobs.length} waiting</span>
                    </div>

                    {queuedJobs.map(job => (
                        <div key={job.id} className="job-card-detailed queued">
                            <div className="job-card-header">
                                <div className="job-title-section">
                                    <span className="job-type-icon">{getTypeIcon(job.type)}</span>
                                    <h3>{job.name}</h3>
                                    <span className="status-badge queued">Queue #{job.queuePosition}</span>
                                </div>
                                <div className="job-cost-section">
                                    <span className="cost-label">Est. Cost</span>
                                    <span className="cost-amount">${job.estimatedCost.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="job-card-body">
                                <div className="job-specs">
                                    <div className="spec-item">
                                        <span className="spec-label">Resolution</span>
                                        <span className="spec-value">{job.resolution}</span>
                                    </div>
                                    {job.fps && (
                                        <div className="spec-item">
                                            <span className="spec-label">Frame Rate</span>
                                            <span className="spec-value">{job.fps} fps</span>
                                        </div>
                                    )}
                                    <div className="spec-item">
                                        <span className="spec-label">Priority</span>
                                        <span className="spec-value">{job.priority}</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Position</span>
                                        <span className="spec-value">#{job.queuePosition} in queue</span>
                                    </div>
                                </div>
                            </div>

                            <div className="job-card-actions">
                                <button
                                    className="btn-action-secondary"
                                    onClick={() => handleCancelJob(job.id)}
                                >
                                    Remove from Queue
                                </button>
                                <button
                                    className="btn-action-primary"
                                    onClick={() => handlePriorityBoost(job.id)}
                                >
                                    ⚡ Move to Front (+$2)
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'pricing' && (
                <div className="pricing-view">
                    <div className="pricing-hero">
                        <h2>💰 Transparent Pricing</h2>
                        <p>Only pay for what you render. No subscriptions, no hidden fees.</p>
                    </div>

                    <div className="pricing-cards">
                        <div className="pricing-card">
                            <div className="pricing-card-header">
                                <h3>🎬 Video Rendering</h3>
                                <div className="pricing-amount">$0.10<span>/minute</span></div>
                            </div>
                            <ul className="pricing-features">
                                <li>✓ Up to 8K resolution</li>
                                <li>✓ 120 fps support</li>
                                <li>✓ H.264, H.265, ProRes</li>
                                <li>✓ 10-bit color depth</li>
                                <li>✓ Motion blur & effects</li>
                                <li>✓ Multi-GPU acceleration</li>
                            </ul>
                            <div className="pricing-example">
                                <strong>Example:</strong> 5-minute 4K video = $0.50
                            </div>
                        </div>

                        <div className="pricing-card featured">
                            <div className="pricing-badge">Most Popular</div>
                            <div className="pricing-card-header">
                                <h3>📸 Photo Batch</h3>
                                <div className="pricing-amount">$0.01<span>/image</span></div>
                            </div>
                            <ul className="pricing-features">
                                <li>✓ Unlimited resolution</li>
                                <li>✓ RAW file support</li>
                                <li>✓ Batch color grading</li>
                                <li>✓ AI enhancement</li>
                                <li>✓ Watermark removal</li>
                                <li>✓ Format conversion</li>
                            </ul>
                            <div className="pricing-example">
                                <strong>Example:</strong> 100 photos = $1.00
                            </div>
                        </div>

                        <div className="pricing-card">
                            <div className="pricing-card-header">
                                <h3>🎵 Audio Processing</h3>
                                <div className="pricing-amount">$0.05<span>/minute</span></div>
                            </div>
                            <ul className="pricing-features">
                                <li>✓ Mastering & mixing</li>
                                <li>✓ Stem separation</li>
                                <li>✓ Vocal isolation</li>
                                <li>✓ Noise removal</li>
                                <li>✓ Format conversion</li>
                                <li>✓ Batch processing</li>
                            </ul>
                            <div className="pricing-example">
                                <strong>Example:</strong> 10-minute track = $0.50
                            </div>
                        </div>

                        <div className="pricing-card">
                            <div className="pricing-card-header">
                                <h3>🥽 VR/3D Rendering</h3>
                                <div className="pricing-amount">$0.25<span>/minute</span></div>
                            </div>
                            <ul className="pricing-features">
                                <li>✓ Ray tracing support</li>
                                <li>✓ Global illumination</li>
                                <li>✓ Physics simulation</li>
                                <li>✓ Particle effects</li>
                                <li>✓ Multi-angle renders</li>
                                <li>✓ 360° panoramas</li>
                            </ul>
                            <div className="pricing-example">
                                <strong>Example:</strong> VR scene = $2.50
                            </div>
                        </div>
                    </div>

                    <div className="pricing-addons">
                        <h3>⚡ Priority Rendering</h3>
                        <div className="addon-grid">
                            <div className="addon-item">
                                <span className="addon-icon">🐌</span>
                                <span className="addon-name">Low Priority</span>
                                <span className="addon-price">-20% cost</span>
                                <span className="addon-desc">Renders overnight</span>
                            </div>
                            <div className="addon-item">
                                <span className="addon-icon">⚡</span>
                                <span className="addon-name">High Priority</span>
                                <span className="addon-price">+$2/job</span>
                                <span className="addon-desc">Front of queue</span>
                            </div>
                            <div className="addon-item">
                                <span className="addon-icon">🚀</span>
                                <span className="addon-name">Urgent</span>
                                <span className="addon-price">+$5/job</span>
                                <span className="addon-desc">Immediate start</span>
                            </div>
                        </div>
                    </div>

                    <div className="pricing-footer">
                        <h3>💡 Why Cloud Rendering?</h3>
                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <span className="benefit-icon">⚡</span>
                                <h4>10x Faster</h4>
                                <p>Cluster of 128 GPUs vs your single GPU</p>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">💻</span>
                                <h4>Free Your Computer</h4>
                                <p>Keep working while we render</p>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">💰</span>
                                <h4>Save Money</h4>
                                <p>No $5K GPU needed. Pay per use.</p>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">😴</span>
                                <h4>Render Overnight</h4>
                                <p>Upload before bed, download in morning</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CloudRenderFarm;
