/**
 * CLIENT-SIDE FACE DETECTION
 * Uses TensorFlow.js FaceAPI - runs in browser, no API keys needed
 * Detects faces, extracts descriptors, groups by similarity
 */

import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

/**
 * Load face detection models (only once)
 */
export async function loadFaceModels() {
  if (modelsLoaded) return true;

  try {
    console.log('Loading face detection models...');

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded = true;
    console.log('✅ Face detection models loaded');
    return true;
  } catch (error) {
    console.error('Failed to load face models:', error);
    return false;
  }
}

/**
 * Detect faces in a single image
 */
export async function detectFacesInImage(imageElement) {
  try {
    const detections = await faceapi
      .detectAllFaces(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections.map(detection => ({
      box: detection.detection.box,
      confidence: detection.detection.score,
      descriptor: Array.from(detection.descriptor), // 128-dimensional vector
      landmarks: detection.landmarks
    }));
  } catch (error) {
    console.error('Face detection error:', error);
    return [];
  }
}

/**
 * Calculate similarity between two face descriptors
 * Returns 0-1 (0 = different, 1 = identical)
 */
function calculateSimilarity(desc1, desc2) {
  const distance = faceapi.euclideanDistance(desc1, desc2);
  // Convert distance to similarity (0.6 threshold is standard)
  return 1 - Math.min(distance, 1);
}

/**
 * Group faces by similarity
 */
export function groupFacesBySimilarity(allFaces, threshold = 0.6) {
  const groups = [];
  const assigned = new Set();

  allFaces.forEach((face, i) => {
    if (assigned.has(i)) return;

    const group = {
      id: `group_${groups.length + 1}`,
      characterName: `Character_${String.fromCharCode(65 + groups.length)}`,
      faces: [face],
      confidence: face.confidence,
      images: [face.imageData]
    };

    assigned.add(i);

    // Find similar faces
    allFaces.forEach((otherFace, j) => {
      if (i === j || assigned.has(j)) return;

      const similarity = calculateSimilarity(face.descriptor, otherFace.descriptor);

      if (similarity >= threshold) {
        group.faces.push(otherFace);
        group.images.push(otherFace.imageData);
        assigned.add(j);
      }
    });

    groups.push({
      ...group,
      faceCount: group.faces.length,
      averageConfidence: group.faces.reduce((sum, f) => sum + f.confidence, 0) / group.faces.length,
      suggestedName: `Character_${String.fromCharCode(65 + groups.length)}`
    });
  });

  return groups;
}

/**
 * Process multiple images and group faces
 */
export async function analyzeImagesForFaces(images, progressCallback) {
  // Load models first
  const loaded = await loadFaceModels();
  if (!loaded) {
    throw new Error('Failed to load face detection models');
  }

  const allFaces = [];

  for (let i = 0; i < images.length; i++) {
    try {
      // Create image element
      const img = document.createElement('img');
      img.src = images[i].url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Detect faces
      const faces = await detectFacesInImage(img);

      // Add image data to each face
      faces.forEach(face => {
        allFaces.push({
          ...face,
          imageData: {
            name: images[i].name,
            url: images[i].url,
            size: images[i].size
          }
        });
      });

      // Progress callback
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: images.length,
          facesFound: allFaces.length
        });
      }

    } catch (error) {
      console.error(`Failed to process image ${images[i].name}:`, error);
    }
  }

  // Group similar faces
  const groups = groupFacesBySimilarity(allFaces, 0.6);

  return {
    success: true,
    groups,
    totalFaces: allFaces.length,
    totalImages: images.length
  };
}

/**
 * Enhanced grouping with smart naming suggestions
 */
export function enhanceGroupsWithSuggestions(groups) {
  return groups.map((group, index) => {
    // Analyze face characteristics for better naming
    const avgConfidence = group.averageConfidence || 0.85;

    let suggestedName = `Character_${String.fromCharCode(65 + index)}`;

    // If high confidence and many images, suggest more specific naming
    if (group.faceCount > 10 && avgConfidence > 0.9) {
      suggestedName = `MainCharacter_${index + 1}`;
    } else if (group.faceCount > 5) {
      suggestedName = `Character_${index + 1}`;
    } else if (group.faceCount >= 3) {
      suggestedName = `MinorCharacter_${index + 1}`;
    } else {
      suggestedName = `Background_${index + 1}`;
    }

    return {
      ...group,
      suggestedName,
      detectedCharacter: `${group.faceCount} images detected (${(avgConfidence * 100).toFixed(1)}% confidence)`,
      sortPriority: group.faceCount // Most images = highest priority
    };
  }).sort((a, b) => b.sortPriority - a.sortPriority);
}
