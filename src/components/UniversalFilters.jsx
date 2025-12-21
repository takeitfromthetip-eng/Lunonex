/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { saveFileWithDialog, FILE_TYPES } from '../utils/fileSaveDialog';
import * as faceapi from '@vladmandic/face-api';

/**
 * Universal AR/Photo Filters - Works everywhere (Social Feed, Creator Economy, Photo Tools)
 * Snapchat-style filters but unique and different
 * FREE to use - not locked behind paywall
 */
export default function UniversalFilters({ 
  imageUrl, 
  onFilterApply, 
  compact = false,
  autoDetectFaces = true 
}) {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [faceDetections, setFaceDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Unique filter presets (not like Snapchat)
  const filters = [
    {
      id: 'anime',
      name: 'Anime Eyes',
      icon: '👁️',
      free: true,
      apply: (ctx, face) => {
        // Big anime eyes effect
        const leftEye = face.landmarks.getLeftEye();
        const rightEye = face.landmarks.getRightEye();
        
        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Draw big anime eyes
        [leftEye, rightEye].forEach(eye => {
          const centerX = eye.reduce((sum, p) => sum + p.x, 0) / eye.length;
          const centerY = eye.reduce((sum, p) => sum + p.y, 0) / eye.length;
          const radius = 25;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Pupil
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          
          // Sparkle
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(centerX - 5, centerY - 5, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
    },
    {
      id: 'neon',
      name: 'Neon Glow',
      icon: '✨',
      free: true,
      apply: (ctx, face) => {
        // Neon outline around face
        ctx.save();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        
        const jaw = face.landmarks.getJawOutline();
        ctx.beginPath();
        ctx.moveTo(jaw[0].x, jaw[0].y);
        jaw.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
      }
    },
    {
      id: 'glitch',
      name: 'Glitch',
      icon: '📺',
      free: true,
      apply: (ctx, face) => {
        // RGB split glitch effect
        const box = face.detection.box;
        const imageData = ctx.getImageData(box.x, box.y, box.width, box.height);
        const data = imageData.data;
        
        // Shift red and blue channels
        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() > 0.95) {
            data[i] = data[i + 8] || data[i]; // R
            data[i + 2] = data[i - 8] || data[i + 2]; // B
          }
        }
        ctx.putImageData(imageData, box.x, box.y);
      }
    },
    {
      id: 'sparkle',
      name: 'Sparkle Crown',
      icon: '👑',
      free: true,
      apply: (ctx, face) => {
        // Sparkles above head
        const nose = face.landmarks.getNose();
        const topY = Math.min(...nose.map(p => p.y)) - 60;
        const centerX = nose[0].x;
        
        ctx.save();
        for (let i = 0; i < 5; i++) {
          const x = centerX + (i - 2) * 30;
          const y = topY - Math.abs(i - 2) * 10;
          
          ctx.fillStyle = `hsl(${i * 70}, 100%, 70%)`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = ctx.fillStyle;
          
          // Draw star
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = j % 2 === 0 ? 12 : 6;
            ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      icon: '🤖',
      free: true,
      apply: (ctx, face) => {
        // Cyberpunk face augmentation
        const leftEye = face.landmarks.getLeftEye();
        const rightEye = face.landmarks.getRightEye();
        
        ctx.save();
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        
        [leftEye, rightEye].forEach(eye => {
          const centerX = eye.reduce((sum, p) => sum + p.x, 0) / eye.length;
          const centerY = eye.reduce((sum, p) => sum + p.y, 0) / eye.length;
          
          // Draw tech lines
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const x1 = centerX + 20 * Math.cos(angle);
            const y1 = centerY + 20 * Math.sin(angle);
            const x2 = centerX + 35 * Math.cos(angle);
            const y2 = centerY + 35 * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
          
          // Circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.restore();
      }
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: '🌈',
      free: true,
      apply: (ctx, face) => {
        // Rainbow gradient overlay
        const box = face.detection.box;
        const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.width, box.y + box.height);
        
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(0.2, 'rgba(255, 127, 0, 0.3)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.3)');
        gradient.addColorStop(0.6, 'rgba(0, 255, 0, 0.3)');
        gradient.addColorStop(0.8, 'rgba(0, 0, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(148, 0, 211, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(box.x, box.y, box.width, box.height);
      }
    },
    {
      id: 'fire',
      name: 'Fire Eyes',
      icon: '🔥',
      free: true,
      apply: (ctx, face) => {
        // Flaming eyes effect
        const leftEye = face.landmarks.getLeftEye();
        const rightEye = face.landmarks.getRightEye();
        
        [leftEye, rightEye].forEach(eye => {
          const centerX = eye.reduce((sum, p) => sum + p.x, 0) / eye.length;
          const centerY = eye.reduce((sum, p) => sum + p.y, 0) / eye.length;
          
          // Draw fire particles
          for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle) - 10;
            const size = Math.random() * 8 + 2;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.5, '#ff4500');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    },
    {
      id: 'galaxy',
      name: 'Galaxy',
      icon: '🌌',
      free: true,
      apply: (ctx, face) => {
        // Galaxy effect around face
        const box = face.detection.box;
        
        for (let i = 0; i < 50; i++) {
          const x = box.x + Math.random() * box.width;
          const y = box.y + Math.random() * box.height;
          const size = Math.random() * 3;
          
          ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 70%)`;
          ctx.shadowBlur = 5;
          ctx.shadowColor = ctx.fillStyle;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  ];

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      } catch (err) {
        console.warn('Face detection models not loaded:', err);
      }
    };
    loadModels();
  }, []);

  // Detect faces when image loads
  useEffect(() => {
    if (imageUrl && autoDetectFaces) {
      detectFaces();
    }
  }, [imageUrl, autoDetectFaces]);

  const detectFaces = async () => {
    if (!imageRef.current) return;
    
    setLoading(true);
    try {
      const detections = await faceapi
        .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      
      setFaceDetections(detections);
    } catch (err) {
      console.error('Face detection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (filter) => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Apply filter to each detected face
    faceDetections.forEach(face => {
      filter.apply(ctx, face);
    });
    
    // Return filtered image
    if (onFilterApply) {
      canvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        onFilterApply(url, filter.id, blob);
      });
    }
    
    setSelectedFilter(filter.id);
  };

  if (compact) {
    // Compact mode for social feed/inline use
    return (
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '8px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '8px',
        overflowX: 'auto'
      }}>
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => applyFilter(filter)}
            style={{
              padding: '8px',
              background: selectedFilter === filter.id ? '#667eea' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              minWidth: '48px'
            }}
            title={filter.name}
          >
            {filter.icon}
          </button>
        ))}
        
        <img 
          ref={imageRef} 
          src={imageUrl} 
          style={{ display: 'none' }}
          crossOrigin="anonymous"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }

  // Full mode for photo tools
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
      borderRadius: '12px',
      color: 'white'
    }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.5rem' }}>✨</span>
        AR Filters (Free)
      </h3>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
          Detecting faces...
        </div>
      )}

      {faceDetections.length === 0 && !loading && (
        <div style={{ 
          padding: '16px', 
          background: 'rgba(255,165,0,0.1)', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          ⚠️ No faces detected. Filters work best with clear face photos.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => applyFilter(filter)}
            disabled={faceDetections.length === 0}
            style={{
              padding: '16px',
              background: selectedFilter === filter.id 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              cursor: faceDetections.length === 0 ? 'not-allowed' : 'pointer',
              opacity: faceDetections.length === 0 ? 0.5 : 1,
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{filter.icon}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {filter.name}
            </span>
            {filter.free && (
              <span style={{ 
                fontSize: '0.7rem', 
                background: '#10b981', 
                padding: '2px 6px', 
                borderRadius: '4px' 
              }}>
                FREE
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Hidden elements for processing */}
      <img 
        ref={imageRef} 
        src={imageUrl} 
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        onLoad={autoDetectFaces ? detectFaces : null}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Preview */}
      {selectedFilter && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '12px' }}>Preview:</h4>
          <canvas 
            ref={canvasRef} 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }} 
          />
        </div>
      )}
    </div>
  );
}
