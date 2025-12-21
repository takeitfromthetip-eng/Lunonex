import React from 'react';
import { ExportUtils } from '../utils/ExportUtils';
import { showToast } from './Toast';
import './ShareButton.css';

export function ShareButton({ projectData, projectTitle = 'My Project' }) {
  const shareUrl = `${window.location.origin}?project=${projectData?.id || 'preview'}`;

  const handleShare = async (platform) => {
    const text = `Check out my project: ${projectTitle}`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;

      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;

      case 'reddit':
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(projectTitle)}`, '_blank');
        break;

      case 'copy':
        await ExportUtils.copyToClipboard(shareUrl);
        break;

      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: projectTitle,
              text: text,
              url: shareUrl
            });
            showToast('Shared successfully!', 'success');
          } catch (error) {
            if (error.name !== 'AbortError') {
              showToast('Failed to share', 'error');
            }
          }
        } else {
          showToast('Sharing not supported on this device', 'warning');
        }
        break;
    }
  };

  return (
    <div className="share-button-container">
      <button className="share-button" onClick={() => handleShare('native')}>
        🔗 Share
      </button>
      <div className="share-dropdown">
        <button onClick={() => handleShare('twitter')} className="share-option">
          🐦 Share on Twitter
        </button>
        <button onClick={() => handleShare('facebook')} className="share-option">
          📘 Share on Facebook
        </button>
        <button onClick={() => handleShare('reddit')} className="share-option">
          🤖 Share on Reddit
        </button>
        <button onClick={() => handleShare('copy')} className="share-option">
          📋 Copy Link
        </button>
      </div>
    </div>
  );
}
