import React, { useState, useRef, useEffect } from 'react';
import { aiUpscaler } from '../utils/aiUpscaler';
import { storageManager, STORES } from '../utils/storageManager';

/**
 * PhotoEnhancementSuite - Professional photo editing with auto-crop, pixel restoration, and enhancements
 * SIGNATURE FEATURE: Zoom & Enhance (AI Upscaling 2x/4x/8x)
 * Competes with professional editing software and social media filters
 * No monthly fees, no censorship
 */
export function PhotoEnhancementSuite({ userId }) {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [tool, setTool] = useState('enhance'); // 'enhance', 'crop', 'restore', 'batch', 'zoom'
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [upscaleScale, setUpscaleScale] = useState(4);
  const [upscaleMode, setUpscaleMode] = useState('auto');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [storageStats, setStorageStats] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file); // Store original file for AI upscaling

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        drawImage(img);
        addToHistory(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Load storage stats
  useEffect(() => {
    const loadStats = async () => {
      const quota = await storageManager.checkQuota();
      setStorageStats(quota);
    };
    loadStats();
  }, []);

  const drawImage = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };

  const addToHistory = (img) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(img);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      drawImage(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      drawImage(history[historyIndex + 1]);
    }
  };

  // AUTO-CROPPER: Intelligent cropping using edge detection
  const autoCrop = async () => {
    if (!image) return;
    setProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Find content boundaries by detecting non-white/non-transparent pixels
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];

          // Check if pixel is not background (not white and not transparent)
          if (a > 10 && (r < 250 || g < 250 || b < 250)) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      // Add padding
      const padding = 20;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(canvas.width, maxX + padding);
      maxY = Math.min(canvas.height, maxY + padding);

      const width = maxX - minX;
      const height = maxY - minY;

      // Create cropped image
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = width;
      croppedCanvas.height = height;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

      // Update canvas
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(croppedCanvas, 0, 0);

      setResult('Image auto-cropped successfully!');
    } catch (err) {
      setResult('Error cropping: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // PIXEL RESTORATION: Fill missing/damaged pixels using surrounding pixel data
  const restorePixels = async () => {
    if (!image) return;
    setProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Detect and fix missing/damaged pixels (transparent or pure white/black artifacts)
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const i = (y * canvas.width + x) * 4;
          const alpha = data[i + 3];

          // If pixel is transparent or looks damaged
          if (alpha < 10) {
            // Inpaint using average of surrounding 8 pixels
            let r = 0, g = 0, b = 0, count = 0;

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const ni = ((y + dy) * canvas.width + (x + dx)) * 4;
                if (data[ni + 3] > 10) {
                  r += data[ni];
                  g += data[ni + 1];
                  b += data[ni + 2];
                  count++;
                }
              }
            }

            if (count > 0) {
              data[i] = r / count;
              data[i + 1] = g / count;
              data[i + 2] = b / count;
              data[i + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setResult('Missing pixels restored successfully!');
    } catch (err) {
      setResult('Error restoring pixels: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // PHOTO ENHANCEMENT: Brightness, contrast, saturation, sharpness
  const enhancePhoto = async (options = {}) => {
    if (!image) return;
    setProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const brightness = options.brightness || 1.1;
      const contrast = options.contrast || 1.2;
      const saturation = options.saturation || 1.15;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply brightness
        r *= brightness;
        g *= brightness;
        b *= brightness;

        // Apply contrast
        r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

        // Apply saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + saturation * (r - gray);
        g = gray + saturation * (g - gray);
        b = gray + saturation * (b - gray);

        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      // Apply sharpening
      sharpenImage(imageData);

      ctx.putImageData(imageData, 0, 0);
      setResult('Photo enhanced successfully!');
    } catch (err) {
      setResult('Error enhancing: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const sharpenImage = (imageData) => {
    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const src = imageData.data;
    const sw = imageData.width;
    const sh = imageData.height;
    const w = sw;
    const h = sh;
    const output = new Uint8ClampedArray(src.length);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sy = y;
        const sx = x;
        const dstOff = (y * w + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = sy + cy - halfSide;
            const scx = sx + cx - halfSide;

            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              const srcOff = (scy * sw + scx) * 4;
              const wt = weights[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }

        output[dstOff] = Math.max(0, Math.min(255, r));
        output[dstOff + 1] = Math.max(0, Math.min(255, g));
        output[dstOff + 2] = Math.max(0, Math.min(255, b));
        output[dstOff + 3] = src[dstOff + 3];
      }
    }

    for (let i = 0; i < src.length; i++) {
      src[i] = output[i];
    }
  };

  // 🔥 ZOOM & ENHANCE - SIGNATURE FEATURE
  // AI-powered upscaling: 2x, 4x, or 8x resolution enhancement
  const zoomAndEnhance = async () => {
    if (!uploadedFile) {
      setResult('Please upload an image first!');
      return;
    }

    setProcessing(true);
    setResult(`🚀 Zoom & Enhance ${upscaleScale}x in progress...`);

    try {
      const startTime = Date.now();
      
      // Use AI upscaler (local or cloud depending on availability)
      const upscaleResult = await aiUpscaler.upscale(uploadedFile, {
        scale: upscaleScale,
        denoise: 'medium',
        mode: upscaleMode,
        useLocal: true,
        userId
      });

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

      // Load upscaled image into canvas
      const img = new Image();
      img.onload = () => {
        setImage(img);
        drawImage(img);
        addToHistory(img);
        setResult(`✅ Zoom & Enhance complete! ${upscaleResult.originalWidth}x${upscaleResult.originalHeight} → ${upscaleResult.width}x${upscaleResult.height} (${processingTime}s, ${upscaleResult.mode} mode)`);
      };
      img.src = upscaleResult.url;

      // Save to local/cloud storage
      if (userId) {
        await storageManager.saveSmart(
          STORES.IMAGES,
          'upscaled-images',
          {
            name: `enhanced_${upscaleScale}x_${uploadedFile.name}`,
            blob: upscaleResult.blob,
            type: 'image/png',
            size: upscaleResult.blob.size,
            scale: upscaleScale,
            originalName: uploadedFile.name
          },
          userId,
          { cloudSync: true }
        );
      }

    } catch (err) {
      console.error('Zoom & Enhance error:', err);
      setResult(`❌ Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'enhanced-photo.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          📸 Photo Enhancement Suite
        </h1>
      </div>

      {/* Tool Selection */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'zoom', icon: '🔥', label: 'ZOOM & ENHANCE' },
          { id: 'enhance', icon: '✨', label: 'Enhance' },
          { id: 'crop', icon: '✂️', label: 'Auto-Crop' },
          { id: 'restore', icon: '🔧', label: 'Restore Pixels' },
          { id: 'batch', icon: '📦', label: 'Batch Process' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            style={{
              background: tool === t.id ? (t.id === 'zoom' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white') : 'rgba(255,255,255,0.2)',
              color: tool === t.id && t.id !== 'zoom' ? '#1e3c72' : 'white',
              border: t.id === 'zoom' ? '2px solid #ffd700' : 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: t.id === 'zoom' && tool === t.id ? '0 0 20px rgba(255,215,0,0.5)' : 'none'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Upload Section */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          style={{
            background: 'white',
            color: '#1e3c72',
            padding: '15px 40px',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-block',
            transition: 'transform 0.2s'
          }}
        >
          📁 Upload Photo
        </label>
      </div>

      {/* Canvas Display */}
      {image && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      )}

      {/* ZOOM & ENHANCE Controls */}
      {tool === 'zoom' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.2) 100%)',
          border: '2px solid #ffd700',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 0 30px rgba(255,215,0,0.3)'
        }}>
          <h3 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
            🔥 ZOOM & ENHANCE - AI Upscaling
          </h3>
          <p style={{ textAlign: 'center', marginBottom: '20px', opacity: 0.9 }}>
            Enhance image resolution using neural networks. Works locally in your browser!
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Upscale Factor:
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {[2, 4, 8].map(scale => (
                <button
                  key={scale}
                  onClick={() => setUpscaleScale(scale)}
                  style={{
                    background: upscaleScale === scale ? '#ffd700' : 'rgba(255,255,255,0.2)',
                    color: upscaleScale === scale ? '#000' : '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {scale}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Mode:
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {['auto', 'anime', 'photo'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setUpscaleMode(mode)}
                  style={{
                    background: upscaleMode === mode ? '#ffd700' : 'rgba(255,255,255,0.2)',
                    color: upscaleMode === mode ? '#000' : '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={zoomAndEnhance}
            disabled={processing || !uploadedFile}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: '2px solid #ffd700',
              padding: '15px 40px',
              borderRadius: '30px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'block',
              margin: '0 auto',
              opacity: processing ? 0.6 : 1,
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
            }}
          >
            🚀 {processing ? 'Processing...' : 'ZOOM & ENHANCE'}
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {image && tool !== 'zoom' && (
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          {tool === 'enhance' && (
            <>
              <button onClick={() => enhancePhoto()} disabled={processing} style={buttonStyle}>
                ✨ Auto Enhance
              </button>
              <button onClick={() => enhancePhoto({ brightness: 1.2, contrast: 1.3, saturation: 1.2 })} disabled={processing} style={buttonStyle}>
                🌟 Maximum Enhance
              </button>
            </>
          )}
          {tool === 'crop' && (
            <button onClick={autoCrop} disabled={processing} style={buttonStyle}>
              ✂️ Auto-Crop
            </button>
          )}
          {tool === 'restore' && (
            <button onClick={restorePixels} disabled={processing} style={buttonStyle}>
              🔧 Restore Pixels
            </button>
          )}
          <button onClick={undo} disabled={historyIndex <= 0} style={buttonStyle}>
            ↶ Undo
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} style={buttonStyle}>
            ↷ Redo
          </button>
          <button onClick={downloadImage} style={{ ...buttonStyle, background: '#4CAF50' }}>
            💾 Download
          </button>
        </div>
      )}

      {/* Status */}
      {processing && (
        <div style={{ textAlign: 'center', fontSize: '18px', marginTop: '20px' }}>
          ⏳ Processing...
        </div>
      )}
      {result && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4CAF50',
          borderRadius: '10px',
          padding: '15px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          {result}
        </div>
      )}

      {/* Storage Stats */}
      {storageStats && (
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          <div style={{ marginBottom: '5px' }}>
            💾 Local Storage: {(storageStats.usage / 1024 / 1024).toFixed(2)} MB / {(storageStats.quota / 1024 / 1024).toFixed(2)} MB
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            height: '8px', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${storageStats.percentUsed}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50 0%, #FFC107 70%, #F44336 100%)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  background: 'white',
  color: '#1e3c72',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'transform 0.2s'
};
