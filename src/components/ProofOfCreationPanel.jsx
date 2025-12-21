import React, { useState, useEffect } from 'react';
import { proofOfCreation } from '../lib/proofOfCreation';
import './ProofOfCreationPanel.css';

export default function ProofOfCreationPanel({ artifactId, creatorId, file }) {
  const [proof, setProof] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if proof already exists
    const existingProofs = proofOfCreation.getCreatorProofs(creatorId);
    const existingProof = existingProofs.find(p => p.artifactId === artifactId);
    if (existingProof) {
      setProof(existingProof);
    }
  }, [artifactId, creatorId]);

  const generateProof = async () => {
    if (!file) {
      alert('No file provided');
      return;
    }

    setIsGenerating(true);
    try {
      const newProof = await proofOfCreation.generateProof(
        artifactId,
        creatorId,
        file,
        {
          filename: file.name,
          dimensions: await getImageDimensions(file),
        }
      );
      
      setProof(newProof);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate proof:', error);
      alert('Failed to generate proof');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCert = async () => {
    if (!proof) return;

    try {
      const cert = await proofOfCreation.generateCertificate(artifactId);
      setCertificate(cert);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      alert('Failed to generate certificate');
    }
  };

  const exportProof = () => {
    const json = proofOfCreation.exportProof(artifactId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof-of-creation-${artifactId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyVerificationUrl = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.verificationUrl);
    alert('Verification URL copied to clipboard!');
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  if (!proof) {
    return (
      <div className="proof-panel empty">
        <div className="proof-icon">🔐</div>
        <h3>Proof of Creation</h3>
        <p>Generate cryptographic proof that you created this content.</p>
        <ul className="benefits-list">
          <li>✓ Timestamped ownership record</li>
          <li>✓ Content fingerprint verification</li>
          <li>✓ DMCA takedown assistance</li>
          <li>✓ Blockchain-ready (coming soon)</li>
        </ul>
        <button 
          className="btn-primary btn-generate"
          onClick={generateProof}
          disabled={isGenerating || !file}
        >
          {isGenerating ? '⏳ Generating...' : '🔐 Generate Proof'}
        </button>
      </div>
    );
  }

  const verification = proofOfCreation.verifyProof(proof);

  return (
    <div className="proof-panel">
      <div className="panel-header">
        <h3>
          <span className="proof-icon">🔐</span>
          Proof of Creation
        </h3>
        {verification.valid ? (
          <span className="status-badge valid">✓ Valid</span>
        ) : (
          <span className="status-badge invalid">✗ Invalid</span>
        )}
      </div>

      {showSuccess && (
        <div className="success-banner">
          ✅ Proof of Creation generated successfully!
        </div>
      )}

      <div className="proof-details">
        <div className="detail-item">
          <span className="detail-label">Content Hash</span>
          <span className="detail-value hash">
            {proof.contentHash.substring(0, 16)}...
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Created</span>
          <span className="detail-value">
            {new Date(proof.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">File Size</span>
          <span className="detail-value">
            {proof.metadata.filesize 
              ? `${(proof.metadata.filesize / 1024).toFixed(1)} KB`
              : 'N/A'}
          </span>
        </div>

        {proof.metadata.dimensions && (
          <div className="detail-item">
            <span className="detail-label">Dimensions</span>
            <span className="detail-value">
              {proof.metadata.dimensions.width} × {proof.metadata.dimensions.height}
            </span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Signature</span>
          <span className="detail-value hash">
            {proof.signature.substring(0, 20)}...
          </span>
        </div>
      </div>

      {proof.blockchainTx && (
        <div className="blockchain-badge">
          ⛓️ Blockchain Verified
          <span className="tx-hash">{proof.blockchainTx.substring(0, 10)}...</span>
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="btn-primary"
          onClick={generateCert}
        >
          📜 Generate Certificate
        </button>
        
        <button 
          className="btn-secondary"
          onClick={exportProof}
        >
          📥 Export Proof
        </button>
      </div>

      {certificate && (
        <div className="certificate-section">
          <h4>🎖️ Ownership Certificate</h4>
          <div className="certificate-card">
            <div className="cert-id">
              Certificate ID: {certificate.certificateId.substring(0, 16)}...
            </div>
            <div className="cert-issued">
              Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
            </div>
            <div className="cert-verification">
              <label>Verification URL:</label>
              <div className="url-display">
                <input 
                  type="text" 
                  value={certificate.verificationUrl} 
                  readOnly 
                />
                <button onClick={copyVerificationUrl} className="btn-copy">
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="protection-tools">
        <h4>🛡️ Protection Tools</h4>
        <button className="tool-button">
          🔍 Check for Re-uploads
        </button>
        <button className="tool-button">
          ⚖️ Generate DMCA Takedown
        </button>
      </div>
    </div>
  );
}
