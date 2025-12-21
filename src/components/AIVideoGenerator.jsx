/* eslint-disable */
import React, { useState, useRef } from 'react';

export const AIVideoGenerator = ({ userId, tier }) => {
    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState('anime');
    const [contextDescription, setContextDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generatedVideo, setGeneratedVideo] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Only show dev warnings in development mode
    const isDev = import.meta.env.DEV;

    // Video style presets
    const VIDEO_STYLES = [
        { id: 'anime', name: 'Anime/Manga', description: 'Japanese animation style with vibrant colors' },
        { id: 'realistic', name: 'Photorealistic', description: 'Lifelike CGI with realistic lighting' },
        { id: 'cartoon', name: 'Western Cartoon', description: 'Bold outlines and expressive features' },
        { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon lights, futuristic tech aesthetic' },
        { id: 'fantasy', name: 'Fantasy', description: 'Magical, ethereal with particle effects' },
        { id: 'oil-painting', name: 'Oil Painting', description: 'Classical art style with brush strokes' },
        { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing artistic rendering' },
        { id: 'clay', name: 'Claymation', description: '3D stop-motion clay texture style' },
        { id: 'pixel', name: 'Pixel Art', description: 'Retro 8-bit/16-bit video game aesthetic' },
        { id: 'comic', name: 'Comic Book', description: 'Bold colors, halftone dots, action lines' },
        { id: 'noir', name: 'Film Noir', description: 'Black & white with dramatic shadows' },
        { id: 'vaporwave', name: 'Vaporwave', description: '80s/90s aesthetic with glitch effects' },
    ];

    // Advanced generation parameters
    const [params, setParams] = useState({
        duration: 5, // seconds (3-30)
        fps: 30, // frames per second (24, 30, 60)
        resolution: '1080p', // '720p', '1080p', '4k'
        motionIntensity: 50, // 0-100 (how much movement)
        cameraMotion: 'medium', // 'static', 'slow', 'medium', 'dynamic'
        transitionStyle: 'smooth', // 'smooth', 'dramatic', 'glitch', 'none'
        colorGrading: 'auto', // 'auto', 'warm', 'cool', 'vibrant', 'muted'
        particleEffects: true,
        depthOfField: true,
        motionBlur: true,
    });

    // Drag-and-drop handlers
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

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            processPhoto(imageFile);
        } else {
            alert('⚠️ Please drop an image file (PNG, JPG, GIF, WebP)');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            processPhoto(file);
        }
    };

    const processPhoto = (file) => {
        setUploadedPhoto(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPhotoPreview(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!uploadedPhoto) {
            alert('⚠️ Please upload a photo first!');
            return;
        }

        if (!contextDescription.trim()) {
            alert('⚠️ Please describe what you want the video to be!');
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setGeneratedVideo(null);

        // Simulate AI video generation process
        // In production, this would call your AI backend API
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        try {
            // Future enhancement: Replace with actual AI video generation API call
            // Example:
            // const formData = new FormData();
            // formData.append('photo', uploadedPhoto);
            // formData.append('style', selectedStyle);
            // formData.append('context', contextDescription);
            // formData.append('params', JSON.stringify(params));
            // 
            // const response = await fetch('/api/generate-video', {
            //   method: 'POST',
            //   body: formData,
            // });
            // const result = await response.json();
            // setGeneratedVideo(result.videoUrl);

            // Simulated delay
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Mock generated video (replace with actual API response)
            setGeneratedVideo({
                url: 'https://example.com/generated-video.mp4', // Placeholder
                thumbnail: photoPreview,
                style: selectedStyle,
                duration: params.duration,
                resolution: params.resolution,
                fps: params.fps,
            });

            clearInterval(progressInterval);
            setGenerationProgress(100);
            setIsGenerating(false);

        } catch (error) {
            console.error('Video generation failed:', error);
            alert('❌ Video generation failed: ' + error.message);
            clearInterval(progressInterval);
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        setUploadedPhoto(null);
        setPhotoPreview(null);
        setContextDescription('');
        setGeneratedVideo(null);
        setGenerationProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
            minHeight: '100vh',
            color: '#fff',
            padding: '30px',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    🎬 AI Video Generator
                </h1>
                <p style={{ color: '#aaa', fontSize: '16px' }}>
                    Drop a photo → Pick a style → Describe what you want → Generate CGI video
                </p>
            </div>

            {/* Main Layout: 3 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

                {/* COLUMN 1: Photo Upload */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#ff00ff' }}>
                        📸 Step 1: Upload Photo
                    </h2>

                    {/* Drag-and-Drop Zone */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: isDragging ? '3px dashed #00ffff' : '2px dashed rgba(255, 255, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '40px',
                            textAlign: 'center',
                            background: isDragging ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        {photoPreview ? (
                            <div>
                                <img
                                    src={photoPreview}
                                    alt="Uploaded"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '250px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                    }}
                                />
                                <p style={{ marginTop: '10px', fontSize: '14px', color: '#0f0' }}>
                                    ✅ Photo uploaded
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                                <p style={{ fontSize: '16px', color: '#fff', marginBottom: '5px' }}>
                                    Drag & Drop Photo Here
                                </p>
                                <p style={{ fontSize: '14px', color: '#888' }}>
                                    or click to browse
                                </p>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                                    Supports: JPG, PNG, GIF, WebP
                                </p>
                            </div>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {photoPreview && (
                        <button
                            onClick={handleReset}
                            style={{
                                marginTop: '15px',
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255, 0, 0, 0.2)',
                                border: '1px solid #ff4444',
                                borderRadius: '8px',
                                color: '#ff4444',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            🗑️ Clear Photo
                        </button>
                    )}
                </div>

                {/* COLUMN 2: Style & Context */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#00ffff' }}>
                        🎨 Step 2: Pick Style
                    </h2>

                    {/* Style Selector */}
                    <div style={{ marginBottom: '20px' }}>
                        <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                fontFamily: 'monospace',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            {VIDEO_STYLES.map(style => (
                                <option key={style.id} value={style.id}>
                                    {style.name}
                                </option>
                            ))}
                        </select>

                        {/* Style Description */}
                        <p style={{
                            marginTop: '10px',
                            fontSize: '14px',
                            color: '#aaa',
                            fontStyle: 'italic',
                        }}>
                            {VIDEO_STYLES.find(s => s.id === selectedStyle)?.description}
                        </p>
                    </div>

                    {/* Context Input */}
                    <h2 style={{ fontSize: '20px', marginBottom: '15px', marginTop: '30px', color: '#ffff00' }}>
                        ✍️ Step 3: Describe Context
                    </h2>

                    <textarea
                        value={contextDescription}
                        onChange={(e) => setContextDescription(e.target.value)}
                        placeholder="Describe what you want the video to be...&#10;&#10;Example: &quot;A character walking through a futuristic city at night, neon lights reflecting on wet streets, camera slowly zooming in&quot;"
                        style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: '12px',
                            fontSize: '14px',
                            fontFamily: 'Arial, sans-serif',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#fff',
                            resize: 'vertical',
                        }}
                    />

                    <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                        {contextDescription.length} characters
                    </p>

                    {/* Advanced Parameters */}
                    <details style={{ marginTop: '20px' }}>
                        <summary style={{
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#ff00ff',
                            padding: '10px',
                            background: 'rgba(255, 0, 255, 0.1)',
                            borderRadius: '8px',
                        }}>
                            ⚙️ Advanced Parameters
                        </summary>

                        <div style={{
                            marginTop: '15px',
                            padding: '15px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px',
                        }}>
                            {/* Duration */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#aaa' }}>
                                    Duration: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{params.duration}s</span>
                                </label>
                                <input
                                    type="range"
                                    min="3"
                                    max="30"
                                    value={params.duration}
                                    onChange={(e) => setParams({ ...params, duration: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Resolution */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#aaa' }}>
                                    Resolution
                                </label>
                                <select
                                    value={params.resolution}
                                    onChange={(e) => setParams({ ...params, resolution: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'monospace',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                    }}
                                >
                                    <option value="720p">720p (1280×720)</option>
                                    <option value="1080p">1080p (1920×1080)</option>
                                    <option value="4k">4K (3840×2160)</option>
                                </select>
                            </div>

                            {/* FPS */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#aaa' }}>
                                    Frame Rate: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{params.fps} FPS</span>
                                </label>
                                <select
                                    value={params.fps}
                                    onChange={(e) => setParams({ ...params, fps: parseInt(e.target.value) })}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'monospace',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                    }}
                                >
                                    <option value="24">24 FPS (Cinema)</option>
                                    <option value="30">30 FPS (Standard)</option>
                                    <option value="60">60 FPS (Smooth)</option>
                                </select>
                            </div>

                            {/* Motion Intensity */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#aaa' }}>
                                    Motion Intensity: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{params.motionIntensity}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={params.motionIntensity}
                                    onChange={(e) => setParams({ ...params, motionIntensity: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            {/* Camera Motion */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', color: '#aaa' }}>
                                    Camera Motion
                                </label>
                                <select
                                    value={params.cameraMotion}
                                    onChange={(e) => setParams({ ...params, cameraMotion: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'monospace',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                    }}
                                >
                                    <option value="static">Static (No movement)</option>
                                    <option value="slow">Slow (Subtle drift)</option>
                                    <option value="medium">Medium (Cinematic)</option>
                                    <option value="dynamic">Dynamic (Action)</option>
                                </select>
                            </div>

                            {/* Effects Toggles */}
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={params.particleEffects}
                                        onChange={(e) => setParams({ ...params, particleEffects: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontSize: '14px' }}>✨ Particle Effects</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={params.depthOfField}
                                        onChange={(e) => setParams({ ...params, depthOfField: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontSize: '14px' }}>🔍 Depth of Field (Blur background)</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={params.motionBlur}
                                        onChange={(e) => setParams({ ...params, motionBlur: e.target.checked })}
                                        style={{ marginRight: '8px' }}
                                    />
                                    <span style={{ fontSize: '14px' }}>💨 Motion Blur</span>
                                </label>
                            </div>
                        </div>
                    </details>
                </div>

                {/* COLUMN 3: Generate & Output */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#0f0' }}>
                        🚀 Step 4: Generate
                    </h2>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !uploadedPhoto || !contextDescription.trim()}
                        style={{
                            width: '100%',
                            padding: '20px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            background: isGenerating
                                ? 'rgba(128, 128, 128, 0.3)'
                                : uploadedPhoto && contextDescription.trim()
                                    ? 'linear-gradient(135deg, #00ff00, #00aa00)'
                                    : 'rgba(128, 128, 128, 0.2)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            cursor: isGenerating || !uploadedPhoto || !contextDescription.trim() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: uploadedPhoto && contextDescription.trim() && !isGenerating
                                ? '0 4px 15px rgba(0, 255, 0, 0.3)'
                                : 'none',
                        }}
                    >
                        {isGenerating ? '⏳ Generating...' : '🎬 Generate Video'}
                    </button>

                    {/* Progress Bar */}
                    {isGenerating && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                height: '30px',
                                position: 'relative',
                            }}>
                                <div style={{
                                    background: 'linear-gradient(90deg, #00ff00, #00ffff)',
                                    height: '100%',
                                    width: `${generationProgress}%`,
                                    transition: 'width 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                }}>
                                    {generationProgress}%
                                </div>
                            </div>

                            <p style={{ marginTop: '10px', fontSize: '14px', color: '#aaa', textAlign: 'center' }}>
                                {generationProgress < 30 && '📊 Analyzing photo...'}
                                {generationProgress >= 30 && generationProgress < 60 && '🎨 Applying style transfer...'}
                                {generationProgress >= 60 && generationProgress < 90 && '🎬 Generating frames...'}
                                {generationProgress >= 90 && '✨ Finalizing video...'}
                            </p>
                        </div>
                    )}

                    {/* Generated Video Output */}
                    {generatedVideo && (
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#0f0' }}>
                                ✅ Video Generated!
                            </h3>

                            {/* Video Preview */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '12px',
                                padding: '15px',
                                border: '2px solid #0f0',
                                boxShadow: '0 4px 15px rgba(0, 255, 0, 0.3)',
                            }}>
                                <img
                                    src={generatedVideo.thumbnail}
                                    alt="Video thumbnail"
                                    style={{
                                        width: '100%',
                                        borderRadius: '8px',
                                        marginBottom: '15px',
                                    }}
                                />

                                {/* Video Info */}
                                <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#aaa' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ color: '#0ff' }}>Style:</span> {VIDEO_STYLES.find(s => s.id === generatedVideo.style)?.name}
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ color: '#0ff' }}>Duration:</span> {generatedVideo.duration}s
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <span style={{ color: '#0ff' }}>Resolution:</span> {generatedVideo.resolution}
                                    </div>
                                    <div>
                                        <span style={{ color: '#0ff' }}>Frame Rate:</span> {generatedVideo.fps} FPS
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => alert('⬇️ Download feature will be implemented with actual AI backend')}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, #00aaff, #0066ff)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        ⬇️ Download
                                    </button>

                                    <button
                                        onClick={() => alert('💾 Save to profile feature coming soon!')}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, #ff00ff, #aa00ff)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        💾 Save to Profile
                                    </button>
                                </div>

                                <button
                                    onClick={handleReset}
                                    style={{
                                        width: '100%',
                                        marginTop: '10px',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    🔄 Generate Another
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {!isGenerating && !generatedVideo && (
                        <div style={{
                            marginTop: '30px',
                            padding: '15px',
                            background: 'rgba(0, 255, 255, 0.05)',
                            border: '1px solid rgba(0, 255, 255, 0.2)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#aaa',
                        }}>
                            <h4 style={{ color: '#0ff', marginBottom: '10px' }}>📝 Tips:</h4>
                            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                                <li>Be specific in your context description</li>
                                <li>Mention camera angles, lighting, atmosphere</li>
                                <li>Describe motion and actions clearly</li>
                                <li>Higher resolution = longer generation time</li>
                                <li>60 FPS creates smoother motion</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Backend Integration Notice - Only show in development */}
            {isDev && (
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: 'rgba(255, 255, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 0, 0.3)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#ffff00',
                }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>⚠️ Backend Integration Required</h3>
                    <p style={{ color: '#aaa', lineHeight: '1.6' }}>
                        This UI is complete and ready. To enable actual AI video generation, you'll need to:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '1.8', color: '#aaa' }}>
                        <li>Set up backend API endpoint (<code style={{ color: '#0ff' }}>/api/generate-video</code>)</li>
                        <li>Integrate AI model (Stable Diffusion Video, Runway ML, Pika Labs, or similar)</li>
                        <li>Handle file uploads and processing pipeline</li>
                        <li>Store generated videos (cloud storage)</li>
                        <li>Implement progress tracking (WebSocket or polling)</li>
                    </ul>
                    <p style={{ marginTop: '10px', color: '#888', fontSize: '12px' }}>
                        Currently showing simulated generation. Replace the TODO section in <code>handleGenerate()</code> with your API call.
                    </p>
                </div>
            )}
        </div>
    );
};
