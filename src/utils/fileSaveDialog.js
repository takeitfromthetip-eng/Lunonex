/**
 * File Save Dialog Utilities
 * Uses File System Access API for native "Save As" dialogs
 * Falls back to traditional download for unsupported browsers
 */

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported() {
  return 'showSaveFilePicker' in window;
}

/**
 * Show native "Save As" dialog and save a single file
 * @param {Blob} blob - The file data to save
 * @param {string} suggestedName - Suggested filename
 * @param {Object} options - File picker options
 * @returns {Promise<boolean>} - True if saved successfully
 */
export async function saveFileWithDialog(blob, suggestedName, options = {}) {
  try {
    // Try modern File System Access API first
    if (isFileSystemAccessSupported()) {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: options.types || [{
          description: 'Files',
          accept: { '*/*': [] }
        }]
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      return true;
    }
    
    // Fallback to traditional download
    fallbackDownload(blob, suggestedName);
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      // User cancelled the save dialog
      return false;
    }
    console.error('Error saving file:', error);
    
    // Try fallback on any other error
    fallbackDownload(blob, suggestedName);
    return true;
  }
}

/**
 * Show directory picker and save multiple files
 * @param {Array} files - Array of {name, blob} objects
 * @param {string} suggestedName - Suggested folder name
 * @returns {Promise<boolean>} - True if saved successfully
 */
export async function saveMultipleFilesWithDialog(files, suggestedName = 'downloads') {
  try {
    if ('showDirectoryPicker' in window) {
      // Let user choose directory
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      // Save each file to the chosen directory
      for (const file of files) {
        const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.blob);
        await writable.close();
      }

      return true;
    }
    
    // Fallback: download as ZIP or individually
    if (files.length > 1) {
      // Suggest using ZIP for multiple files
      const useZip = confirm(
        `Your browser doesn't support folder selection.\n\n` +
        `Would you like to download ${files.length} files as a ZIP?\n\n` +
        `Click OK for ZIP, Cancel to download individually.`
      );

      if (useZip) {
        // Import JSZip dynamically
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        
        files.forEach(file => {
          zip.file(file.name, file.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        fallbackDownload(zipBlob, `${suggestedName}.zip`);
      } else {
        // Download individually with delays
        files.forEach((file, index) => {
          setTimeout(() => {
            fallbackDownload(file.blob, file.name);
          }, index * 300);
        });
      }
    } else if (files.length === 1) {
      fallbackDownload(files[0].blob, files[0].name);
    }

    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      return false;
    }
    console.error('Error saving files:', error);
    return false;
  }
}

/**
 * Traditional download fallback
 */
function fallbackDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Common file type configurations
 */
export const FILE_TYPES = {
  IMAGE: {
    description: 'Images',
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    }
  },
  VIDEO: {
    description: 'Videos',
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov']
    }
  },
  AUDIO: {
    description: 'Audio',
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/ogg': ['.ogg'],
      'audio/aac': ['.aac']
    }
  },
  ZIP: {
    description: 'ZIP Archive',
    accept: {
      'application/zip': ['.zip']
    }
  },
  TEXT: {
    description: 'Text Files',
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json']
    }
  }
};

/**
 * Get appropriate file types based on format
 */
export function getFileTypes(format) {
  const formatLower = format.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(formatLower)) {
    return FILE_TYPES.IMAGE;
  }
  if (['mp4', 'webm', 'mov'].includes(formatLower)) {
    return FILE_TYPES.VIDEO;
  }
  if (['mp3', 'wav', 'ogg', 'aac'].includes(formatLower)) {
    return FILE_TYPES.AUDIO;
  }
  if (formatLower === 'zip') {
    return FILE_TYPES.ZIP;
  }
  if (['txt', 'json'].includes(formatLower)) {
    return FILE_TYPES.TEXT;
  }
  
  return { description: 'All Files', accept: { '*/*': [] } };
}
