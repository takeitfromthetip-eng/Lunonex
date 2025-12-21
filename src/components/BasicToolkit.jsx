import React, { useState } from 'react';
import './BasicToolkit.css';

/**
 * BASIC TOOLKIT - Offline Tools for Non-VIPs
 *
 * Simple, offline-friendly tools that work without AI APIs
 * VIPs get the full AI Orchestrator instead
 */

const BasicToolkit = () => {
  const [activeTab, setActiveTab] = useState('image');

  return (
    <div className="basic-toolkit">
      <div className="toolkit-header">
        <h1>🛠️ Creator Toolkit</h1>
        <p className="subtitle">Basic tools to get you started</p>
        <div className="upgrade-banner">
          <span>⚡ Want AI-powered automation?</span>
          <a href="/pricing" className="upgrade-btn">Upgrade to VIP</a>
        </div>
      </div>

      <div className="toolkit-tabs">
        <button
          className={`tab ${activeTab === 'image' ? 'active' : ''}`}
          onClick={() => setActiveTab('image')}
        >
          🖼️ Image Tools
        </button>
        <button
          className={`tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          🎬 Video Tools
        </button>
        <button
          className={`tab ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          🎵 Audio Tools
        </button>
        <button
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          ✍️ Text Tools
        </button>
      </div>

      <div className="toolkit-content">
        {activeTab === 'image' && <ImageTools />}
        {activeTab === 'video' && <VideoTools />}
        {activeTab === 'audio' && <AudioTools />}
        {activeTab === 'text' && <TextTools />}
      </div>
    </div>
  );
};

// Image Tools (all work offline)
const ImageTools = () => (
  <div className="tool-section">
    <h2>Image Tools</h2>
    <div className="tools-grid">
      <ToolCard
        icon="✂️"
        title="Crop & Resize"
        description="Basic image cropping and resizing"
        features={['Manual crop', 'Preset sizes', 'Custom dimensions']}
      />
      <ToolCard
        icon="🌈"
        title="Filters"
        description="Apply basic filters to your images"
        features={['Brightness', 'Contrast', 'Saturation', 'Blur']}
      />
      <ToolCard
        icon="📝"
        title="Text Overlay"
        description="Add text to your images"
        features={['Custom fonts', 'Colors', 'Positioning']}
      />
      <ToolCard
        icon="🔄"
        title="Rotate & Flip"
        description="Rotate and flip images"
        features={['90° rotation', 'Horizontal flip', 'Vertical flip']}
        vip={false}
      />
    </div>
  </div>
);

// Video Tools
const VideoTools = () => (
  <div className="tool-section">
    <h2>Video Tools</h2>
    <div className="tools-grid">
      <ToolCard
        icon="✂️"
        title="Trim Video"
        description="Cut video to specific duration"
        features={['Start/end point', 'Timeline preview']}
      />
      <ToolCard
        icon="🎨"
        title="Basic Filters"
        description="Simple video filters"
        features={['Brightness', 'Contrast', 'Speed']}
        vip={false}
      />
    </div>
    <div className="vip-tools">
      <h3>🔒 VIP Exclusive Video Tools</h3>
      <div className="locked-tools">
        <div className="locked-tool">🤖 AI Video Generator</div>
        <div className="locked-tool">🎭 Green Screen</div>
        <div className="locked-tool">🎨 Advanced Effects</div>
        <div className="locked-tool">📊 Auto-Captions</div>
      </div>
      <a href="/pricing" className="upgrade-btn-large">Upgrade to VIP</a>
    </div>
  </div>
);

// Audio Tools
const AudioTools = () => (
  <div className="tool-section">
    <h2>Audio Tools</h2>
    <div className="tools-grid">
      <ToolCard
        icon="✂️"
        title="Trim Audio"
        description="Cut audio clips"
        features={['Trim', 'Fade in/out']}
      />
      <ToolCard
        icon="🔊"
        title="Volume Adjust"
        description="Change audio volume"
        features={['Increase', 'Decrease', 'Normalize']}
        vip={false}
      />
    </div>
    <div className="vip-tools">
      <h3>🔒 VIP Exclusive Audio Tools</h3>
      <div className="locked-tools">
        <div className="locked-tool">🎙️ Voice Cloning</div>
        <div className="locked-tool">🎵 AI Music Generation</div>
        <div className="locked-tool">🎚️ Professional Mixing</div>
        <div className="locked-tool">🔇 Noise Removal</div>
      </div>
      <a href="/pricing" className="upgrade-btn-large">Upgrade to VIP</a>
    </div>
  </div>
);

// Text Tools
const TextTools = () => (
  <div className="tool-section">
    <h2>Text Tools</h2>
    <div className="tools-grid">
      <ToolCard
        icon="📏"
        title="Word Counter"
        description="Count words and characters"
        features={['Words', 'Characters', 'Lines']}
        vip={false}
      />
      <ToolCard
        icon="🔤"
        title="Case Converter"
        description="Change text case"
        features={['UPPERCASE', 'lowercase', 'Title Case']}
        vip={false}
      />
    </div>
    <div className="vip-tools">
      <h3>🔒 VIP Exclusive Text Tools</h3>
      <div className="locked-tools">
        <div className="locked-tool">🤖 AI Script Writer</div>
        <div className="locked-tool">✍️ Content Generator</div>
        <div className="locked-tool">📝 SEO Optimizer</div>
        <div className="locked-tool">🌐 Translation</div>
      </div>
      <a href="/pricing" className="upgrade-btn-large">Upgrade to VIP</a>
    </div>
  </div>
);

// Tool Card Component
const ToolCard = ({ icon, title, description, features, vip = true }) => (
  <div className="tool-card">
    <div className="tool-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    <ul className="features-list">
      {features.map((feature, i) => (
        <li key={i}>✓ {feature}</li>
      ))}
    </ul>
    <button className="tool-btn">Use Tool</button>
    {vip && <div className="vip-badge">VIP Enhanced</div>}
  </div>
);

export default BasicToolkit;
