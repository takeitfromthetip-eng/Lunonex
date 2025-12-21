/* eslint-disable */
import { showToast } from './Toast';

export const ExportUtils = {
  // Export canvas as image
  exportCanvasAsImage: (canvas, filename = 'artwork', format = 'png') => {
    try {
      const link = document.createElement('a');
      link.download = `${filename}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
      showToast(`Exported as ${filename}.${format}`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    }
  },

  // Export text content as file
  exportTextFile: (content, filename = 'document', extension = 'txt') => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${filename}.${extension}`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    }
  },

  // Export JSON data
  exportJSON: (data, filename = 'project') => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Project exported as ${filename}.json`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    }
  },

  // Export as PDF (basic implementation)
  exportAsPDF: async (element, filename = 'document') => {
    try {
      // This would require html2pdf or similar library
      // For now, show a toast that feature is coming
      showToast('PDF export coming soon! Use PNG for now.', 'info');
    } catch (error) {
      console.error('PDF export failed:', error);
      showToast('PDF export failed.', 'error');
    }
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  },

  // Download from URL
  downloadFromURL: async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
      showToast(`Downloaded ${filename}`, 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Download failed. Please try again.', 'error');
    }
  }
};
