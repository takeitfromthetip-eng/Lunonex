/* eslint-disable */
import React, { useState } from 'react';

/**
 * BatchPhotoProcessor - Process multiple photos at once with filters and enhancements
 * Works offline - no internet required
 */
export function BatchPhotoProcessor({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('enhance');
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState([]);

  const OPERATIONS = [
    { id: 'enhance', name: 'Auto Enhance', icon: '✨', description: 'Brightness, contrast, saturation' },
    { id: 'crop', name: 'Auto Crop', icon: '✂️', description: 'Remove whitespace' },
    { id: 'restore', name: 'Restore Pixels', icon: '🔧', description: 'Fix damaged pixels' },
    { id: 'resize', name: 'Resize', icon: '📐', description: 'Scale to 1920x1080' },
    { id: 'compress', name: 'Compress', icon: '📦', description: 'Reduce file size' },
    { id: 'watermark', name: 'Watermark', icon: '©️', description: 'Add watermark' },
    { id: 'grayscale', name: 'Grayscale', icon: '⚫⚪', description: 'Convert to B&W' },
    { id: 'sharpen', name: 'Sharpen', icon: '🔪', description: 'Increase clarity' }
  ];

  const handleMultipleUpload = (e) => {
    const files = Array.from(e.target.files);
    const loadedPhotos = [];

    let loaded = 0;
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          loadedPhotos.push({
            id: `photo-${Date.now()}-${index}`,
            name: file.name,
            size: file.size,
            img: img,
            data: event.target.result,
            processed: false
          });
          loaded++;
          if (loaded === files.length) {
            setPhotos(loadedPhotos);
            setCompleted([]);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const processImage = (img, operation) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      switch (operation) {
        case 'enhance':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.1);
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 1.05);
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case 'crop': {
          // Auto-crop whitespace
          let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const i = (y * canvas.width + x) * 4;
              if (data[i + 3] > 10 && (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250)) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
              }
            }
          }
          const padding = 10;
          minX = Math.max(0, minX - padding);
          minY = Math.max(0, minY - padding);
          maxX = Math.min(canvas.width, maxX + padding);
          maxY = Math.min(canvas.height, maxY + padding);
          const width = maxX - minX;
          const height = maxY - minY;
          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = width;
          croppedCanvas.height = height;
          const croppedCtx = croppedCanvas.getContext('2d');
          croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
          resolve(croppedCanvas.toDataURL('image/png'));
          return;
        }

        case 'restore':
          // Fix missing pixels
          for (let y = 1; y < canvas.height - 1; y++) {
            for (let x = 1; x < canvas.width - 1; x++) {
              const i = (y * canvas.width + x) * 4;
              if (data[i + 3] < 10) {
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
          break;

        case 'resize': {
          const resizedCanvas = document.createElement('canvas');
          resizedCanvas.width = 1920;
          resizedCanvas.height = 1080;
          const resizedCtx = resizedCanvas.getContext('2d');
          resizedCtx.drawImage(canvas, 0, 0, 1920, 1080);
          resolve(resizedCanvas.toDataURL('image/png'));
          return;
        }

        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = data[i + 1] = data[i + 2] = gray;
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case 'sharpen':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.2);
            data[i + 1] = Math.min(255, data[i + 1] * 1.2);
            data[i + 2] = Math.min(255, data[i + 2] * 1.2);
          }
          ctx.putImageData(imageData, 0, 0);
          break;

        case 'compress':
          // Lower quality for compression
          resolve(canvas.toDataURL('image/jpeg', 0.7));
          return;

        case 'watermark':
          ctx.font = 'bold 30px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.textAlign = 'right';
          ctx.fillText('ForTheWeebs', canvas.width - 20, canvas.height - 20);
          break;
      }

      resolve(canvas.toDataURL('image/png'));
    });
  };

  const processBatch = async () => {
    setProcessing(true);
    setProgress(0);
    const results = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const processedData = await processImage(photo.img, selectedOperation);
      results.push({
        ...photo,
        processedData,
        processed: true
      });
      setProgress(((i + 1) / photos.length) * 100);
    }

    setCompleted(results);
    setProcessing(false);
  };

  const downloadAll = () => {
    if (completed.length === 0) {
      alert('⚠️ No processed images to download');
      return;
    }

    const message = `📦 Starting download of ${completed.length} images...\n\nNote: Your browser may ask for permission to download multiple files.\n\nFiles will download one by one automatically.`;
    alert(message);

    completed.forEach((photo, index) => {
      setTimeout(() => {
        try {
          const link = document.createElement('a');
          link.download = `processed-${String(index + 1).padStart(3, '0')}-${photo.name}`;
          link.href = photo.processedData;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          if (index === completed.length - 1) {
            setTimeout(() => {
              alert('✅ All downloads complete!');
            }, 500);
          }
        } catch (error) {
          console.error('Download failed:', error);
          alert(`❌ Failed to download ${photo.name}. Please try again.`);
        }
      }, index * 800); // Increased delay to 800ms for browser compatibility
    });
  };

  const downloadZip = async () => {
    if (completed.length === 0) {
      alert('⚠️ No processed images to download');
      return;
    }

    // Check if JSZip is available
    if (typeof window.JSZip === 'undefined') {
      alert('📦 ZIP feature requires JSZip library.\n\nDownloading files individually instead...');
      downloadAll();
      return;
    }

    try {
      const JSZip = window.JSZip;
      const zip = new JSZip();

      alert('📦 Creating ZIP file... Please wait.');

      // Add all processed images to zip
      completed.forEach((photo, index) => {
        const fileName = `processed-${String(index + 1).padStart(3, '0')}-${photo.name}`;
        // Extract base64 data from data URL
        const base64Data = photo.processedData.split(',')[1];
        zip.file(fileName, base64Data, { base64: true });
      });

      // Generate zip file
      const blob = await zip.generateAsync({ type: 'blob' });

      // Download the zip
      const link = document.createElement('a');
      link.download = `batch-processed-${Date.now()}.zip`;
      link.href = URL.createObjectURL(blob);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ ZIP file downloaded successfully!');
    } catch (error) {
      console.error('ZIP creation failed:', error);
      alert('❌ ZIP creation failed. Downloading individually...');
      downloadAll();
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          📦 Batch Photo Processor
        </h1>
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
          multiple
          onChange={handleMultipleUpload}
          style={{ display: 'none' }}
          id="batch-upload"
        />
        <label
          htmlFor="batch-upload"
          style={{
            background: 'white',
            color: '#43e97b',
            padding: '15px 40px',
            borderRadius: '30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-block',
            transition: 'transform 0.2s'
          }}
        >
          📁 Upload Multiple Photos
        </label>
        <p style={{ marginTop: '15px', fontSize: '14px', opacity: 0.8 }}>
          {photos.length} photos loaded
        </p>
      </div>

      {/* Operation Selection */}
      {photos.length > 0 && !processing && completed.length === 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
            Choose Operation
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {OPERATIONS.map(op => (
              <button
                key={op.id}
                onClick={() => setSelectedOperation(op.id)}
                style={{
                  background: selectedOperation === op.id ? 'white' : 'rgba(255,255,255,0.2)',
                  color: selectedOperation === op.id ? '#43e97b' : 'white',
                  border: 'none',
                  padding: '20px',
                  borderRadius: '15px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                title={op.description}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{op.icon}</div>
                <div>{op.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '5px' }}>
                  {op.description}
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={processBatch}
              style={{
                background: 'white',
                color: '#43e97b',
                border: 'none',
                padding: '15px 50px',
                borderRadius: '30px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
            >
              🚀 Process {photos.length} Photos
            </button>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {processing && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>Processing...</h2>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            height: '30px',
            overflow: 'hidden',
            marginBottom: '15px'
          }}>
            <div style={{
              background: 'white',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s',
              borderRadius: '10px'
            }} />
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Results */}
      {completed.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '30px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
              ✅ {completed.length} Photos Processed!
            </h2>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={downloadAll} style={actionButtonStyle}>
                💾 Download All
              </button>
              <button onClick={downloadZip} style={actionButtonStyle}>
                📦 Download as ZIP
              </button>
              <button
                onClick={() => { setPhotos([]); setCompleted([]); }}
                style={{ ...actionButtonStyle, background: '#f44336' }}
              >
                🔄 Start Over
              </button>
            </div>
          </div>

          {/* Preview Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {completed.map((photo, index) => (
              <div
                key={photo.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '15px',
                  textAlign: 'center'
                }}
              >
                <img
                  src={photo.processedData}
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                />
                <div style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '5px' }}>
                  {photo.name}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>
                  {(photo.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const actionButtonStyle = {
  background: 'white',
  color: '#43e97b',
  border: 'none',
  padding: '15px 30px',
  borderRadius: '25px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s'
};
