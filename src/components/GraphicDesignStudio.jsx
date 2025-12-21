/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';

/**
 * Graphic Design Studio
 * Features: Canvas editor, shapes, text, layers, filters, templates, export
 */
export function GraphicDesignStudio({ userId }) {
  const [canvas, setCanvas] = useState({
    width: 1920,
    height: 1080,
    background: '#ffffff'
  });
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [tool, setTool] = useState('select');
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  const TOOLS = {
    select: { icon: '👆', name: 'Select' },
    text: { icon: '📝', name: 'Text' },
    rectangle: { icon: '▭', name: 'Rectangle' },
    circle: { icon: '⭕', name: 'Circle' },
    image: { icon: '🖼️', name: 'Image' },
    draw: { icon: '✏️', name: 'Draw' }
  };

  const TEMPLATES = [
    { name: 'Social Post', width: 1080, height: 1080, icon: '📱' },
    { name: 'YouTube Thumbnail', width: 1280, height: 720, icon: '🎬' },
    { name: 'Banner', width: 1920, height: 400, icon: '🏷️' },
    { name: 'Story', width: 1080, height: 1920, icon: '📖' },
    { name: 'Business Card', width: 1050, height: 600, icon: '💼' },
    { name: 'Poster', width: 1200, height: 1800, icon: '🎨' }
  ];

  const FONTS = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
    'Georgia', 'Comic Sans MS', 'Impact', 'Brush Script MT', 'Papyrus'
  ];

  useEffect(() => {
    drawCanvas();
  }, [layers, canvas]);

  const drawCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = canvas.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all layers
    layers.forEach(layer => {
      if (!layer.visible) return;

      ctx.globalAlpha = layer.opacity || 1;

      if (layer.type === 'rectangle') {
        ctx.fillStyle = layer.fill || '#000';
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
        if (layer.stroke) {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = layer.strokeWidth || 2;
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
        }
      } else if (layer.type === 'circle') {
        ctx.beginPath();
        ctx.arc(layer.x + layer.radius, layer.y + layer.radius, layer.radius, 0, Math.PI * 2);
        ctx.fillStyle = layer.fill || '#000';
        ctx.fill();
        if (layer.stroke) {
          ctx.strokeStyle = layer.stroke;
          ctx.lineWidth = layer.strokeWidth || 2;
          ctx.stroke();
        }
      } else if (layer.type === 'text') {
        ctx.font = `${layer.fontSize || 32}px ${layer.fontFamily || 'Arial'}`;
        ctx.fillStyle = layer.color || '#000';
        ctx.textAlign = layer.align || 'left';
        ctx.fillText(layer.text, layer.x, layer.y);
      } else if (layer.type === 'image' && layer.imageData) {
        const img = new Image();
        img.src = layer.imageData;
        ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      }

      ctx.globalAlpha = 1;
    });
  };

  const addLayer = (type, properties = {}) => {
    const newLayer = {
      id: `layer_${Date.now()}`,
      type,
      name: `${type} ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      x: canvas.width / 2 - 50,
      y: canvas.height / 2 - 50,
      ...properties
    };

    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  // Drag and drop handlers for images
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          addLayer('image', {
            imageData: event.target.result,
            width: Math.min(img.width, canvas.width - 100),
            height: Math.min(img.height, canvas.height - 100)
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    if (!textInput.trim()) {
      alert('Please enter some text first!');
      return;
    }
    addLayer('text', {
      text: textInput,
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center'
    });
    setTextInput('');
    setTool('select');
  };

  const addShape = (shape) => {
    if (shape === 'rectangle') {
      addLayer('rectangle', {
        width: 200,
        height: 150,
        fill: '#3498db',
        stroke: '#2c3e50',
        strokeWidth: 3
      });
    } else if (shape === 'circle') {
      addLayer('circle', {
        radius: 80,
        fill: '#e74c3c',
        stroke: '#c0392b',
        strokeWidth: 3
      });
    }
    setTool('select');
  };

  const uploadImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addLayer('image', {
          imageData: e.target.result,
          width: 300,
          height: 300
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateLayer = (layerId, updates) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const deleteLayer = (layerId) => {
    setLayers(layers.filter(layer => layer.id !== layerId));
    if (selectedLayer === layerId) setSelectedLayer(null);
  };

  const moveLayer = (layerId, direction) => {
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;

    const newLayers = [...layers];
    const layer = newLayers[index];

    if (direction === 'up' && index < layers.length - 1) {
      newLayers[index] = newLayers[index + 1];
      newLayers[index + 1] = layer;
    } else if (direction === 'down' && index > 0) {
      newLayers[index] = newLayers[index - 1];
      newLayers[index - 1] = layer;
    }

    setLayers(newLayers);
  };

  const applyTemplate = (template) => {
    setCanvas({
      width: template.width,
      height: template.height,
      background: '#ffffff'
    });
    setLayers([]);
  };

  const exportDesign = (format = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `design-${Date.now()}.${format}`;
      link.click();
    }, `image/${format}`);
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(102, 126, 234, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '120px', marginBottom: '30px' }}>🖼️</div>
          <div>Drop Image Here!</div>
          <div style={{ fontSize: '24px', marginTop: '20px', opacity: 0.9 }}>
            Will be added as a new layer
          </div>
        </div>
      )}
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎨 Graphic Design Studio
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>
            Create stunning graphics • Posters • Social media • Thumbnails • Logos
          </p>
        </div>

        {/* Tools */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {Object.entries(TOOLS).map(([key, toolData]) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              style={{
                ...toolBtnStyle,
                background: tool === key ? '#f093fb' : 'rgba(255,255,255,0.1)'
              }}
            >
              {toolData.icon} {toolData.name}
            </button>
          ))}

          <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.2)' }} />

          <button onClick={() => exportDesign('png')} style={toolBtnStyle}>
            💾 Export PNG
          </button>
          <button onClick={() => exportDesign('jpg')} style={toolBtnStyle}>
            📷 Export JPG
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 350px', gap: '30px' }}>
          {/* Left Sidebar - Templates & Tools */}
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>📐 Templates</h3>
              {TEMPLATES.map(template => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontSize: '14px'
                  }}
                >
                  {template.icon} {template.name}
                  <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '5px' }}>
                    {template.width}×{template.height}
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '20px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>⚡ Quick Add</h3>
              <button
                onClick={() => addShape('rectangle')}
                style={{ ...quickAddBtn, background: '#3498db' }}
              >
                ▭ Rectangle
              </button>
              <button
                onClick={() => addShape('circle')}
                style={{ ...quickAddBtn, background: '#e74c3c' }}
              >
                ⭕ Circle
              </button>
              <label style={{ ...quickAddBtn, background: '#2ecc71', display: 'block' }}>
                🖼️ Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Canvas */}
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '700px'
            }}>
              <div style={{
                background: '#fff',
                boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
                maxWidth: '100%',
                maxHeight: '700px',
                overflow: 'auto'
              }}>
                <canvas
                  ref={canvasRef}
                  width={canvas.width}
                  height={canvas.height}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties & Layers */}
          <div>
            {/* Tool Properties */}
            {tool === 'text' && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '15px' }}>✏️ Add Text</h3>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    marginBottom: '10px'
                  }}
                />
                <button
                  onClick={addText}
                  style={{
                    width: '100%',
                    background: '#f093fb',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Text to Canvas
                </button>
              </div>
            )}

            {/* Layer Properties */}
            {selectedLayerData && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '15px' }}>🎛️ Properties</h3>

                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                  Name:
                  <input
                    type="text"
                    value={selectedLayerData.name}
                    onChange={(e) => updateLayer(selectedLayer, { name: e.target.value })}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                  Opacity: {Math.round(selectedLayerData.opacity * 100)}%
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedLayerData.opacity}
                    onChange={(e) => updateLayer(selectedLayer, { opacity: parseFloat(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </label>

                {selectedLayerData.type === 'text' && (
                  <>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                      Text:
                      <input
                        type="text"
                        value={selectedLayerData.text}
                        onChange={(e) => updateLayer(selectedLayer, { text: e.target.value })}
                        style={inputStyle}
                      />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                      Font Size:
                      <input
                        type="number"
                        value={selectedLayerData.fontSize}
                        onChange={(e) => updateLayer(selectedLayer, { fontSize: parseInt(e.target.value) })}
                        style={inputStyle}
                      />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                      Font:
                      <select
                        value={selectedLayerData.fontFamily}
                        onChange={(e) => updateLayer(selectedLayer, { fontFamily: e.target.value })}
                        style={inputStyle}
                      >
                        {FONTS.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                      Color:
                      <input
                        type="color"
                        value={selectedLayerData.color}
                        onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })}
                        style={{ ...inputStyle, height: '40px' }}
                      />
                    </label>
                  </>
                )}

                {(selectedLayerData.type === 'rectangle' || selectedLayerData.type === 'circle') && (
                  <>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                      Fill Color:
                      <input
                        type="color"
                        value={selectedLayerData.fill || '#000000'}
                        onChange={(e) => updateLayer(selectedLayer, { fill: e.target.value })}
                        style={{ ...inputStyle, height: '40px' }}
                      />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
                      Stroke Color:
                      <input
                        type="color"
                        value={selectedLayerData.stroke || '#000000'}
                        onChange={(e) => updateLayer(selectedLayer, { stroke: e.target.value })}
                        style={{ ...inputStyle, height: '40px' }}
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {/* Layers Panel */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '20px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>📚 Layers ({layers.length})</h3>

              {layers.length === 0 && (
                <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                  No layers yet
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '10px' }}>
                {layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    style={{
                      background: selectedLayer === layer.id
                        ? 'rgba(240, 147, 251, 0.3)'
                        : 'rgba(255,255,255,0.1)',
                      border: selectedLayer === layer.id
                        ? '2px solid #f093fb'
                        : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{layer.name}</strong>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>
                          {layer.type}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(layer.id, 'up');
                          }}
                          style={layerBtn}
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(layer.id, 'down');
                          }}
                          style={layerBtn}
                        >
                          ▼
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                          style={layerBtn}
                        >
                          {layer.visible ? '👁️' : '🚫'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          style={{ ...layerBtn, background: '#e74c3c' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const toolBtnStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '10px 20px',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
};

const quickAddBtn = {
  width: '100%',
  border: 'none',
  padding: '12px',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  marginBottom: '10px',
  fontWeight: 'bold',
  textAlign: 'center'
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '8px',
  borderRadius: '6px',
  color: 'white',
  fontSize: '14px',
  marginTop: '5px'
};

const layerBtn = {
  background: 'rgba(0,0,0,0.5)',
  border: 'none',
  padding: '5px 8px',
  borderRadius: '5px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '12px'
};
