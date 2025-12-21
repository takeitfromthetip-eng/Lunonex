import React, { useState } from 'react';

export function CGIConverter({ userId }) {
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = async (file, outputFormats) => {
    setConverting(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('formats', JSON.stringify(outputFormats));
      formData.append('userId', userId);

      const response = await fetch('/api/convert-cgi', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setProgress(100);

    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.message);
    } finally {
      setTimeout(() => {
        setConverting(false);
        setProgress(0);
      }, 2000);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white'
    }}>
      <h2 style={{
        fontSize: '32px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ fontSize: '48px' }}>🔄</span>
        CGI to VR/AR Converter
      </h2>
      <p style={{ marginBottom: '30px', opacity: 0.9 }}>
        Convert your CGI content to VR and AR formats while keeping the original
      </p>

      <ConversionUploader onConvert={handleConvert} converting={converting} />

      {converting && (
        <div style={{ marginTop: '30px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            height: '30px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {progress}% Converting...
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 0, 0, 0.2)',
          border: '2px solid rgba(255, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {result && (
        <ConversionResult result={result} />
      )}

      {/* Info Section */}
      <div style={{
        marginTop: '40px',
        padding: '25px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '15px'
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>📚 Supported Conversions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>🎬 Input Formats:</strong>
            <ul style={{ marginTop: '8px', marginLeft: '20px', lineHeight: '1.8' }}>
              <li>.mp4, .mov (video)</li>
              <li>.jpg, .png (images)</li>
              <li>.obj, .fbx (3D models)</li>
              <li>.blend (Blender files)</li>
            </ul>
          </div>
          <div>
            <strong>🥽 VR Output:</strong>
            <ul style={{ marginTop: '8px', marginLeft: '20px', lineHeight: '1.8' }}>
              <li>.glb (3D for VR)</li>
              <li>360° video</li>
              <li>Spatial audio</li>
              <li>Interactive scenes</li>
            </ul>
          </div>
          <div>
            <strong>👓 AR Output:</strong>
            <ul style={{ marginTop: '8px', marginLeft: '20px', lineHeight: '1.8' }}>
              <li>.usdz (iOS AR)</li>
              <li>.glb (Android AR)</li>
              <li>Optimized for mobile</li>
              <li>Plane detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionUploader({ onConvert, converting }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputFormats, setOutputFormats] = useState({ vr: true, ar: true, original: true });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onConvert(selectedFile, outputFormats);
    }
  };

  return (
    <div>
      <label
        htmlFor="cgi-upload"
        style={{
          display: 'block',
          background: converting ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
          border: '2px dashed rgba(255,255,255,0.5)',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: converting ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          marginBottom: '25px'
        }}
      >
        <input
          id="cgi-upload"
          type="file"
          accept=".mp4,.mov,.jpg,.jpeg,.png,.obj,.fbx,.blend,.glb,.gltf"
          onChange={handleFileSelect}
          disabled={converting}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>
          {selectedFile ? '✅' : '📤'}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          {selectedFile ? selectedFile.name : 'Click or drag CGI file here'}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Video, images, 3D models, or Blender files
        </div>
      </label>

      {selectedFile && (
        <>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px'
          }}>
            <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>
              Output Formats:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={outputFormats.original}
                  onChange={(e) => setOutputFormats({ ...outputFormats, original: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span>📁 Keep Original (unchanged)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={outputFormats.vr}
                  onChange={(e) => setOutputFormats({ ...outputFormats, vr: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span>🥽 VR Format (.glb optimized for VR headsets)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={outputFormats.ar}
                  onChange={(e) => setOutputFormats({ ...outputFormats, ar: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span>👓 AR Format (.usdz for iOS + .glb for Android)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={converting || (!outputFormats.vr && !outputFormats.ar && !outputFormats.original)}
            style={{
              width: '100%',
              background: converting ? 'rgba(255,255,255,0.3)' : 'white',
              color: converting ? 'white' : '#f5576c',
              border: 'none',
              padding: '18px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: converting ? 'not-allowed' : 'pointer'
            }}
          >
            {converting ? '⏳ Converting...' : '🔄 Start Conversion'}
          </button>
        </>
      )}
    </div>
  );
}

function ConversionResult({ result }) {
  return (
    <div style={{
      marginTop: '30px',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '12px',
      padding: '25px'
    }}>
      <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>✅ Conversion Complete!</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {result.files?.map((file, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {file.format === 'original' && '📁 Original'}
                {file.format === 'vr' && '🥽 VR Format'}
                {file.format === 'ar' && '👓 AR Format'}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {file.filename} ({formatFileSize(file.size)})
              </div>
            </div>
            <button
              onClick={() => window.open(file.url, '_blank')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
