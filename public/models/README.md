# Face-API Models

**Status:** Missing model files for face detection

## Required Files

Download these files from: https://github.com/vladmandic/face-api/tree/master/model

Place them in this `/public/models/` directory:

```
tiny_face_detector_model-weights_manifest.json
tiny_face_detector_model-shard1
face_landmark_68_tiny_model-weights_manifest.json
face_landmark_68_tiny_model-shard1
face_recognition_model-weights_manifest.json
face_recognition_model-shard1
face_expression_model-weights_manifest.json
face_expression_model-shard1
```

## Why These Are Needed

- AR masks and face filters
- CGI face tracking
- Expression detection
- Face landmark detection

## Without These Files

The app will run, but face detection features will fail silently or show errors.
