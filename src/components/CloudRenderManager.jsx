/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './CloudRenderManager.css';

export default function CloudRenderManager({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewJob, setShowNewJob] = useState(false);
  const [renderNodes, setRenderNodes] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    queuedJobs: 0,
    completedToday: 0,
    avgRenderTime: 0,
    availableNodes: 0
  });

  // New job form
  const [newJob, setNewJob] = useState({
    name: '',
    type: 'video',
    priority: 'normal',
    quality: 'high',
    resolution: '1920x1080',
    fps: 30,
    format: 'mp4',
    sourceFile: null,
    outputSettings: {
      codec: 'h264',
      bitrate: '5000k',
      denoise: false,
      upscale: false,
      colorGrading: 'none'
    }
  });

  useEffect(() => {
    fetchJobs();
    fetchRenderNodes();
    fetchStats();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchJobs();
      fetchRenderNodes();
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/render/jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRenderNodes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/render/nodes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRenderNodes(data.nodes);
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/render/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const submitJob = async (e) => {
    e.preventDefault();
    
    if (!newJob.sourceFile) {
      alert('Please select a source file');
      return;
    }

    const formData = new FormData();
    formData.append('file', newJob.sourceFile);
    formData.append('jobData', JSON.stringify({
      name: newJob.name,
      type: newJob.type,
      priority: newJob.priority,
      quality: newJob.quality,
      resolution: newJob.resolution,
      fps: newJob.fps,
      format: newJob.format,
      outputSettings: newJob.outputSettings
    }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/render/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setShowNewJob(false);
        setNewJob({
          name: '',
          type: 'video',
          priority: 'normal',
          quality: 'high',
          resolution: '1920x1080',
          fps: 30,
          format: 'mp4',
          sourceFile: null,
          outputSettings: {
            codec: 'h264',
            bitrate: '5000k',
            denoise: false,
            upscale: false,
            colorGrading: 'none'
          }
        });
        fetchJobs();
        alert('Render job submitted successfully!');
      } else {
        alert('Failed to submit job');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      alert('Error submitting job');
    }
  };

  const cancelJob = async (jobId) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/render/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchJobs();
      } else {
        alert('Failed to cancel job');
      }
    } catch (error) {
      console.error('Error canceling job:', error);
    }
  };

  const retryJob = async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/render/jobs/${jobId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchJobs();
      } else {
        alert('Failed to retry job');
      }
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  const downloadResult = (job) => {
    window.open(job.outputUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued': return '#FFA726';
      case 'processing': return '#29B6F6';
      case 'completed': return '#66BB6A';
      case 'failed': return '#EF5350';
      case 'cancelled': return '#BDBDBD';
      default: return '#999';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return '⏳';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '--';
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  if (loading) {
    return (
      <div className="cloud-render-loading">
        <div className="spinner"></div>
        <p>Loading render farm...</p>
      </div>
    );
  }

  return (
    <div className="cloud-render-manager">
      <div className="render-header">
        <div>
          <h1>☁️ Cloud Render Farm</h1>
          <p>Distributed rendering powered by GPU clusters</p>
        </div>
        <button className="new-job-btn" onClick={() => setShowNewJob(true)}>
          + New Render Job
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="render-stats">
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.activeJobs}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.queuedJobs}</div>
            <div className="stat-label">Queued Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completedToday}</div>
            <div className="stat-label">Completed Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-value">{formatDuration(stats.avgRenderTime)}</div>
            <div className="stat-label">Avg Render Time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖥️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.availableNodes}</div>
            <div className="stat-label">Available Nodes</div>
          </div>
        </div>
      </div>

      {/* Render Nodes Status */}
      <div className="render-nodes-section">
        <h2>🖥️ Render Nodes</h2>
        <div className="render-nodes">
          {renderNodes.map(node => (
            <div key={node.id} className={`render-node ${node.status}`}>
              <div className="node-header">
                <span className="node-name">{node.name}</span>
                <span className={`node-status ${node.status}`}>{node.status}</span>
              </div>
              <div className="node-specs">
                <div className="spec">GPU: {node.gpu}</div>
                <div className="spec">CPU: {node.cpu} cores</div>
                <div className="spec">RAM: {node.ram} GB</div>
              </div>
              <div className="node-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${node.utilization || 0}%` }}
                  ></div>
                </div>
                <span className="progress-label">{node.utilization || 0}% utilized</span>
              </div>
              {node.currentJob && (
                <div className="node-current-job">
                  Rendering: {node.currentJob}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="jobs-section">
        <h2>📋 Render Jobs</h2>
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No render jobs yet</p>
            <button onClick={() => setShowNewJob(true)}>Create your first job</button>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-title">
                    <span className="job-icon">{getStatusIcon(job.status)}</span>
                    <div>
                      <h3>{job.name}</h3>
                      <div className="job-meta">
                        {job.type} • {job.resolution} • {job.fps}fps • {job.format}
                      </div>
                    </div>
                  </div>
                  <div className="job-actions">
                    {job.status === 'completed' && (
                      <button className="download-btn" onClick={() => downloadResult(job)}>
                        ⬇️ Download
                      </button>
                    )}
                    {job.status === 'failed' && (
                      <button className="retry-btn" onClick={() => retryJob(job.id)}>
                        🔄 Retry
                      </button>
                    )}
                    {(job.status === 'queued' || job.status === 'processing') && (
                      <button className="cancel-btn" onClick={() => cancelJob(job.id)}>
                        🚫 Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="job-progress">
                  <div className="progress-info">
                    <span>Status: <strong style={{ color: getStatusColor(job.status) }}>
                      {job.status.toUpperCase()}
                    </strong></span>
                    {job.progress !== undefined && (
                      <span>Progress: {job.progress}%</span>
                    )}
                  </div>
                  {job.status === 'processing' && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${job.progress || 0}%`,
                          background: getStatusColor(job.status)
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="job-details">
                  <div className="detail">
                    <span className="label">Priority:</span>
                    <span className={`priority ${job.priority}`}>{job.priority}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Quality:</span>
                    <span>{job.quality}</span>
                  </div>
                  <div className="detail">
                    <span className="label">File Size:</span>
                    <span>{formatFileSize(job.fileSize)}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Render Time:</span>
                    <span>{formatDuration(job.renderTime)}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Node:</span>
                    <span>{job.nodeId || 'Waiting...'}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Created:</span>
                    <span>{new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {job.error && (
                  <div className="job-error">
                    <strong>Error:</strong> {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Job Modal */}
      {showNewJob && (
        <div className="modal-overlay" onClick={() => setShowNewJob(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Render Job</h2>
              <button className="close-btn" onClick={() => setShowNewJob(false)}>✕</button>
            </div>
            
            <form onSubmit={submitJob} className="new-job-form">
              <div className="form-group">
                <label>Job Name</label>
                <input
                  type="text"
                  value={newJob.name}
                  onChange={(e) => setNewJob({...newJob, name: e.target.value})}
                  placeholder="My Awesome Render"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                  >
                    <option value="video">Video</option>
                    <option value="image">Image Sequence</option>
                    <option value="3d">3D Model</option>
                    <option value="animation">Animation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newJob.priority}
                    onChange={(e) => setNewJob({...newJob, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Resolution</label>
                  <select
                    value={newJob.resolution}
                    onChange={(e) => setNewJob({...newJob, resolution: e.target.value})}
                  >
                    <option value="1280x720">720p (HD)</option>
                    <option value="1920x1080">1080p (Full HD)</option>
                    <option value="2560x1440">1440p (2K)</option>
                    <option value="3840x2160">2160p (4K)</option>
                    <option value="7680x4320">4320p (8K)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>FPS</label>
                  <select
                    value={newJob.fps}
                    onChange={(e) => setNewJob({...newJob, fps: Number(e.target.value)})}
                  >
                    <option value="24">24 fps</option>
                    <option value="30">30 fps</option>
                    <option value="60">60 fps</option>
                    <option value="120">120 fps</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quality</label>
                  <select
                    value={newJob.quality}
                    onChange={(e) => setNewJob({...newJob, quality: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Format</label>
                  <select
                    value={newJob.format}
                    onChange={(e) => setNewJob({...newJob, format: e.target.value})}
                  >
                    <option value="mp4">MP4</option>
                    <option value="mov">MOV</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                    <option value="mkv">MKV</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Source File</label>
                <input
                  type="file"
                  onChange={(e) => setNewJob({...newJob, sourceFile: e.target.files[0]})}
                  accept="video/*,image/*,.blend,.c4d,.ma,.mb,.max,.obj,.fbx"
                  required
                />
              </div>

              <div className="form-group">
                <label>Advanced Settings</label>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newJob.outputSettings.denoise}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        outputSettings: {...newJob.outputSettings, denoise: e.target.checked}
                      })}
                    />
                    AI Denoise
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newJob.outputSettings.upscale}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        outputSettings: {...newJob.outputSettings, upscale: e.target.checked}
                      })}
                    />
                    AI Upscale
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowNewJob(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
