import React from 'react';
import './LoadingSpinner.css';

export function LoadingSpinner({ message = "Processing..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
