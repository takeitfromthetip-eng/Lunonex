import React, { useState, useEffect } from 'react';
import './APIAutomation.css';

const APIAutomation = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [apiKey, setApiKey] = useState('ftw_live_sk_7j9k2m4n6p8q1r3s5t7v9w0x');
    const [showKey, setShowKey] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [requestLogs, setRequestLogs] = useState([]);
    const [webhookUrl, setWebhookUrl] = useState('');

    // Mock API usage stats
    const usageStats = {
        requestsToday: 1247,
        requestsThisMonth: 34521,
        requestLimit: 100000,
        responseTime: '120ms',
        uptime: '99.98%',
        errorRate: '0.02%'
    };

    // API Endpoints documentation
    const endpoints = [
        {
            method: 'POST',
            path: '/api/v1/video/render',
            category: 'Video',
            description: 'Render a video project with custom settings',
            rateLimit: '100/hour',
            authentication: 'Required',
            pricing: '$0.10/min',
            example: {
                request: {
                    projectId: 'proj_abc123',
                    settings: {
                        resolution: '1920x1080',
                        fps: 60,
                        quality: 'high',
                        format: 'mp4'
                    },
                    webhookUrl: 'https://yourapp.com/webhooks/video-complete'
                },
                response: {
                    jobId: 'job_xyz789',
                    status: 'queued',
                    estimatedTime: '15 minutes',
                    cost: 1.50
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/photo/batch-edit',
            category: 'Photo',
            description: 'Apply edits to multiple photos at once',
            rateLimit: '1000/hour',
            authentication: 'Required',
            pricing: '$0.01/image',
            example: {
                request: {
                    images: ['img_001.jpg', 'img_002.jpg', 'img_003.jpg'],
                    preset: 'cinematic-grade',
                    settings: {
                        brightness: 10,
                        contrast: 15,
                        saturation: 5
                    }
                },
                response: {
                    batchId: 'batch_abc123',
                    status: 'processing',
                    totalImages: 3,
                    estimatedTime: '30 seconds'
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/audio/master',
            category: 'Audio',
            description: 'Master an audio track with AI',
            rateLimit: '50/hour',
            authentication: 'Required',
            pricing: '$0.05/min',
            example: {
                request: {
                    audioUrl: 'https://cdn.example.com/track.wav',
                    targetLoudness: -14,
                    genre: 'podcast',
                    format: 'mp3'
                },
                response: {
                    jobId: 'job_audio_456',
                    status: 'processing',
                    estimatedTime: '3 minutes'
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/design/generate-logo',
            category: 'Design',
            description: 'Generate logo variations with AI',
            rateLimit: '20/hour',
            authentication: 'Required',
            pricing: '$2.00/generation',
            example: {
                request: {
                    brandName: 'TechCorp',
                    style: 'modern-minimal',
                    colors: ['#3b82f6', '#8b5cf6'],
                    variations: 10
                },
                response: {
                    generationId: 'gen_logo_789',
                    status: 'generating',
                    variations: 10,
                    estimatedTime: '2 minutes'
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/vr/bake-lighting',
            category: 'VR',
            description: 'Bake lighting for VR scene',
            rateLimit: '10/hour',
            authentication: 'Required',
            pricing: '$5.00/scene',
            example: {
                request: {
                    sceneId: 'scene_vr_001',
                    quality: 'ultra',
                    bounces: 4,
                    samples: 2048
                },
                response: {
                    jobId: 'job_vr_bake_123',
                    status: 'baking',
                    estimatedTime: '45 minutes'
                }
            }
        },
        {
            method: 'GET',
            path: '/api/v1/jobs/{jobId}',
            category: 'Jobs',
            description: 'Get the status of a render job',
            rateLimit: '1000/hour',
            authentication: 'Required',
            pricing: 'Free',
            example: {
                request: {},
                response: {
                    jobId: 'job_xyz789',
                    status: 'completed',
                    progress: 100,
                    downloadUrl: 'https://cdn.fortheweebs.com/renders/xyz789.mp4',
                    cost: 1.50,
                    completedAt: '2025-11-10T14:30:00Z'
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/projects/import',
            category: 'Projects',
            description: 'Import project from external URL',
            rateLimit: '50/hour',
            authentication: 'Required',
            pricing: 'Free',
            example: {
                request: {
                    projectUrl: 'https://example.com/project.psd',
                    tool: 'photo',
                    autoOpen: true
                },
                response: {
                    projectId: 'proj_imported_456',
                    status: 'imported',
                    openUrl: 'https://fortheweebs.com/photo/proj_imported_456'
                }
            }
        },
        {
            method: 'POST',
            path: '/api/v1/webhooks/register',
            category: 'Webhooks',
            description: 'Register a webhook for event notifications',
            rateLimit: '100/hour',
            authentication: 'Required',
            pricing: 'Free',
            example: {
                request: {
                    url: 'https://yourapp.com/webhooks/ftw',
                    events: ['job.completed', 'job.failed', 'render.started'],
                    secret: 'your_webhook_secret_key'
                },
                response: {
                    webhookId: 'webhook_abc123',
                    status: 'active',
                    eventsSubscribed: 3
                }
            }
        }
    ];

    // Mock request logs
    const mockLogs = [
        { id: 1, timestamp: '2025-11-10 14:23:15', method: 'POST', path: '/api/v1/video/render', status: 200, time: '125ms', ip: '192.168.1.45' },
        { id: 2, timestamp: '2025-11-10 14:22:48', method: 'GET', path: '/api/v1/jobs/job_xyz789', status: 200, time: '45ms', ip: '192.168.1.45' },
        { id: 3, timestamp: '2025-11-10 14:21:32', method: 'POST', path: '/api/v1/photo/batch-edit', status: 200, time: '234ms', ip: '10.0.0.12' },
        { id: 4, timestamp: '2025-11-10 14:20:15', method: 'POST', path: '/api/v1/audio/master', status: 200, time: '189ms', ip: '172.16.0.8' },
        { id: 5, timestamp: '2025-11-10 14:19:03', method: 'POST', path: '/api/v1/webhooks/register', status: 201, time: '98ms', ip: '192.168.1.45' }
    ];

    useEffect(() => {
        setRequestLogs(mockLogs);
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    };

    const regenerateApiKey = () => {
        if (window.confirm('⚠️ Regenerate API Key?\n\nYour old key will stop working immediately. Any integrations using the old key will break.\n\nAre you sure?')) {
            const newKey = `ftw_live_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
            setApiKey(newKey);
            alert('✅ New API key generated!\n\nMake sure to update all your integrations.');
        }
    };

    const testWebhook = () => {
        if (!webhookUrl) {
            alert('⚠️ Please enter a webhook URL first');
            return;
        }
        alert(`🧪 Sending test webhook to:\n${webhookUrl}\n\nCheck your server logs for the test event.`);
    };

    const openEndpointDetails = (endpoint) => {
        setSelectedEndpoint(endpoint);
    };

    const closeEndpointDetails = () => {
        setSelectedEndpoint(null);
    };

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return '#10b981';
            case 'POST': return '#3b82f6';
            case 'PUT': return '#f59e0b';
            case 'DELETE': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return '#10b981';
        if (status >= 400 && status < 500) return '#f59e0b';
        if (status >= 500) return '#ef4444';
        return '#6b7280';
    };

    return (
        <div className="api-automation">
            <div className="api-header">
                <div className="header-content">
                    <h1>🔌 API & Automation</h1>
                    <p className="header-subtitle">Automate workflows, batch operations, and enterprise integrations</p>
                    <div className="api-badges">
                        <span className="api-badge">REST API • JSON responses</span>
                        <span className="api-badge">Webhooks • Real-time events</span>
                        <span className="api-badge">99.98% uptime</span>
                    </div>
                </div>
            </div>

            <div className="api-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'endpoints' ? 'active' : ''}`}
                    onClick={() => setActiveTab('endpoints')}
                >
                    API Endpoints
                </button>
                <button
                    className={`tab ${activeTab === 'webhooks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('webhooks')}
                >
                    Webhooks
                </button>
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Request Logs
                </button>
                <button
                    className={`tab ${activeTab === 'quickstart' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quickstart')}
                >
                    Quick Start
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="overview-view">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <span className="stat-value">{usageStats.requestsToday.toLocaleString()}</span>
                                <span className="stat-label">Requests Today</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-info">
                                <span className="stat-value">{usageStats.requestsThisMonth.toLocaleString()}</span>
                                <span className="stat-label">Requests This Month</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <span className="stat-value">{usageStats.responseTime}</span>
                                <span className="stat-label">Avg Response Time</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <span className="stat-value">{usageStats.uptime}</span>
                                <span className="stat-label">API Uptime</span>
                            </div>
                        </div>
                    </div>

                    <div className="api-key-section">
                        <div className="api-key-card">
                            <h3>🔑 Your API Key</h3>
                            <p className="api-key-description">Use this key to authenticate your API requests. Keep it secret!</p>

                            <div className="api-key-display">
                                <code className="api-key-value">
                                    {showKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                                </code>
                                <button
                                    className="btn-toggle-key"
                                    onClick={() => setShowKey(!showKey)}
                                >
                                    {showKey ? '👁️' : '👁️‍🗨️'}
                                </button>
                                <button
                                    className="btn-copy-key"
                                    onClick={() => copyToClipboard(apiKey)}
                                >
                                    📋 Copy
                                </button>
                            </div>

                            <div className="api-key-actions">
                                <button
                                    className="btn-regenerate"
                                    onClick={regenerateApiKey}
                                >
                                    🔄 Regenerate Key
                                </button>
                                <div className="key-info">
                                    <span>Last used: 2 minutes ago</span>
                                    <span>Created: Nov 1, 2025</span>
                                </div>
                            </div>
                        </div>

                        <div className="usage-card">
                            <h3>📊 Usage This Month</h3>
                            <div className="usage-bar-container">
                                <div className="usage-bar">
                                    <div
                                        className="usage-fill"
                                        style={{ width: `${(usageStats.requestsThisMonth / usageStats.requestLimit) * 100}%` }}
                                    />
                                </div>
                                <div className="usage-text">
                                    {usageStats.requestsThisMonth.toLocaleString()} / {usageStats.requestLimit.toLocaleString()} requests
                                </div>
                            </div>
                            <div className="usage-stats">
                                <div className="usage-stat">
                                    <span className="usage-stat-label">Success Rate</span>
                                    <span className="usage-stat-value">{(100 - parseFloat(usageStats.errorRate)).toFixed(2)}%</span>
                                </div>
                                <div className="usage-stat">
                                    <span className="usage-stat-label">Error Rate</span>
                                    <span className="usage-stat-value">{usageStats.errorRate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="quick-links">
                        <h2>🚀 Quick Links</h2>
                        <div className="links-grid">
                            <a href="#" className="link-card">
                                <span className="link-icon">📖</span>
                                <h4>API Documentation</h4>
                                <p>Complete reference for all endpoints</p>
                            </a>
                            <a href="#" className="link-card">
                                <span className="link-icon">💻</span>
                                <h4>Code Examples</h4>
                                <p>Node.js, Python, PHP, Ruby samples</p>
                            </a>
                            <a href="#" className="link-card">
                                <span className="link-icon">🔧</span>
                                <h4>Postman Collection</h4>
                                <p>Import and test all endpoints</p>
                            </a>
                            <a href="#" className="link-card">
                                <span className="link-icon">💬</span>
                                <h4>Developer Discord</h4>
                                <p>Get help from the community</p>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'endpoints' && (
                <div className="endpoints-view">
                    <div className="endpoints-header">
                        <h2>📡 API Endpoints</h2>
                        <span className="endpoints-count">{endpoints.length} endpoints available</span>
                    </div>

                    <div className="endpoints-list">
                        {endpoints.map((endpoint, index) => (
                            <div
                                key={index}
                                className="endpoint-card"
                                onClick={() => openEndpointDetails(endpoint)}
                            >
                                <div className="endpoint-header">
                                    <span
                                        className="method-badge"
                                        style={{ background: getMethodColor(endpoint.method) }}
                                    >
                                        {endpoint.method}
                                    </span>
                                    <code className="endpoint-path">{endpoint.path}</code>
                                    <span className="category-tag">{endpoint.category}</span>
                                </div>
                                <p className="endpoint-description">{endpoint.description}</p>
                                <div className="endpoint-meta">
                                    <span className="meta-item">🚦 {endpoint.rateLimit}</span>
                                    <span className="meta-item">🔐 {endpoint.authentication}</span>
                                    <span className="meta-item">💰 {endpoint.pricing}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'webhooks' && (
                <div className="webhooks-view">
                    <div className="webhooks-hero">
                        <h2>🪝 Webhooks</h2>
                        <p>Get real-time notifications when events occur</p>
                    </div>

                    <div className="webhook-setup">
                        <div className="webhook-form-card">
                            <h3>Register Webhook URL</h3>
                            <input
                                type="url"
                                className="webhook-input"
                                placeholder="https://yourapp.com/webhooks/fortheweebs"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <div className="webhook-actions">
                                <button className="btn-register-webhook">
                                    ✅ Register Webhook
                                </button>
                                <button
                                    className="btn-test-webhook"
                                    onClick={testWebhook}
                                >
                                    🧪 Send Test Event
                                </button>
                            </div>
                        </div>

                        <div className="webhook-info-card">
                            <h3>⚙️ Webhook Configuration</h3>
                            <div className="webhook-setting">
                                <label>Events to Subscribe</label>
                                <div className="event-checkboxes">
                                    <label><input type="checkbox" defaultChecked /> job.started</label>
                                    <label><input type="checkbox" defaultChecked /> job.completed</label>
                                    <label><input type="checkbox" defaultChecked /> job.failed</label>
                                    <label><input type="checkbox" /> render.progress</label>
                                    <label><input type="checkbox" /> project.updated</label>
                                    <label><input type="checkbox" /> payment.succeeded</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="webhook-events">
                        <h3>📋 Available Events</h3>
                        <div className="events-grid">
                            <div className="event-card">
                                <h4>job.started</h4>
                                <p>Fired when a render job begins processing</p>
                                <code>{"{ jobId, status: 'started', timestamp }"}</code>
                            </div>
                            <div className="event-card">
                                <h4>job.completed</h4>
                                <p>Fired when a render job finishes successfully</p>
                                <code>{"{ jobId, status: 'completed', downloadUrl }"}</code>
                            </div>
                            <div className="event-card">
                                <h4>job.failed</h4>
                                <p>Fired when a render job encounters an error</p>
                                <code>{"{ jobId, status: 'failed', error }"}</code>
                            </div>
                            <div className="event-card">
                                <h4>render.progress</h4>
                                <p>Periodic updates during rendering (every 10%)</p>
                                <code>{"{ jobId, progress: 50, estimatedTime }"}</code>
                            </div>
                        </div>
                    </div>

                    <div className="webhook-security">
                        <h3>🔒 Webhook Security</h3>
                        <p>We sign all webhook requests with HMAC-SHA256. Verify the signature to ensure requests are from ForTheWeebs:</p>
                        <pre className="code-block">
                            {`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}`}
                        </pre>
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="logs-view">
                    <div className="logs-header">
                        <h2>📜 Request Logs</h2>
                        <span className="logs-info">Last 24 hours • Real-time updates</span>
                    </div>

                    <div className="logs-table">
                        <div className="table-header">
                            <div className="th">Timestamp</div>
                            <div className="th">Method</div>
                            <div className="th">Endpoint</div>
                            <div className="th">Status</div>
                            <div className="th">Time</div>
                            <div className="th">IP Address</div>
                        </div>
                        {requestLogs.map(log => (
                            <div key={log.id} className="table-row">
                                <div className="td">{log.timestamp}</div>
                                <div className="td">
                                    <span
                                        className="method-badge-small"
                                        style={{ background: getMethodColor(log.method) }}
                                    >
                                        {log.method}
                                    </span>
                                </div>
                                <div className="td"><code>{log.path}</code></div>
                                <div className="td">
                                    <span
                                        className="status-badge"
                                        style={{ color: getStatusColor(log.status) }}
                                    >
                                        {log.status}
                                    </span>
                                </div>
                                <div className="td">{log.time}</div>
                                <div className="td">{log.ip}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'quickstart' && (
                <div className="quickstart-view">
                    <div className="quickstart-hero">
                        <h2>⚡ Quick Start Guide</h2>
                        <p>Get started with the ForTheWeebs API in minutes</p>
                    </div>

                    <div className="code-examples">
                        <div className="code-example-card">
                            <h3>🟢 Node.js / JavaScript</h3>
                            <pre className="code-block">
                                {`// Install the SDK
npm install @fortheweebs/api

// Import and configure
const ForTheWeebs = require('@fortheweebs/api');
const ftw = new ForTheWeebs('${apiKey}');

// Render a video
const job = await ftw.video.render({
  projectId: 'proj_abc123',
  settings: {
    resolution: '1920x1080',
    fps: 60,
    quality: 'high'
  }
});

console.log('Job ID:', job.jobId);
console.log('Status:', job.status);`}
                            </pre>
                        </div>

                        <div className="code-example-card">
                            <h3>🐍 Python</h3>
                            <pre className="code-block">
                                {`# Install the SDK
pip install fortheweebs

# Import and configure
from fortheweebs import ForTheWeebs
ftw = ForTheWeebs('${apiKey}')

# Render a video
job = ftw.video.render(
    project_id='proj_abc123',
    settings={
        'resolution': '1920x1080',
        'fps': 60,
        'quality': 'high'
    }
)

print(f'Job ID: {job.job_id}')
print(f'Status: {job.status}')`}
                            </pre>
                        </div>

                        <div className="code-example-card">
                            <h3>🌐 cURL / HTTP</h3>
                            <pre className="code-block">
                                {`curl -X POST https://api.fortheweebs.com/v1/video/render \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "proj_abc123",
    "settings": {
      "resolution": "1920x1080",
      "fps": 60,
      "quality": "high"
    }
  }'`}
                            </pre>
                        </div>

                        <div className="code-example-card">
                            <h3>🐘 PHP</h3>
                            <pre className="code-block">
                                {`<?php
// Install the SDK
// composer require fortheweebs/api

require 'vendor/autoload.php';

use ForTheWeebs\\Client;

$ftw = new Client('${apiKey}');

$job = $ftw->video->render([
    'projectId' => 'proj_abc123',
    'settings' => [
        'resolution' => '1920x1080',
        'fps' => 60,
        'quality' => 'high'
    ]
]);

echo "Job ID: " . $job->jobId;`}
                            </pre>
                        </div>
                    </div>

                    <div className="sdk-features">
                        <h3>💎 SDK Features</h3>
                        <div className="features-grid">
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <h4>Auto-retry Logic</h4>
                                <p>Automatic retries with exponential backoff</p>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📝</span>
                                <h4>TypeScript Support</h4>
                                <p>Full type definitions included</p>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔄</span>
                                <h4>Async/Await</h4>
                                <p>Modern Promise-based API</p>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🛡️</span>
                                <h4>Error Handling</h4>
                                <p>Detailed error messages & status codes</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedEndpoint && (
                <div className="endpoint-modal" onClick={closeEndpointDetails}>
                    <div className="endpoint-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={closeEndpointDetails}>×</button>

                        <div className="modal-header">
                            <span
                                className="method-badge-large"
                                style={{ background: getMethodColor(selectedEndpoint.method) }}
                            >
                                {selectedEndpoint.method}
                            </span>
                            <code className="endpoint-path-large">{selectedEndpoint.path}</code>
                        </div>

                        <p className="modal-description">{selectedEndpoint.description}</p>

                        <div className="modal-meta">
                            <div className="meta-item-large">
                                <span className="meta-label">Rate Limit</span>
                                <span className="meta-value">{selectedEndpoint.rateLimit}</span>
                            </div>
                            <div className="meta-item-large">
                                <span className="meta-label">Authentication</span>
                                <span className="meta-value">{selectedEndpoint.authentication}</span>
                            </div>
                            <div className="meta-item-large">
                                <span className="meta-label">Pricing</span>
                                <span className="meta-value">{selectedEndpoint.pricing}</span>
                            </div>
                        </div>

                        <div className="modal-example">
                            <h3>📤 Request Example</h3>
                            <pre className="code-block-modal">
                                {JSON.stringify(selectedEndpoint.example.request, null, 2)}
                            </pre>
                        </div>

                        <div className="modal-example">
                            <h3>📥 Response Example</h3>
                            <pre className="code-block-modal">
                                {JSON.stringify(selectedEndpoint.example.response, null, 2)}
                            </pre>
                        </div>

                        <button
                            className="btn-try-it"
                            onClick={() => alert('🔧 Try It feature coming soon!\n\nYou\'ll be able to test endpoints directly from the dashboard.')}
                        >
                            🧪 Try It Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default APIAutomation;
