/**
 * Download face-api.js models for face detection effects
 * Run this script to set up the required ML models
 *
 * Usage: node scripts/download-face-models.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'models');
const BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';

const MODELS = [
  // Tiny Face Detector
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',

  // Face Landmark 68 Tiny
  'face_landmark_68_tiny_model-shard1',
  'face_landmark_68_tiny_model-weights_manifest.json',

  // Face Recognition
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_recognition_model-weights_manifest.json',

  // Face Expression
  'face_expression_model-shard1',
  'face_expression_model-weights_manifest.json'
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  // Create models directory if it doesn't exist
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    console.log(`📁 Created directory: ${PUBLIC_DIR}`);
  }

  console.log('🚀 Downloading face-api.js models...\n');

  for (const model of MODELS) {
    const url = `${BASE_URL}/${model}`;
    const dest = path.join(PUBLIC_DIR, model);

    // Skip if already exists
    if (fs.existsSync(dest)) {
      console.log(`⏭️  Skipped (already exists): ${model}`);
      continue;
    }

    try {
      await downloadFile(url, dest);
    } catch (error) {
      console.error(`❌ Failed to download ${model}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ All models downloaded successfully!');
  console.log('🎉 Face detection effects are now ready to use.');
}

downloadModels().catch(err => {
  console.error('❌ Download failed:', err);
  process.exit(1);
});
