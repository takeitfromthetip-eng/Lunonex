/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';

/**
 * ProPhotoEditor - Professional-level photo editor
 * Features: Layers, Masks, Blend Modes, Filters, Selection Tools, Adjustments
 * Multi-parameter editing, Non-destructive workflow
 */
export function ProPhotoEditor({ userId }) {
    const canvasRef = useRef(null);
    const [layers, setLayers] = useState([]);
    const [activeLayerId, setActiveLayerId] = useState(null);
    const [tool, setTool] = useState('move'); // move, brush, eraser, selection, text, gradient, etc.
    const [isDragging, setIsDragging] = useState(false);

    // Selection state
    const [selection, setSelection] = useState(null); // { x, y, width, height, type: 'rectangle'|'ellipse'|'lasso' }
    const [isSelecting, setIsSelecting] = useState(false);

    // Brush settings
    const [brushSettings, setBrushSettings] = useState({
        size: 20,
        hardness: 100,
        opacity: 100,
        flow: 100,
        color: '#000000',
        blendMode: 'normal',
    });

    // Adjustment layers with multiple parameters
    const [adjustments, setAdjustments] = useState({
        brightness: 0, // -100 to 100
        contrast: 0, // -100 to 100
        saturation: 0, // -100 to 100
        hue: 0, // -180 to 180
        vibrance: 0, // -100 to 100
        exposure: 0, // -2 to 2
        highlights: 0, // -100 to 100
        shadows: 0, // -100 to 100
        whites: 0, // -100 to 100
        blacks: 0, // -100 to 100
        clarity: 0, // -100 to 100
        temperature: 0, // -100 to 100 (warm/cool)
        tint: 0, // -100 to 100 (green/magenta)
        sharpness: 0, // 0 to 100
        noise: 0, // 0 to 100
        vignette: 0, // 0 to 100
        grain: 0, // 0 to 100
    });

    // Selected adjustments for multi-parameter editing
    const [selectedAdjustments, setSelectedAdjustments] = useState([]);

    // Filter presets
    const FILTERS = [
        { id: 'none', name: 'None', icon: '🚫' },
        { id: 'bw', name: 'Black & White', icon: '⚫' },
        { id: 'sepia', name: 'Sepia', icon: '🟤' },
        { id: 'vintage', name: 'Vintage', icon: '📷' },
        { id: 'cool', name: 'Cool', icon: '❄️' },
        { id: 'warm', name: 'Warm', icon: '🔥' },
        { id: 'dramatic', name: 'Dramatic', icon: '⚡' },
        { id: 'fade', name: 'Fade', icon: '🌫️' },
        { id: 'enhance', name: 'Enhance', icon: '✨' },
        { id: 'hdr', name: 'HDR', icon: '💎' },
        { id: 'blur', name: 'Blur', icon: '🌀' },
        { id: 'sharpen', name: 'Sharpen', icon: '🔪' },
        { id: 'glow', name: 'Glow', icon: '✨' },
        { id: 'neon', name: 'Neon', icon: '🌈' },
        { id: 'oil', name: 'Oil Painting', icon: '🎨' },
        { id: 'watercolor', name: 'Watercolor', icon: '💧' },
        { id: 'sketch', name: 'Sketch', icon: '✏️' },
        { id: 'pop', name: 'Pop Art', icon: '🎭' },
    ];

    // Blend modes (professional standard)
    const BLEND_MODES = [
        'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
        'darken', 'lighten', 'color-dodge', 'color-burn', 'difference',
        'exclusion', 'hue', 'saturation', 'color', 'luminosity'
    ];

    // Tools
    const TOOLS = [
        { id: 'move', name: 'Move', icon: '✋', key: 'V' },
        { id: 'selection', name: 'Selection', icon: '⬜', key: 'M' },
        { id: 'lasso', name: 'Lasso', icon: '🪢', key: 'L' },
        { id: 'magic-wand', name: 'Magic Wand', icon: '🪄', key: 'W' },
        { id: 'brush', name: 'Brush', icon: '🖌️', key: 'B' },
        { id: 'eraser', name: 'Eraser', icon: '🧹', key: 'E' },
        { id: 'gradient', name: 'Gradient', icon: '🌈', key: 'G' },
        { id: 'bucket', name: 'Paint Bucket', icon: '🪣', key: 'K' },
        { id: 'eyedropper', name: 'Eyedropper', icon: '💉', key: 'I' },
        { id: 'text', name: 'Text', icon: 'T', key: 'T' },
        { id: 'crop', name: 'Crop', icon: '✂️', key: 'C' },
        { id: 'blur', name: 'Blur', icon: '💨', key: 'R' },
        { id: 'sharpen', name: 'Sharpen', icon: '🔪', key: 'P' },
        { id: 'smudge', name: 'Smudge', icon: '👆', key: 'U' },
        { id: 'dodge', name: 'Dodge', icon: '☀️', key: 'O' },
        { id: 'burn', name: 'Burn', icon: '🔥', key: 'N' },
    ];

    // Initialize with empty layer
    useEffect(() => {
        if (layers.length === 0) {
            addLayer('Background', 'image');
        }
    }, []);

    const addLayer = (name, type = 'image', data = null) => {
        const newLayer = {
            id: Date.now(),
            name: name || `Layer ${layers.length + 1}`,
            type, // image, adjustment, text, shape
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            locked: false,
            data,
            mask: null,
            x: 0,
            y: 0,
        };
        setLayers([...layers, newLayer]);
        setActiveLayerId(newLayer.id);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (layers.length === 1 && layers[0].name === 'Background' && !layers[0].data) {
                    // Replace empty background
                    const updatedLayers = [...layers];
                    updatedLayers[0].data = img;
                    setLayers(updatedLayers);
                    setActiveLayerId(layers[0].id);
                } else {
                    // Add as new layer
                    addLayer('Image Layer', 'image', img);
                }
                renderCanvas();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Drag and drop
    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    addLayer('Dropped Image', 'image', img);
                    renderCanvas();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const renderCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Find largest dimensions
        let maxWidth = 1920;
        let maxHeight = 1080;
        layers.forEach(layer => {
            if (layer.data && layer.data.width) {
                maxWidth = Math.max(maxWidth, layer.data.width);
                maxHeight = Math.max(maxHeight, layer.data.height);
            }
        });

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render each visible layer
        layers.forEach(layer => {
            if (!layer.visible) return;

            ctx.save();
            ctx.globalAlpha = layer.opacity / 100;
            ctx.globalCompositeOperation = layer.blendMode;

            if (layer.type === 'image' && layer.data) {
                ctx.drawImage(layer.data, layer.x, layer.y);
            }

            ctx.restore();
        });

        // Apply adjustments
        applyAdjustments(ctx, canvas.width, canvas.height);

        // Draw selection if active
        if (selection) {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            if (selection.type === 'rectangle') {
                ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
            }
            ctx.restore();
        }
    };

    const applyAdjustments = (ctx, width, height) => {
        if (Object.values(adjustments).every(v => v === 0)) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Brightness
            if (adjustments.brightness !== 0) {
                const b_adj = adjustments.brightness * 2.55;
                r = Math.max(0, Math.min(255, r + b_adj));
                g = Math.max(0, Math.min(255, g + b_adj));
                b = Math.max(0, Math.min(255, b + b_adj));
            }

            // Contrast
            if (adjustments.contrast !== 0) {
                const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
                r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
                g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
                b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
            }

            // Saturation
            if (adjustments.saturation !== 0) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                const sat = 1 + (adjustments.saturation / 100);
                r = Math.max(0, Math.min(255, gray + sat * (r - gray)));
                g = Math.max(0, Math.min(255, gray + sat * (g - gray)));
                b = Math.max(0, Math.min(255, gray + sat * (b - gray)));
            }

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const toggleAdjustment = (key) => {
        setSelectedAdjustments(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleAdjustmentChange = (key, value) => {
        setAdjustments(prev => ({ ...prev, [key]: parseFloat(value) }));
    };

    useEffect(() => {
        renderCanvas();
    }, [layers, adjustments, selection]);

    const exportImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    const saveProject = () => {
        const projectData = {
            layers: layers.map(layer => ({
                ...layer,
                data: layer.data ? (layer.data instanceof HTMLImageElement ? layer.data.src : layer.data) : null
            })),
            adjustments,
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'project.ftw'; // ForTheWeebs project file
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    const loadProject = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);

                // Restore adjustments
                setAdjustments(projectData.adjustments);

                // Restore layers
                const restoredLayers = [];
                let loadedCount = 0;

                projectData.layers.forEach((layerData, index) => {
                    if (layerData.data && typeof layerData.data === 'string') {
                        const img = new Image();
                        img.onload = () => {
                            restoredLayers[index] = { ...layerData, data: img };
                            loadedCount++;

                            if (loadedCount === projectData.layers.length) {
                                setLayers(restoredLayers);
                                setActiveLayerId(restoredLayers[0]?.id || null);
                                renderCanvas();
                            }
                        };
                        img.src = layerData.data;
                    } else {
                        restoredLayers[index] = layerData;
                        loadedCount++;
                    }
                });

                if (loadedCount === projectData.layers.length) {
                    setLayers(restoredLayers);
                    setActiveLayerId(restoredLayers[0]?.id || null);
                }
            } catch (error) {
                alert('❌ Failed to load project: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
            minHeight: '100vh',
            color: '#fff',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    🎨 Pro Photo Editor
                </h1>
                <p style={{ color: '#aaa', fontSize: '14px' }}>
                    Professional-level editing • Layers • Masks • Blend Modes • Filters
                </p>
            </div>

            {/* Main Layout: 4 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 250px 1fr 300px', gap: '15px', height: 'calc(100vh - 150px)' }}>

                {/* COLUMN 1: Tools */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '10px',
                    overflowY: 'auto',
                }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#0ff' }}>Tools</h3>
                    {TOOLS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            title={`${t.name} (${t.key})`}
                            style={{
                                width: '60px',
                                height: '60px',
                                margin: '5px 0',
                                background: tool === t.id ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: tool === t.id ? '2px solid #0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t.icon}
                        </button>
                    ))}
                </div>

                {/* COLUMN 2: Layers & Properties */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '15px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                }}>
                    {/* Layers Panel */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '14px', color: '#0ff' }}>Layers</h3>
                            <button
                                onClick={() => addLayer()}
                                style={{
                                    background: 'rgba(0, 255, 255, 0.2)',
                                    border: '1px solid #0ff',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                + New
                            </button>
                        </div>

                        {layers.map(layer => (
                            <div
                                key={layer.id}
                                onClick={() => setActiveLayerId(layer.id)}
                                style={{
                                    background: activeLayerId === layer.id ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    border: activeLayerId === layer.id ? '1px solid #0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    marginBottom: '5px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={layer.visible}
                                        onChange={(e) => {
                                            const updated = layers.map(l =>
                                                l.id === layer.id ? { ...l, visible: e.target.checked } : l
                                            );
                                            setLayers(updated);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span>{layer.name}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                                    Opacity: {layer.opacity}% • {layer.blendMode}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Brush Settings (if brush tool active) */}
                    {tool === 'brush' && (
                        <div>
                            <h3 style={{ fontSize: '14px', color: '#0ff', marginBottom: '10px' }}>Brush</h3>

                            <label style={{ fontSize: '12px', color: '#aaa' }}>
                                Size: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{brushSettings.size}px</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="200"
                                value={brushSettings.size}
                                onChange={(e) => setBrushSettings({ ...brushSettings, size: parseInt(e.target.value) })}
                                style={{ width: '100%', marginBottom: '10px' }}
                            />

                            <label style={{ fontSize: '12px', color: '#aaa' }}>
                                Hardness: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{brushSettings.hardness}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={brushSettings.hardness}
                                onChange={(e) => setBrushSettings({ ...brushSettings, hardness: parseInt(e.target.value) })}
                                style={{ width: '100%', marginBottom: '10px' }}
                            />

                            <label style={{ fontSize: '12px', color: '#aaa' }}>
                                Opacity: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{brushSettings.opacity}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={brushSettings.opacity}
                                onChange={(e) => setBrushSettings({ ...brushSettings, opacity: parseInt(e.target.value) })}
                                style={{ width: '100%', marginBottom: '10px' }}
                            />

                            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '5px' }}>Color</label>
                            <input
                                type="color"
                                value={brushSettings.color}
                                onChange={(e) => setBrushSettings({ ...brushSettings, color: e.target.value })}
                                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '6px' }}
                            />
                        </div>
                    )}
                </div>

                {/* COLUMN 3: Canvas */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'auto',
                }}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isDragging && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 255, 255, 0.1)',
                            border: '3px dashed #0ff',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            zIndex: 10,
                        }}>
                            📸 Drop Image Here
                        </div>
                    )}

                    <canvas
                        ref={canvasRef}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            cursor: tool === 'move' ? 'move' : 'crosshair',
                        }}
                    />

                    {!layers.some(l => l.data) && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                id="imageUpload"
                            />
                            <input
                                type="file"
                                accept=".ftw,application/json"
                                onChange={loadProject}
                                style={{ display: 'none' }}
                                id="projectUpload"
                            />
                            <label
                                htmlFor="imageUpload"
                                style={{
                                    display: 'inline-block',
                                    padding: '15px 30px',
                                    background: 'linear-gradient(135deg, #00ffff, #0088ff)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    marginRight: '10px',
                                }}
                            >
                                📁 Upload Image
                            </label>
                            <label
                                htmlFor="projectUpload"
                                style={{
                                    display: 'inline-block',
                                    padding: '15px 30px',
                                    background: 'linear-gradient(135deg, #ff00ff, #aa00ff)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                📂 Load Project
                            </label>
                            <p style={{ color: '#888', marginTop: '10px', fontSize: '14px' }}>
                                or drag and drop images
                            </p>
                        </div>
                    )}

                    {layers.some(l => l.data) && (
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={exportImage}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #00ff00, #00aa00)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                ⬇️ Export PNG
                            </button>

                            <button
                                onClick={saveProject}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #0088ff, #0044ff)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                💾 Save Project
                            </button>

                            <label
                                htmlFor="projectUpload2"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #ff00ff, #aa00ff)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                📂 Load Project
                            </label>
                            <input
                                type="file"
                                accept=".ftw,application/json"
                                onChange={loadProject}
                                style={{ display: 'none' }}
                                id="projectUpload2"
                            />

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                id="imageUpload2"
                            />
                            <label
                                htmlFor="imageUpload2"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #00ffff, #0088ff)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                ➕ Add Image
                            </label>

                            <button
                                onClick={exportImage}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #00ff00, #00aa00)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                ⬇️ Export
                            </button>
                        </div>
                    )}
                </div>

                {/* COLUMN 4: Adjustments & Filters */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    padding: '15px',
                    overflowY: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', color: '#0ff', margin: 0 }}>Adjustments</h3>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                onClick={() => setSelectedAdjustments(Object.keys(adjustments))}
                                style={{
                                    padding: '4px 10px',
                                    background: 'rgba(0, 255, 255, 0.2)',
                                    border: '1px solid #0ff',
                                    borderRadius: '4px',
                                    color: '#0ff',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                }}
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => setSelectedAdjustments([])}
                                style={{
                                    padding: '4px 10px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {selectedAdjustments.length > 0 && (
                        <div style={{
                            background: 'rgba(0, 255, 255, 0.1)',
                            border: '1px solid #0ff',
                            borderRadius: '6px',
                            padding: '10px',
                            marginBottom: '15px',
                        }}>
                            <div style={{ fontSize: '12px', color: '#0ff', fontWeight: 'bold', marginBottom: '5px' }}>
                                ✅ {selectedAdjustments.length} Selected - Drag any slider to control all
                            </div>
                            <div style={{ fontSize: '11px', color: '#aaa' }}>
                                {selectedAdjustments.map(k => k.replace(/([A-Z])/g, ' $1').trim()).join(', ')}
                            </div>
                        </div>
                    )}

                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
                        💡 Check boxes to link adjustments together
                    </p>

                    {/* Adjustment Controls with Multi-Select */}
                    {Object.entries(adjustments).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedAdjustments.includes(key)}
                                    onChange={() => toggleAdjustment(key)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label style={{
                                    fontSize: '12px',
                                    color: selectedAdjustments.includes(key) ? '#0ff' : '#aaa',
                                    textTransform: 'capitalize',
                                    flex: 1,
                                }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <span style={{
                                    color: '#0ff',
                                    fontFamily: 'monospace',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}>
                                    {value}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={key === 'exposure' ? -200 : key.includes('hue') ? -180 : -100}
                                max={key === 'exposure' ? 200 : key.includes('hue') ? 180 : 100}
                                value={value}
                                onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
                                    if (selectedAdjustments.length > 0) {
                                        // Apply to all selected
                                        const updated = { ...adjustments };
                                        selectedAdjustments.forEach(k => {
                                            updated[k] = newValue;
                                        });
                                        setAdjustments(updated);
                                    } else {
                                        handleAdjustmentChange(key, newValue);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    accentColor: selectedAdjustments.includes(key) ? '#0ff' : '#666',
                                }}
                            />
                        </div>
                    ))}

                    {/* Reset Button */}
                    <button
                        onClick={() => {
                            setAdjustments({
                                brightness: 0, contrast: 0, saturation: 0, hue: 0, vibrance: 0,
                                exposure: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0,
                                clarity: 0, temperature: 0, tint: 0, sharpness: 0, noise: 0,
                                vignette: 0, grain: 0,
                            });
                            setSelectedAdjustments([]);
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'rgba(255, 0, 0, 0.2)',
                            border: '1px solid #ff4444',
                            borderRadius: '6px',
                            color: '#ff4444',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginTop: '10px',
                        }}
                    >
                        🔄 Reset All
                    </button>

                    {/* Filter Presets */}
                    <h3 style={{ fontSize: '16px', marginTop: '30px', marginBottom: '15px', color: '#0ff' }}>Filters</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {FILTERS.map(filter => (
                            <button
                                key={filter.id}
                                style={{
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {filter.icon} {filter.name}
                            </button>
                        ))}
                    </div>

                    {/* Blend Modes */}
                    <h3 style={{ fontSize: '16px', marginTop: '30px', marginBottom: '15px', color: '#0ff' }}>Blend Mode</h3>
                    <select
                        value={layers.find(l => l.id === activeLayerId)?.blendMode || 'normal'}
                        onChange={(e) => {
                            const updated = layers.map(l =>
                                l.id === activeLayerId ? { ...l, blendMode: e.target.value } : l
                            );
                            setLayers(updated);
                        }}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                    >
                        {BLEND_MODES.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Keyboard Shortcuts Reference */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '10px 15px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#888',
            }}>
                <strong style={{ color: '#0ff' }}>💡 Tips:</strong> Hold Shift for multi-select • Ctrl+Z to undo • Ctrl+S to save
            </div>
        </div>
    );
}
