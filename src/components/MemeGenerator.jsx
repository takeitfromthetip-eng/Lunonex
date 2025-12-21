/* eslint-disable */
import React, { useState, useRef } from 'react';

/**
 * MemeGenerator - Create viral memes with text overlays
 * Classic top/bottom text, custom positioning, font options
 */
export function MemeGenerator() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');
    const [fontSize, setFontSize] = useState(48);
    const [fontColor, setFontColor] = useState('#FFFFFF');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const POPULAR_TEMPLATES = [
        { id: 'drake', name: 'Drake Hotline', url: 'https://i.imgflip.com/30b1gx.jpg' },
        { id: 'distracted', name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
        { id: 'two-buttons', name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
        { id: 'change-my-mind', name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
        { id: 'uno-reverse', name: 'UNO Reverse', url: 'https://i.imgflip.com/4gqwe1.jpg' }
    ];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTemplateSelect = (templateUrl) => {
        setSelectedImage(templateUrl);
    };

    const downloadMeme = () => {
        if (!canvasRef.current || !selectedImage) return;

        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            padding: '30px',
            color: '#fff'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px'
            }}>
                {/* Left Panel - Controls */}
                <div>
                    <h3 style={{ marginBottom: '20px', color: '#667eea' }}>📝 Meme Settings</h3>

                    {/* Image Upload */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                            Upload Image
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(102, 126, 234, 0.2)',
                                border: '2px dashed #667eea',
                                borderRadius: '8px',
                                color: '#667eea',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            📤 Upload Custom Image
                        </button>
                    </div>

                    {/* Popular Templates */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                            Or Use Popular Template
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {POPULAR_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleTemplateSelect(template.url)}
                                    style={{
                                        padding: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {template.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Inputs */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                            Top Text
                        </label>
                        <input
                            type="text"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value.toUpperCase())}
                            placeholder="TOP TEXT"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                            Bottom Text
                        </label>
                        <input
                            type="text"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value.toUpperCase())}
                            placeholder="BOTTOM TEXT"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    {/* Font Size */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                            Font Size: {fontSize}px
                        </label>
                        <input
                            type="range"
                            min="24"
                            max="72"
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={downloadMeme}
                        disabled={!selectedImage}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: selectedImage ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: selectedImage ? 'pointer' : 'not-allowed',
                            opacity: selectedImage ? 1 : 0.5
                        }}
                    >
                        💾 Download Meme
                    </button>
                </div>

                {/* Right Panel - Preview */}
                <div>
                    <h3 style={{ marginBottom: '20px', color: '#667eea' }}>🖼️ Preview</h3>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        padding: '20px',
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        {selectedImage ? (
                            <div style={{ position: 'relative', maxWidth: '100%' }}>
                                <img
                                    src={selectedImage}
                                    alt="Meme"
                                    style={{
                                        maxWidth: '100%',
                                        borderRadius: '8px',
                                        display: 'block'
                                    }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    style={{ display: 'none' }}
                                />
                                {topText && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: `${fontSize}px`,
                                        fontWeight: 900,
                                        fontFamily: 'Impact, Arial Black, sans-serif',
                                        color: fontColor,
                                        textShadow: `
                                            ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
                                            -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                                            ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                                            -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
                                        `,
                                        textAlign: 'center',
                                        width: '90%',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {topText}
                                    </div>
                                )}
                                {bottomText && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: `${fontSize}px`,
                                        fontWeight: 900,
                                        fontFamily: 'Impact, Arial Black, sans-serif',
                                        color: fontColor,
                                        textShadow: `
                                            ${strokeWidth}px ${strokeWidth}px 0 ${strokeColor},
                                            -${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                                            ${strokeWidth}px -${strokeWidth}px 0 ${strokeColor},
                                            -${strokeWidth}px ${strokeWidth}px 0 ${strokeColor}
                                        `,
                                        textAlign: 'center',
                                        width: '90%',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {bottomText}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666' }}>
                                <p style={{ fontSize: '48px', marginBottom: '10px' }}>🖼️</p>
                                <p>Upload an image or select a template to start</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
