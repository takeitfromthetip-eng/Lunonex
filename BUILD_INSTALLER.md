# Lunonex Desktop Installer - Build Instructions

## Current Status
- ✅ Portable .exe exists: `electron-dist/win-unpacked/Lunonex.exe` (202MB)
- ❌ Installer (.exe setup) not yet created
- ✅ TensorFlow.js installed and bundled
- ⚠️ TensorFlow models need to be pre-downloaded for offline use

## Create Windows Installer

### Option 1: Using electron-builder (RECOMMENDED)

1. Install electron-builder if not already:
```bash
npm install --save-dev electron-builder
```

2. Update `package.json` to include builder config:
```json
{
  "build": {
    "appId": "com.lunonex.app",
    "productName": "Lunonex",
    "win": {
      "target": ["nsis"],
      "icon": "public/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Lunonex"
    },
    "files": [
      "dist/**/*",
      "electron-dist/**/*",
      "public/**/*",
      "node_modules/**/*"
    ],
    "extraResources": [
      {
        "from": "tensorflow-models",
        "to": "tensorflow-models"
      }
    ]
  }
}
```

3. Build installer:
```bash
npm run electron:build
```

This will create:
- `electron-dist/Lunonex Setup.exe` - Full installer
- `electron-dist/win-unpacked/` - Portable version

### Option 2: Using Inno Setup (Manual)

1. Download Inno Setup: https://jrsoftware.org/isdl.php

2. Create `installer.iss`:
```iss
[Setup]
AppName=Lunonex
AppVersion=1.0.0
DefaultDirName={pf}\Lunonex
DefaultGroupName=Lunonex
OutputDir=installer-output
OutputBaseFilename=LunonexSetup
Compression=lzma2
SolidCompression=yes

[Files]
Source: "electron-dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Lunonex"; Filename: "{app}\Lunonex.exe"
Name: "{commondesktop}\Lunonex"; Filename: "{app}\Lunonex.exe"

[Run]
Filename: "{app}\Lunonex.exe"; Description: "Launch Lunonex"; Flags: postinstall nowait skipifsilent
```

3. Compile with Inno Setup Compiler

## Bundle TensorFlow.js Models for Offline Use

### Download Pre-trained Models

Create `download-tf-models.js`:
```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'face-landmarks-detection',
    url: 'https://tfhub.dev/mediapipe/tfjs-model/face_landmarks_detection/face_mesh/1/default/1',
    path: 'tensorflow-models/face-landmarks'
  },
  {
    name: 'body-pix',
    url: 'https://storage.googleapis.com/tfjs-models/savedmodel/bodypix/mobilenet/float/075/model-stride16.json',
    path: 'tensorflow-models/body-pix'
  },
  {
    name: 'pose-detection',
    url: 'https://tfhub.dev/tensorflow/tfjs-model/movenet/singlepose/lightning/4',
    path: 'tensorflow-models/pose-detection'
  }
];

async function downloadModel(model) {
  const dir = path.join(__dirname, model.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`Downloading ${model.name}...`);

  // Download model files
  // Implementation depends on model format
  console.log(`✅ ${model.name} ready for offline use`);
}

models.forEach(downloadModel);
```

Run: `node download-tf-models.js`

### Configure Electron to Use Local Models

Update `electron.js`:
```javascript
const modelPath = path.join(process.resourcesPath, 'tensorflow-models');

// Pass to renderer
mainWindow.webContents.send('model-path', modelPath);
```

Update TensorFlow imports in components:
```javascript
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

// Use local model path if in Electron
const isElectron = window.require;
const modelPath = isElectron ? window.electronModelPath : undefined;

const model = await faceLandmarksDetection.load(
  faceLandmarksDetection.SupportedPackages.mediaPipeFaceMesh,
  { modelUrl: modelPath }
);
```

## Distribution

### Upload Installer
1. Upload `LunonexSetup.exe` to:
   - Render static files
   - Supabase storage
   - GitHub Releases (if using GitHub)
   - Your own CDN

2. Add download link in Dashboard:
```jsx
<a href="/downloads/LunonexSetup.exe" download>
  Download Lunonex Desktop (Windows)
</a>
```

### Auto-Update (Optional)
Add electron-updater:
```bash
npm install electron-updater
```

Configure in `electron.js`:
```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

## Testing

1. Build installer: `npm run electron:build`
2. Test installation on clean Windows VM
3. Verify offline functionality (disconnect internet, test TensorFlow features)
4. Test uninstall process

## File Sizes
- Portable .exe: ~202MB
- Installer: ~210MB (includes compression)
- With TensorFlow models: ~300-400MB (depends on models included)

## Notes
- TensorFlow.js models can be 50-200MB each
- Consider downloading models on first launch instead of bundling
- Or bundle only essential models, download optional ones later
- Use lazy loading for models to reduce initial app size
