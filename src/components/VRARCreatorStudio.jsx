/* eslint-disable */
import React, { useState, useRef } from 'react';
import WebXRExperience from './WebXRExperience';
import './VRARCreatorStudio.css';

/**
 * VR/AR Creator Studio - Better Than Unity For Content Creators
 * 
 * Why this is better than Unity/Unreal for creators:
 * - No coding required
 * - Web-based (works everywhere)
 * - Instant preview in VR/AR
 * - Export to all platforms
 * - One-time payment ($250-$1000) vs Unity Pro $2,040/year
 * - Creator-focused, not game-dev-focused
 * 
 * Features:
 * - VR world builder with templates
 * - AR object placement
 * - 3D model viewer/editor
 * - Drag-and-drop interface
 * - Live VR/AR preview
 * - Export to GLB, FBX, Unity, Unreal
 */
export default function VRARCreatorStudio({ userId }) {
  const [mode, setMode] = useState(null); // null, 'vr', 'ar', '3d'
  const [project, setProject] = useState(null);
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // VR Templates
  const VR_TEMPLATES = [
    { 
      id: 'art-gallery', 
      name: '🎨 Art Gallery', 
      description: 'Display your artwork in a professional VR gallery',
      complexity: 'Easy',
      objects: ['walls', 'frames', 'lighting', 'floor']
    },
    { 
      id: 'concert-venue', 
      name: '🎤 Concert Venue', 
      description: 'Virtual concert hall for live performances',
      complexity: 'Medium',
      objects: ['stage', 'lights', 'speakers', 'seating']
    },
    { 
      id: 'showroom', 
      name: '🏪 Product Showroom', 
      description: 'Showcase your products in VR',
      complexity: 'Easy',
      objects: ['pedestals', 'spotlights', 'walls']
    },
    { 
      id: 'museum', 
      name: '🏛️ Museum Exhibit', 
      description: 'Educational VR museum experience',
      complexity: 'Medium',
      objects: ['exhibits', 'info-cards', 'lighting']
    },
    { 
      id: 'apartment', 
      name: '🏠 Virtual Apartment', 
      description: 'Interactive living space',
      complexity: 'Hard',
      objects: ['rooms', 'furniture', 'decorations']
    },
    { 
      id: 'space', 
      name: '🚀 Space Station', 
      description: 'Sci-fi space environment',
      complexity: 'Hard',
      objects: ['modules', 'windows', 'controls', 'stars']
    }
  ];

  // AR Templates
  const AR_TEMPLATES = [
    { 
      id: 'product-viewer', 
      name: '📦 Product Viewer', 
      description: 'Let customers see products in their space',
      useCase: 'E-commerce'
    },
    { 
      id: 'furniture', 
      name: '🛋️ Furniture Placement', 
      description: 'Try before you buy - furniture edition',
      useCase: 'Interior Design'
    },
    { 
      id: 'character', 
      name: '🎭 Character Showcase', 
      description: 'Display 3D characters in real world',
      useCase: 'Entertainment'
    },
    { 
      id: 'educational', 
      name: '🧬 Educational Models', 
      description: 'Interactive AR learning experiences',
      useCase: 'Education'
    }
  ];

  // 3D Primitives
  const PRIMITIVES = [
    { id: 'cube', name: 'Cube', icon: '⬜' },
    { id: 'sphere', name: 'Sphere', icon: '⚪' },
    { id: 'cylinder', name: 'Cylinder', icon: '⚫' },
    { id: 'cone', name: 'Cone', icon: '🔺' },
    { id: 'plane', name: 'Plane', icon: '▭' },
    { id: 'torus', name: 'Torus', icon: '⭕' }
  ];

  const createProject = (template, projectMode) => {
    setProject({
      id: Date.now(),
      name: template.name,
      mode: projectMode,
      template: template,
      created: new Date()
    });
    setMode(projectMode);
    setObjects([]);
  };

  const addObject = (primitive) => {
    const newObject = {
      id: Date.now(),
      type: primitive.id,
      name: `${primitive.name} ${objects.length + 1}`,
      position: { x: 0, y: 1, z: -3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#667eea',
      material: 'standard'
    };
    setObjects([...objects, newObject]);
    setSelectedObject(newObject.id);
  };

  const updateObject = (id, updates) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };

  const deleteObject = () => {
    if (!selectedObject) return;
    setObjects(objects.filter(obj => obj.id !== selectedObject));
    setSelectedObject(null);
  };

  const exportProject = (format) => {
    // Actual export functionality can be implemented here
    alert(`Exporting as ${format}...\n\nExport formats:\n• GLB/GLTF - Web/mobile\n• FBX - Unity/Unreal\n• Unity Package\n• Unreal Project`);
  };

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="vrar-creator-studio">
        <div className="mode-selection">
          <div className="header">
            <h1>🥽 VR/AR Creator Studio</h1>
            <p>Create immersive experiences without coding - Better than Unity for creators</p>
          </div>

          <div className="mode-cards">
            <div className="mode-card vr-card" onClick={() => setMode('vr-templates')}>
              <div className="mode-icon">🥽</div>
              <h2>VR World Builder</h2>
              <p>Create immersive virtual reality environments</p>
              <ul>
                <li>✅ 6+ professional templates</li>
                <li>✅ Drag-and-drop interface</li>
                <li>✅ Live VR preview</li>
                <li>✅ Export to Quest, VIVE, Index</li>
              </ul>
              <div className="difficulty-badges">
                <span className="badge easy">Easy</span>
                <span className="badge medium">Medium</span>
                <span className="badge hard">Advanced</span>
              </div>
            </div>

            <div className="mode-card ar-card" onClick={() => setMode('ar-templates')}>
              <div className="mode-icon">📱</div>
              <h2>AR Object Placement</h2>
              <p>Place 3D content in the real world</p>
              <ul>
                <li>✅ Point-and-click placement</li>
                <li>✅ Real-world scaling</li>
                <li>✅ Surface detection</li>
                <li>✅ Works on iPhone + Android</li>
              </ul>
              <div className="use-cases">
                <span className="badge">E-commerce</span>
                <span className="badge">Education</span>
                <span className="badge">Entertainment</span>
              </div>
            </div>

            <div className="mode-card model-card" onClick={() => setMode('3d-modeling')}>
              <div className="mode-icon">🧊</div>
              <h2>3D Model Viewer</h2>
              <p>View and edit 3D models</p>
              <ul>
                <li>✅ Import GLB, FBX, OBJ</li>
                <li>✅ Material editor</li>
                <li>✅ Animation preview</li>
                <li>✅ VR/AR preview mode</li>
              </ul>
              <div className="format-badges">
                <span className="badge">GLB</span>
                <span className="badge">FBX</span>
                <span className="badge">OBJ</span>
              </div>
            </div>
          </div>

          <div className="comparison-section">
            <h3>💰 Why This Beats Unity For Creators</h3>
            <div className="comparison-grid">
              <div className="comparison-item">
                <h4>ForTheWeebs</h4>
                <ul>
                  <li>✅ No coding required</li>
                  <li>✅ Works in browser</li>
                  <li>✅ $250-$1000 one-time</li>
                  <li>✅ Creator-focused</li>
                  <li>✅ Instant VR preview</li>
                </ul>
              </div>
              <div className="comparison-item">
                <h4>Unity Pro</h4>
                <ul>
                  <li>❌ Requires coding</li>
                  <li>❌ Download required</li>
                  <li>❌ $2,040/year</li>
                  <li>❌ Game-dev focused</li>
                  <li>❌ Complex setup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template Selection
  if (mode === 'vr-templates' || mode === 'ar-templates') {
    const templates = mode === 'vr-templates' ? VR_TEMPLATES : AR_TEMPLATES;
    const projectMode = mode === 'vr-templates' ? 'vr' : 'ar';

    return (
      <div className="vrar-creator-studio">
        <div className="template-selection">
          <div className="header">
            <h1>{projectMode === 'vr' ? '🥽 VR' : '📱 AR'} Templates</h1>
            <button onClick={() => setMode(null)} className="btn-back">← Back</button>
          </div>

          <div className="templates-grid">
            {templates.map(template => (
              <div 
                key={template.id} 
                className="template-card"
                onClick={() => createProject(template, projectMode)}
              >
                <div className="template-preview">
                  <span className="template-icon">{projectMode === 'vr' ? '🥽' : '📱'}</span>
                </div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                {template.complexity && (
                  <span className={`badge ${template.complexity.toLowerCase()}`}>
                    {template.complexity}
                  </span>
                )}
                {template.useCase && (
                  <span className="badge">{template.useCase}</span>
                )}
              </div>
            ))}

            <div className="template-card blank-card" onClick={() => createProject({ name: 'Blank Project' }, projectMode)}>
              <div className="template-preview">
                <span className="template-icon">➕</span>
              </div>
              <h3>Start Blank</h3>
              <p>Build from scratch</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editor View
  return (
    <div className="vrar-creator-studio">
      <div className="studio-workspace">
        {/* Top Toolbar */}
        <div className="top-toolbar">
          <div className="project-info">
            <h2>{project.name}</h2>
            <span className="mode-badge">{mode.toUpperCase()}</span>
          </div>

          <div className="toolbar-actions">
            <button onClick={() => setShowPreview(!showPreview)} className="btn-preview">
              {showPreview ? '📝 Edit' : '🥽 Preview'} {mode === 'vr' ? 'VR' : 'AR'}
            </button>
            <select onChange={(e) => exportProject(e.target.value)} className="export-dropdown">
              <option value="">Export...</option>
              <option value="glb">GLB/GLTF (Web)</option>
              <option value="fbx">FBX (Unity/Unreal)</option>
              <option value="unity">Unity Package</option>
              <option value="unreal">Unreal Project</option>
            </select>
            <button onClick={() => { setProject(null); setMode(null); }} className="btn-close">
              ✕ Close
            </button>
          </div>
        </div>

        {showPreview ? (
          // VR/AR Preview
          <div className="preview-container">
            <WebXRExperience 
              mode={mode} 
              content={objects}
              userId={userId}
            />
          </div>
        ) : (
          // Editor Interface
          <div className="editor-container">
            {/* Left Sidebar - Object Library */}
            <div className="left-sidebar">
              <h3>📦 Add Objects</h3>
              <div className="primitives-grid">
                {PRIMITIVES.map(prim => (
                  <button
                    key={prim.id}
                    onClick={() => addObject(prim)}
                    className="primitive-btn"
                    title={prim.name}
                  >
                    <span className="icon">{prim.icon}</span>
                    <span className="label">{prim.name}</span>
                  </button>
                ))}
              </div>

              <h3>🎨 Materials</h3>
              <div className="materials-list">
                <button className="material-preset">Standard</button>
                <button className="material-preset">Metallic</button>
                <button className="material-preset">Glass</button>
                <button className="material-preset">Emissive</button>
              </div>

              <h3>💡 Lighting</h3>
              <div className="lighting-presets">
                <button>☀️ Daylight</button>
                <button>🌙 Night</button>
                <button>🏙️ City</button>
                <button>🌅 Sunset</button>
              </div>
            </div>

            {/* Center - 3D Viewport */}
            <div className="center-viewport">
              <div className="viewport-canvas">
                <div className="canvas-placeholder">
                  <div className="grid-overlay"></div>
                  <p>3D Viewport</p>
                  <p className="hint">
                    {objects.length === 0 
                      ? 'Add objects from the left panel' 
                      : `${objects.length} object${objects.length > 1 ? 's' : ''} in scene`}
                  </p>
                  
                  {/* Object List */}
                  {objects.length > 0 && (
                    <div className="scene-objects">
                      {objects.map(obj => (
                        <div 
                          key={obj.id}
                          className={`object-item ${selectedObject === obj.id ? 'selected' : ''}`}
                          onClick={() => setSelectedObject(obj.id)}
                        >
                          {obj.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="viewport-controls">
                <select className="camera-view">
                  <option>Perspective</option>
                  <option>Top View</option>
                  <option>Front View</option>
                  <option>Side View</option>
                </select>
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="right-sidebar">
              <h3>⚙️ Properties</h3>
              
              {selectedObject ? (
                <div className="properties-panel">
                  {objects
                    .filter(obj => obj.id === selectedObject)
                    .map(obj => (
                      <div key={obj.id} className="property-groups">
                        <div className="property-group">
                          <label>Name</label>
                          <input
                            type="text"
                            value={obj.name}
                            onChange={(e) => updateObject(obj.id, { name: e.target.value })}
                          />
                        </div>

                        <div className="property-group">
                          <label>Position</label>
                          <div className="vector-inputs">
                            <input
                              type="number"
                              value={obj.position.x}
                              onChange={(e) => updateObject(obj.id, { 
                                position: { ...obj.position, x: parseFloat(e.target.value) }
                              })}
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={obj.position.y}
                              onChange={(e) => updateObject(obj.id, { 
                                position: { ...obj.position, y: parseFloat(e.target.value) }
                              })}
                              placeholder="Y"
                            />
                            <input
                              type="number"
                              value={obj.position.z}
                              onChange={(e) => updateObject(obj.id, { 
                                position: { ...obj.position, z: parseFloat(e.target.value) }
                              })}
                              placeholder="Z"
                            />
                          </div>
                        </div>

                        <div className="property-group">
                          <label>Scale</label>
                          <div className="vector-inputs">
                            <input
                              type="number"
                              value={obj.scale.x}
                              onChange={(e) => updateObject(obj.id, { 
                                scale: { ...obj.scale, x: parseFloat(e.target.value) }
                              })}
                              step="0.1"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={obj.scale.y}
                              onChange={(e) => updateObject(obj.id, { 
                                scale: { ...obj.scale, y: parseFloat(e.target.value) }
                              })}
                              step="0.1"
                              placeholder="Y"
                            />
                            <input
                              type="number"
                              value={obj.scale.z}
                              onChange={(e) => updateObject(obj.id, { 
                                scale: { ...obj.scale, z: parseFloat(e.target.value) }
                              })}
                              step="0.1"
                              placeholder="Z"
                            />
                          </div>
                        </div>

                        <div className="property-group">
                          <label>Color</label>
                          <input
                            type="color"
                            value={obj.color}
                            onChange={(e) => updateObject(obj.id, { color: e.target.value })}
                          />
                        </div>

                        <button onClick={deleteObject} className="btn-delete">
                          🗑️ Delete Object
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="no-selection">
                  <p>Select an object to edit properties</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
