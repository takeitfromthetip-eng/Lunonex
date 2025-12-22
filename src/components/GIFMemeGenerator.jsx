import React, { useState, useRef, useEffect } from 'react';

const GIFMemeGenerator = () => {
  const [mode, setMode] = useState('gif'); // 'gif' or 'meme'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [frames, setFrames] = useState([]);
  const [fps, setFps] = useState(10);
  const canvasRef = useRef(null);

  const memeTemplates = [
    { id: 'drake', name: 'Drake', url: 'https://i.imgflip.com/30b1gx.jpg', topY: 120, bottomY: 370 },
    { id: 'distracted', name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg', topY: 50, bottomY: 350 },
    { id: 'two-buttons', name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg', topY: 60, bottomY: 300 },
    { id: 'change-my-mind', name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg', topY: 250, bottomY: 400 },
    { id: 'expanding-brain', name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg', topY: 50, bottomY: 450 },
    { id: 'woman-yelling', name: 'Woman Yelling at Cat', url: 'https://i.imgflip.com/345v97.jpg', topY: 30, bottomY: 350 },
  ];

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw text
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.font = 'bold 48px Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top text
      if (topText) {
        const topY = selectedTemplate.topY || canvas.height * 0.15;
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY);
      }

      // Bottom text
      if (bottomText) {
        const bottomY = selectedTemplate.bottomY || canvas.height * 0.85;
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
      }
    };
    img.src = selectedTemplate.url;
  };

  useEffect(() => {
    if (mode === 'meme' && selectedTemplate) {
      drawMeme();
    }
  }, [selectedTemplate, topText, bottomText, mode]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        if (mode === 'gif') {
          // Add frame to GIF
          setFrames([...frames, event.target.result]);
        } else {
          // Use as meme template
          setSelectedTemplate({ url: event.target.result, topY: 50, bottomY: 350 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const createGIF = async () => {
    if (frames.length === 0) {
      alert('Add at least one frame to create a GIF!');
      return;
    }

    alert(`Creating GIF with ${frames.length} frames at ${fps} FPS...`);
    // In production, use library like gif.js to encode actual GIF
    // For now, just download frames
    frames.forEach((frame, index) => {
      const link = document.createElement('a');
      link.download = `frame-${index + 1}.png`;
      link.href = frame;
      link.click();
    });
  };

  const removeFrame = (index) => {
    setFrames(frames.filter((_, i) => i !== index));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎭 GIF & Meme Generator</h1>

      <div style={styles.modeSwitch}>
        <button
          onClick={() => setMode('gif')}
          style={{...styles.modeBtn, ...(mode === 'gif' ? styles.activeMode : {})}}
        >
          🎬 GIF Generator
        </button>
        <button
          onClick={() => setMode('meme')}
          style={{...styles.modeBtn, ...(mode === 'meme' ? styles.activeMode : {})}}
        >
          😂 Meme Generator
        </button>
      </div>

      {mode === 'meme' && (
        <>
          <div style={styles.section}>
            <h2>Choose Template</h2>
            <div style={styles.templateGrid}>
              {memeTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{
                    ...styles.templateCard,
                    ...(selectedTemplate?.id === template.id ? styles.selectedTemplate : {})
                  }}
                >
                  <img src={template.url} alt={template.name} style={styles.templateImg} />
                  <p>{template.name}</p>
                </div>
              ))}
            </div>
            <div style={styles.uploadSection}>
              <label style={styles.uploadBtn}>
                📁 Upload Custom Image
                <input type="file" accept="image/*" onChange={handleImageUpload} style={styles.fileInput} />
              </label>
            </div>
          </div>

          <div style={styles.section}>
            <h2>Add Text</h2>
            <input
              type="text"
              placeholder="TOP TEXT"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              style={styles.textInput}
            />
            <input
              type="text"
              placeholder="BOTTOM TEXT"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              style={styles.textInput}
            />
          </div>

          <div style={styles.section}>
            <h2>Preview</h2>
            <canvas ref={canvasRef} style={styles.canvas}></canvas>
          </div>

          <button onClick={downloadMeme} style={styles.downloadBtn}>
            ⬇️ Download Meme
          </button>
        </>
      )}

      {mode === 'gif' && (
        <>
          <div style={styles.section}>
            <h2>Add Frames</h2>
            <label style={styles.uploadBtn}>
              📁 Upload Frame
              <input type="file" accept="image/*" onChange={handleImageUpload} style={styles.fileInput} />
            </label>

            <div style={styles.framesGrid}>
              {frames.map((frame, index) => (
                <div key={index} style={styles.frameCard}>
                  <img src={frame} alt={`Frame ${index + 1}`} style={styles.frameImg} />
                  <button onClick={() => removeFrame(index)} style={styles.removeBtn}>
                    ❌
                  </button>
                  <p>Frame {index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h2>GIF Settings</h2>
            <label style={styles.label}>
              Frame Rate: {fps} FPS
              <input
                type="range"
                min="1"
                max="30"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                style={styles.slider}
              />
            </label>
          </div>

          <button onClick={createGIF} style={styles.downloadBtn}>
            🎬 Create GIF ({frames.length} frames)
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#1a1a2e',
    minHeight: '100vh',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  modeSwitch: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem',
  },
  modeBtn: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    border: '2px solid #667eea',
    background: 'transparent',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  activeMode: {
    background: '#667eea',
  },
  section: {
    background: 'rgba(255,255,255,0.05)',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  templateCard: {
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '2px solid transparent',
    transition: 'all 0.3s',
    textAlign: 'center',
  },
  selectedTemplate: {
    border: '2px solid #10b981',
    background: 'rgba(16, 185, 129, 0.2)',
  },
  templateImg: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  uploadSection: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  uploadBtn: {
    display: 'inline-block',
    padding: '1rem 2rem',
    background: '#667eea',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  fileInput: {
    display: 'none',
  },
  textInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.2rem',
    marginBottom: '1rem',
    background: '#2d2d44',
    border: '2px solid #667eea',
    borderRadius: '8px',
    color: 'white',
  },
  canvas: {
    maxWidth: '100%',
    border: '2px solid #667eea',
    borderRadius: '8px',
  },
  downloadBtn: {
    width: '100%',
    padding: '1.5rem',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  framesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  frameCard: {
    position: 'relative',
    textAlign: 'center',
  },
  frameImg: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  removeBtn: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
  },
  label: {
    display: 'block',
    marginBottom: '1rem',
  },
  slider: {
    width: '100%',
    marginTop: '0.5rem',
  },
};

export default GIFMemeGenerator;
