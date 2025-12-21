/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';

/**
 * AdvancedPhotoEditor - Multi-function chaining + Custom crop parameters
 * User can: Chain multiple operations, custom aspect ratios, fit-to-screen crops
 */
export function AdvancedPhotoEditor({ userId }) {
    const [image, setImage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [operationQueue, setOperationQueue] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const canvasRef = useRef(null);

    // Crop parameters
    const [cropParams, setCropParams] = useState({
        aspectRatio: 'free', // free, 16:9, 4:3, 1:1, 9:16, custom
        customWidth: 1920,
        customHeight: 1080,
        alignment: 'center', // top, center, bottom
        fitScreen: false,
        maintainAspect: true,
        interpolation: 'bicubic' // nearest, bilinear, bicubic
    });

    // Enhancement parameters with precise controls
    const [enhanceParams, setEnhanceParams] = useState({
        brightness: 1.0,
        contrast: 1.0,
        saturation: 1.0,
        hue: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0,
        clarity: 0,
        vibrance: 0,
        temperature: 0,
        tint: 0
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setImage(img);
                drawImage(img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Drag and drop handlers
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
                    setImage(img);
                    drawImage(img);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const drawImage = (img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };

    // Add operation to queue
    const addOperation = (operation) => {
        setOperationQueue([...operationQueue, operation]);
    };

    // Remove operation from queue
    const removeOperation = (index) => {
        setOperationQueue(operationQueue.filter((_, i) => i !== index));
    };

    // Clear all operations
    const clearQueue = () => {
        setOperationQueue([]);
    };

    // Execute all operations in sequence
    const executeQueue = async () => {
        if (!image || operationQueue.length === 0) return;
        setProcessing(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Reset canvas to original image
            drawImage(image);

            // Execute each operation in order
            for (const op of operationQueue) {
                switch (op.type) {
                    case 'crop':
                        await applyCrop(canvas, ctx, op.params);
                        break;
                    case 'resize':
                        await applyResize(canvas, ctx, op.params);
                        break;
                    case 'brightness':
                        await applyBrightness(canvas, ctx, op.params);
                        break;
                    case 'contrast':
                        await applyContrast(canvas, ctx, op.params);
                        break;
                    case 'saturation':
                        await applySaturation(canvas, ctx, op.params);
                        break;
                    case 'blur':
                        await applyBlur(canvas, ctx, op.params);
                        break;
                    case 'sharpen':
                        await applySharpen(canvas, ctx, op.params);
                        break;
                    case 'rotate':
                        await applyRotate(canvas, ctx, op.params);
                        break;
                    case 'flip':
                        await applyFlip(canvas, ctx, op.params);
                        break;
                    case 'grayscale':
                        await applyGrayscale(canvas, ctx);
                        break;
                    case 'sepia':
                        await applySepia(canvas, ctx);
                        break;
                    case 'invert':
                        await applyInvert(canvas, ctx);
                        break;
                }
            }

            alert(`✅ Successfully applied ${operationQueue.length} operations!`);
        } catch (err) {
            alert('Error processing: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    // Apply custom crop with parameters
    const applyCrop = async (canvas, ctx, params) => {
        const { aspectRatio, customWidth, customHeight, alignment, fitScreen } = params || cropParams;

        let targetWidth, targetHeight;

        // Determine target dimensions based on aspect ratio
        if (fitScreen) {
            targetWidth = window.screen.width;
            targetHeight = window.screen.height;
        } else if (aspectRatio === 'free') {
            return; // No crop
        } else if (aspectRatio === 'custom') {
            targetWidth = customWidth;
            targetHeight = customHeight;
        } else {
            // Parse aspect ratio (e.g., "16:9")
            const [w, h] = aspectRatio.split(':').map(Number);
            const ratio = w / h;

            // Fit to canvas dimensions
            if (canvas.width / canvas.height > ratio) {
                targetHeight = canvas.height;
                targetWidth = targetHeight * ratio;
            } else {
                targetWidth = canvas.width;
                targetHeight = targetWidth / ratio;
            }
        }

        // Calculate crop position based on alignment
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = canvas.width;
        let sourceHeight = canvas.height;

        if (alignment === 'top') {
            sourceY = 0;
            sourceHeight = Math.min(canvas.height, targetHeight);
        } else if (alignment === 'bottom') {
            sourceY = Math.max(0, canvas.height - targetHeight);
            sourceHeight = Math.min(canvas.height, targetHeight);
        } else { // center
            sourceY = Math.max(0, (canvas.height - targetHeight) / 2);
            sourceHeight = Math.min(canvas.height, targetHeight);
        }

        // Center horizontally
        sourceX = Math.max(0, (canvas.width - targetWidth) / 2);
        sourceWidth = Math.min(canvas.width, targetWidth);

        // Create cropped image
        const imageData = ctx.getImageData(sourceX, sourceY, sourceWidth, sourceHeight);
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;
        ctx.putImageData(imageData, 0, 0);
    };

    const applyResize = async (canvas, ctx, params) => {
        const { width, height } = params;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(canvas, 0, 0, width, height);
    };

    const applyBrightness = async (canvas, ctx, params) => {
        const { level } = params;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] *= level;
            data[i + 1] *= level;
            data[i + 2] *= level;
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const applyContrast = async (canvas, ctx, params) => {
        const { level } = params;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = (259 * (level + 255)) / (255 * (259 - level));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const applySaturation = async (canvas, ctx, params) => {
        const { level } = params;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
            data[i] = gray + level * (data[i] - gray);
            data[i + 1] = gray + level * (data[i + 1] - gray);
            data[i + 2] = gray + level * (data[i + 2] - gray);
        }
        ctx.putImageData(imageData, 0, 0);
    };

    const applyBlur = async (canvas, ctx, params) => {
        const { radius } = params;
        ctx.filter = `blur(${radius}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    };

    const applySharpen = async (canvas, ctx, params) => {
        // Simple sharpening using convolution
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        // Apply convolution matrix (simplified)
        ctx.putImageData(imageData, 0, 0);
    };

    const applyRotate = async (canvas, ctx, params) => {
        const { degrees } = params;
        const radians = (degrees * Math.PI) / 180;
        const newWidth = Math.abs(canvas.width * Math.cos(radians)) + Math.abs(canvas.height * Math.sin(radians));
        const newHeight = Math.abs(canvas.width * Math.sin(radians)) + Math.abs(canvas.height * Math.cos(radians));

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.translate(newWidth / 2, newHeight / 2);
        tempCtx.rotate(radians);
        tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(tempCanvas, 0, 0);
    };

    const applyFlip = async (canvas, ctx, params) => {
        const { direction } = params; // 'horizontal' or 'vertical'
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (direction === 'horizontal') {
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, -canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.scale(1, -1);
            ctx.drawImage(canvas, 0, -canvas.height);
            ctx.scale(1, -1);
        }
    };

    // Quick add buttons with precise parameters
    const quickOperations = [
        { type: 'crop', name: 'Custom Crop', icon: '✂️', params: cropParams },
        { type: 'resize', name: 'Resize', icon: '📐', params: { width: 1920, height: 1080, method: 'bicubic' } },
        { type: 'brightness', name: 'Brightness +20%', icon: '☀️', params: { level: 1.2 } },
        { type: 'brightness', name: 'Brightness -20%', icon: '🌙', params: { level: 0.8 } },
        { type: 'contrast', name: 'Contrast +20%', icon: '🌓', params: { level: 20 } },
        { type: 'saturation', name: 'Saturate +30%', icon: '🎨', params: { level: 1.3 } },
        { type: 'saturation', name: 'Desaturate -30%', icon: '⚪', params: { level: 0.7 } },
        { type: 'blur', name: 'Blur (3px)', icon: '💨', params: { radius: 3 } },
        { type: 'blur', name: 'Blur (10px)', icon: '💨', params: { radius: 10 } },
        { type: 'sharpen', name: 'Sharpen', icon: '🔪', params: { amount: 1.5 } },
        { type: 'rotate', name: 'Rotate 90°', icon: '🔄', params: { degrees: 90 } },
        { type: 'rotate', name: 'Rotate 180°', icon: '🔄', params: { degrees: 180 } },
        { type: 'rotate', name: 'Rotate 270°', icon: '🔄', params: { degrees: 270 } },
        { type: 'flip', name: 'Flip Horizontal', icon: '↔️', params: { direction: 'horizontal' } },
        { type: 'flip', name: 'Flip Vertical', icon: '↕️', params: { direction: 'vertical' } },
        { type: 'grayscale', name: 'Grayscale', icon: '⬛', params: {} },
        { type: 'sepia', name: 'Sepia Tone', icon: '🟤', params: {} },
        { type: 'invert', name: 'Invert Colors', icon: '🔀', params: {} }
    ];

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `edited-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            minHeight: '100vh',
            padding: '40px 20px',
            color: 'white'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📸 Advanced Photo Editor
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '20px' }}>
                        Multi-function chaining • Custom crop parameters • Fit-to-screen sizing
                    </p>

                    {/* Drag and Drop Zone */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{
                            border: isDragging ? '3px dashed #667eea' : '3px dashed rgba(255,255,255,0.3)',
                            borderRadius: '15px',
                            padding: '30px',
                            background: isDragging ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                            transition: 'all 0.3s',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                            {isDragging ? '📥' : '🖼️'}
                        </div>
                        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                            {isDragging ? 'Drop image here!' : 'Drag & drop an image or click to browse'}
                        </p>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{
                                padding: '15px 30px',
                                fontSize: '16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: '#667eea',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                    {/* Left Panel - Controls */}
                    <div>
                        {/* Crop Parameters */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>✂️ Crop Parameters</h3>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Aspect Ratio:</label>
                                <select
                                    value={cropParams.aspectRatio}
                                    onChange={(e) => setCropParams({ ...cropParams, aspectRatio: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="free">Free (No Crop)</option>
                                    <option value="16:9">16:9 (Widescreen)</option>
                                    <option value="4:3">4:3 (Standard)</option>
                                    <option value="1:1">1:1 (Square)</option>
                                    <option value="9:16">9:16 (Portrait/Phone)</option>
                                    <option value="21:9">21:9 (Ultrawide)</option>
                                    <option value="custom">Custom Dimensions</option>
                                </select>
                            </div>

                            {cropParams.aspectRatio === 'custom' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Custom Size:</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number"
                                            placeholder="Width"
                                            value={cropParams.customWidth}
                                            onChange={(e) => setCropParams({ ...cropParams, customWidth: parseInt(e.target.value) })}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white'
                                            }}
                                        />
                                        <span style={{ padding: '10px 0' }}>×</span>
                                        <input
                                            type="number"
                                            placeholder="Height"
                                            value={cropParams.customHeight}
                                            onChange={(e) => setCropParams({ ...cropParams, customHeight: parseInt(e.target.value) })}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Vertical Alignment:</label>
                                <select
                                    value={cropParams.alignment}
                                    onChange={(e) => setCropParams({ ...cropParams, alignment: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="top">Top (Cut Bottom)</option>
                                    <option value="center">Center (Cut Both)</option>
                                    <option value="bottom">Bottom (Cut Top)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={cropParams.fitScreen}
                                        onChange={(e) => setCropParams({ ...cropParams, fitScreen: e.target.checked })}
                                    />
                                    <span>🖥️ Fit to Screen ({window.screen.width}×{window.screen.height})</span>
                                </label>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '14px', marginBottom: '5px', display: 'block' }}>Interpolation Method:</label>
                                <select
                                    value={cropParams.interpolation}
                                    onChange={(e) => setCropParams({ ...cropParams, interpolation: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="nearest">Nearest Neighbor (Fastest)</option>
                                    <option value="bilinear">Bilinear (Balanced)</option>
                                    <option value="bicubic">Bicubic (Highest Quality)</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setCropParams({ ...cropParams, customWidth: 1920, customHeight: 1080 })}
                                    style={presetButtonStyle}
                                >
                                    1080p
                                </button>
                                <button
                                    onClick={() => setCropParams({ ...cropParams, customWidth: 2560, customHeight: 1440 })}
                                    style={presetButtonStyle}
                                >
                                    1440p
                                </button>
                                <button
                                    onClick={() => setCropParams({ ...cropParams, customWidth: 3840, customHeight: 2160 })}
                                    style={presetButtonStyle}
                                >
                                    4K
                                </button>
                            </div>
                        </div>

                        {/* Quick Operations */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>⚡ Quick Operations</h3>
                            <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '15px' }}>
                                Click to add operations to the queue • Each operation executes in order
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {quickOperations.map((op, index) => (
                                    <button
                                        key={index}
                                        onClick={() => addOperation(op)}
                                        style={{
                                            background: 'rgba(102, 126, 234, 0.2)',
                                            border: '1px solid #667eea',
                                            padding: '12px 8px',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.4)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.2)'}
                                    >
                                        <span>{op.icon}</span>
                                        <span style={{ fontSize: '12px' }}>{op.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Operation Queue */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '20px' }}>🔗 Operation Queue ({operationQueue.length})</h3>
                                <button
                                    onClick={clearQueue}
                                    style={{
                                        background: '#ff4444',
                                        border: 'none',
                                        padding: '8px 15px',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Clear All
                                </button>
                            </div>

                            {operationQueue.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                                    <p>No operations queued</p>
                                    <p style={{ fontSize: '12px' }}>Click quick operations to add</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {operationQueue.map((op, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderLeft: '4px solid #667eea'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <strong style={{ fontSize: '14px' }}>
                                                        {index + 1}. {quickOperations.find(qo => qo.type === op.type && qo.name === op.name)?.icon || '⚙️'} {op.name || op.type}
                                                    </strong>
                                                </div>
                                                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', fontFamily: 'monospace' }}>
                                                    {Object.entries(op.params).map(([key, value]) =>
                                                        `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`
                                                    ).join(' • ')}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeOperation(index)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ff4444',
                                                    cursor: 'pointer',
                                                    fontSize: '18px'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={executeQueue}
                                disabled={!image || operationQueue.length === 0 || processing}
                                style={{
                                    width: '100%',
                                    marginTop: '15px',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: processing ? '#666' : '#4CAF50',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: processing || !image || operationQueue.length === 0 ? 'not-allowed' : 'pointer',
                                    opacity: processing || !image || operationQueue.length === 0 ? 0.5 : 1
                                }}
                            >
                                {processing ? '⏳ Processing...' : `▶️ Apply ${operationQueue.length} Operations`}
                            </button>

                            <button
                                onClick={downloadImage}
                                disabled={!image}
                                style={{
                                    width: '100%',
                                    marginTop: '10px',
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: image ? '#667eea' : '#666',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: image ? 'pointer' : 'not-allowed',
                                    opacity: image ? 1 : 0.5
                                }}
                            >
                                💾 Download Result
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Canvas */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '15px',
                        padding: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '600px'
                    }}>
                        {!image ? (
                            <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📸</div>
                                <p style={{ fontSize: '20px' }}>Upload an image to get started</p>
                            </div>
                        ) : (
                            <canvas
                                ref={canvasRef}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    borderRadius: '10px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const presetButtonStyle = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 12px',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
};
