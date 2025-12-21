/* eslint-disable */
import React, { useState } from 'react';

/**
 * DuplicatePhotoDetector - Find and remove duplicate photos using perceptual hashing
 * Uses average hash algorithm to detect similar images even if resized/compressed
 */
export function DuplicatePhotoDetector({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState(new Set());

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
            data: event.target.result
          });
          loaded++;
          if (loaded === files.length) {
            setPhotos(loadedPhotos);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Calculate perceptual hash for image comparison
  const calculateHash = (img) => {
    const canvas = document.createElement('canvas');
    const size = 8; // 8x8 grid for hash
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Calculate average brightness
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avg = sum / (size * size);

    // Generate hash: 1 if brighter than average, 0 if darker
    let hash = '';
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      hash += brightness > avg ? '1' : '0';
    }

    return hash;
  };

  // Calculate Hamming distance between two hashes
  const hammingDistance = (hash1, hash2) => {
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }
    return distance;
  };

  const scanForDuplicates = () => {
    setScanning(true);
    setDuplicates([]);

    setTimeout(() => {
      const hashes = photos.map(photo => ({
        ...photo,
        hash: calculateHash(photo.img)
      }));

      const duplicateGroups = [];
      const processed = new Set();

      hashes.forEach((photo1, i) => {
        if (processed.has(photo1.id)) return;

        const group = [photo1];
        hashes.forEach((photo2, j) => {
          if (i !== j && !processed.has(photo2.id)) {
            const distance = hammingDistance(photo1.hash, photo2.hash);
            // Threshold: 5 bits difference allows for minor variations
            if (distance <= 5) {
              group.push(photo2);
              processed.add(photo2.id);
            }
          }
        });

        if (group.length > 1) {
          processed.add(photo1.id);
          duplicateGroups.push(group);
        }
      });

      setDuplicates(duplicateGroups);
      setScanning(false);
    }, 500);
  };

  const toggleSelection = (photoId) => {
    const newSelection = new Set(selectedForDeletion);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedForDeletion(newSelection);
  };

  const autoSelectDuplicates = () => {
    // Auto-select all but the first photo in each duplicate group (keep largest file)
    const newSelection = new Set();
    duplicates.forEach(group => {
      // Sort by file size (keep largest)
      const sorted = [...group].sort((a, b) => b.size - a.size);
      sorted.slice(1).forEach(photo => newSelection.add(photo.id));
    });
    setSelectedForDeletion(newSelection);
  };

  const deleteSelected = () => {
    const remaining = photos.filter(photo => !selectedForDeletion.has(photo.id));
    setPhotos(remaining);
    setSelectedForDeletion(new Set());
    setDuplicates([]);
    alert(`Deleted ${selectedForDeletion.size} duplicate photos!`);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          🔍 Duplicate Photo Detector
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          Find and remove duplicate photos automatically
        </p>
        <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
          Uses perceptual hashing to detect duplicates even if resized or compressed
        </p>
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
          id="multiple-upload"
        />
        <label
          htmlFor="multiple-upload"
          style={{
            background: 'white',
            color: '#667eea',
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

      {/* Scan Button */}
      {photos.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={scanForDuplicates}
            disabled={scanning}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '15px 40px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: scanning ? 'not-allowed' : 'pointer',
              opacity: scanning ? 0.6 : 1
            }}
          >
            {scanning ? '🔄 Scanning...' : '🔍 Scan for Duplicates'}
          </button>
        </div>
      )}

      {/* Results */}
      {duplicates.length > 0 && (
        <>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
              Found {duplicates.reduce((sum, group) => sum + group.length, 0)} duplicates in {duplicates.length} groups
            </h2>

            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={autoSelectDuplicates}
                style={buttonStyle}
              >
                ✓ Auto-Select Duplicates
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedForDeletion.size === 0}
                style={{
                  ...buttonStyle,
                  background: selectedForDeletion.size > 0 ? '#f44336' : 'rgba(255,255,255,0.3)',
                  cursor: selectedForDeletion.size > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                🗑️ Delete Selected ({selectedForDeletion.size})
              </button>
            </div>

            {/* Duplicate Groups */}
            {duplicates.map((group, groupIndex) => (
              <div
                key={groupIndex}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px'
                }}
              >
                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                  Duplicate Group {groupIndex + 1} ({group.length} photos)
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '15px'
                }}>
                  {group.map(photo => (
                    <div
                      key={photo.id}
                      onClick={() => toggleSelection(photo.id)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        border: selectedForDeletion.has(photo.id) ? '4px solid #f44336' : '2px solid rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        padding: '10px',
                        background: selectedForDeletion.has(photo.id) ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s'
                      }}
                    >
                      <img
                        src={photo.data}
                        alt={photo.name}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '5px',
                          marginBottom: '10px'
                        }}
                      />
                      <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {photo.name}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>
                        {(photo.size / 1024).toFixed(1)} KB
                      </div>
                      {selectedForDeletion.has(photo.id) && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#f44336',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* No Duplicates */}
      {!scanning && duplicates.length === 0 && photos.length > 0 && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4CAF50',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
          <h2 style={{ fontSize: '24px' }}>No Duplicates Found!</h2>
          <p style={{ marginTop: '10px', opacity: 0.9 }}>
            All {photos.length} photos are unique
          </p>
        </div>
      )}

      {/* How It Works */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginTop: '30px'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>🎯 How It Works</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            'Perceptual Hashing: Creates a unique fingerprint for each image',
            'Hamming Distance: Compares image fingerprints to find similarities',
            'Smart Detection: Finds duplicates even if resized, compressed, or slightly edited',
            'Auto-Select: Automatically selects duplicates while keeping the best quality',
            'Safe Deletion: Review before deleting - you have full control',
            'Fast Processing: Scans hundreds of photos in seconds'
          ].map((feature, i) => (
            <li key={i} style={{
              padding: '10px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const buttonStyle = {
  background: 'white',
  color: '#667eea',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '25px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s'
};
