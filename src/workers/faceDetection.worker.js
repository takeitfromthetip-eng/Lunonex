/* eslint-disable */
/**
 * Web Worker for background face detection
 * Runs face detection off the main thread for better performance
 */

importScripts('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js');

let modelsLoaded = false;

// Load models once
async function loadModels() {
  if (modelsLoaded) return;
  
  try {
    await faceapi.nets.tinyFaceDetector.load('/models');
    await faceapi.nets.faceLandmark68TinyNet.load('/models');
    modelsLoaded = true;
    postMessage({ type: 'models_loaded', success: true });
  } catch (error) {
    postMessage({ type: 'models_loaded', success: false, error: error.message });
  }
}

// Process face detection
async function detectFaces(imageData, width, height) {
  if (!modelsLoaded) {
    await loadModels();
  }

  try {
    // Create canvas from image data
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    // Detect faces
    const detections = await faceapi
      .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true);

    postMessage({
      type: 'detection_result',
      detections: detections.map(d => ({
        box: d.detection.box,
        landmarks: d.landmarks.positions
      }))
    });
  } catch (error) {
    postMessage({
      type: 'detection_error',
      error: error.message
    });
  }
}

// Listen for messages
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'load_models':
      await loadModels();
      break;
    
    case 'detect_faces':
      await detectFaces(data.imageData, data.width, data.height);
      break;
    
    default:
      console.warn('Unknown message type:', type);
  }
});
