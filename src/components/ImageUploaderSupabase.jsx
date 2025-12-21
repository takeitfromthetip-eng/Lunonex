import React, { useState } from 'react';
import { uploadFiles } from '../utils/storageSupabase';
import { useAuth } from './AuthSupabase.jsx';
import './ImageUploader.css';

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function ImageUploaderSupabase({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const { user } = useAuth();

  const validateFile = (file) => {
    const errors = [];

    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type. Allowed: JPG, PNG, GIF, WEBP`);
    }

    if (file.size > MAX_SIZE_BYTES) {
      errors.push(`${file.name}: File too large. Max size: 10MB`);
    }

    return errors;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validationErrors = [];

    // Check file count
    if (files.length + selectedFiles.length > MAX_FILES) {
      validationErrors.push(`Maximum ${MAX_FILES} files allowed`);
      setErrors(validationErrors);
      return;
    }

    // Validate each file
    const validFiles = [];
    selectedFiles.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        validationErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(validationErrors);

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);

      // Generate previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, { file: file.name, url: reader.result }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setErrors([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrors(['Please select at least one file']);
      return;
    }

    if (!user) {
      setErrors(['You must be logged in to upload files']);
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      // Upload files to Supabase Storage
      const uploadedFiles = await uploadFiles(files, user.id);

      // Update progress for each file
      uploadedFiles.forEach((file, index) => {
        setUploadProgress(prev => ({
          ...prev,
          [files[index].name]: 100
        }));
      });

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles);
      }

      // Reset state
      setFiles([]);
      setPreviews([]);
      setUploadProgress({});

      alert(`✅ Successfully uploaded ${uploadedFiles.length} file(s)!`);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors([`Upload failed: ${error.message}`]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <h3>📤 Upload Artwork</h3>
        <p className="uploader-subtitle">
          Max {MAX_FILES} files • Max 10MB each • JPG, PNG, GIF, WEBP
        </p>
      </div>

      {errors.length > 0 && (
        <div className="uploader-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      <div className="upload-area">
        <input
          type="file"
          id="file-input"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          disabled={uploading || files.length >= MAX_FILES}
          style={{ display: 'none' }}
        />

        <label htmlFor="file-input" className={`upload-label ${uploading ? 'disabled' : ''}`}>
          <div className="upload-icon">🎨</div>
          <div className="upload-text">
            <strong>Click to upload</strong> or drag and drop
          </div>
          <div className="upload-hint">
            {files.length}/{MAX_FILES} files selected
          </div>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((preview, index) => (
            <div key={index} className="preview-item">
              <img src={preview.url} alt={`Preview ${index + 1}`} />
              <div className="preview-overlay">
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="remove-button"
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
              {uploading && uploadProgress[files[index].name] !== undefined && (
                <div className="upload-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${uploadProgress[files[index].name]}%` }}
                  />
                  <div className="progress-text">
                    {uploadProgress[files[index].name]}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="upload-actions">
          <button
            onClick={handleUpload}
            className="upload-button"
            disabled={uploading}
          >
            {uploading ? '⏳ Uploading...' : `📤 Upload ${files.length} File(s)`}
          </button>

          <button
            onClick={() => {
              setFiles([]);
              setPreviews([]);
              setErrors([]);
            }}
            className="clear-button"
            disabled={uploading}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploaderSupabase;
