/* eslint-disable */
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');
const crypto = require('crypto');

let mainWindow;
let pinWindow;
let settingsWindow;
let serverProcess;

// Production Vercel URL (primary)
const VERCEL_URL = 'https://fortheweebs-2cpc9wi0r-jacobs-projects-eac77986.vercel.app';
const LOCAL_PORT = 3001;

// Security: Hashed PIN storage (SHA-256)
function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

// Network check: Test internet connectivity
function checkInternet() {
  return new Promise((resolve) => {
    const testSocket = net.connect({ host: 'google.com', port: 80 }, () => {
      testSocket.destroy();
      resolve(true);
    });
    
    testSocket.on('error', () => {
      testSocket.destroy();
      resolve(false);
    });
    
    testSocket.setTimeout(2000, () => {
      testSocket.destroy();
      resolve(false);
    });
  });
}

// Local Express server for offline mode
function startLocalServer() {
  return new Promise((resolve, reject) => {
    const serverPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'app', 'server.js')
      : path.join(__dirname, 'server.js');
    
    const nodePath = process.platform === 'win32' 
      ? process.env.NODE_PATH || 'C:\\Program Files\\nodejs\\node.exe'
      : process.env.NODE_PATH || 'node';
    
    serverProcess = spawn(nodePath, [serverPath], {
      env: { ...process.env, PORT: LOCAL_PORT },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server] ${data}`);
      if (data.toString().includes('Server running')) resolve();
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data}`);
    });

    serverProcess.on('error', (err) => {
      console.error('[Server Failed]', err);
      reject(err);
    });

    // Fallback timeout
    setTimeout(resolve, 5000);
  });
}

// Create PIN entry window
function createPinWindow() {
  pinWindow = new BrowserWindow({
    width: 400,
    height: 350,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  const pinHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .pin-container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
        }
        h2 { margin: 0 0 20px; color: #333; }
        input {
          width: 200px;
          height: 50px;
          font-size: 24px;
          text-align: center;
          letter-spacing: 10px;
          border: 2px solid #ddd;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        input:focus { outline: none; border-color: #667eea; }
        button {
          width: 100%;
          height: 45px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 10px;
        }
        button:hover { opacity: 0.9; }
        .skip-btn {
          background: #95a5a6;
          font-size: 14px;
          height: 35px;
        }
        .error { color: #e74c3c; margin-top: 10px; display: none; }
        .setup-text { font-size: 12px; color: #7f8c8d; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="pin-container">
        <h2>🔒 Enter PIN</h2>
        <div class="setup-text" id="setupText" style="display:none;">First time? Create a 4-digit PIN</div>
        <input type="password" id="pinInput" maxlength="4" placeholder="••••" autofocus />
        <button onclick="submitPin()">Unlock</button>
        <button class="skip-btn" onclick="skipPin()">Skip (Use Web Login Only)</button>
        <div class="error" id="error">Incorrect PIN</div>
      </div>
      <script>
        const pinInput = document.getElementById('pinInput');
        const error = document.getElementById('error');
        const setupText = document.getElementById('setupText');
        
        window.electronAPI.checkPinSetup().then((hasPin) => {
          if (!hasPin) {
            setupText.style.display = 'block';
          }
        });
        
        pinInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, '');
          error.style.display = 'none';
        });
        
        pinInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && pinInput.value.length === 4) {
            submitPin();
          }
        });
        
        function submitPin() {
          const pin = pinInput.value;
          if (pin.length !== 4) {
            error.textContent = 'PIN must be 4 digits';
            error.style.display = 'block';
            return;
          }
          window.electronAPI.verifyPin(pin);
        }
        
        function skipPin() {
          window.electronAPI.skipPin();
        }
        
        window.electronAPI.onPinResult((result) => {
          if (!result.success) {
            error.textContent = result.message;
            error.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
          }
        });
      </script>
    </body>
    </html>
  `;

  pinWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(pinHtml)}`);
}

// Main application window
async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'public/icon-512.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Primary: Load from Vercel production
  console.log('🌐 Loading ForTheWeebs from production...');
  mainWindow.loadURL(VERCEL_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for PIN verification
ipcMain.handle('verify-pin', async (event, enteredPin) => {
  const { session } = require('electron');
  const storedPinHash = await session.defaultSession.cookies.get({ name: 'appPinHash' });
  
  if (storedPinHash.length === 0) {
    // First time setup - store the PIN
    const pinHash = hashPin(enteredPin);
    await session.defaultSession.cookies.set({
      url: 'ftw://app',
      name: 'appPinHash',
      value: pinHash,
      expirationDate: Date.now() / 1000 + 365 * 24 * 60 * 60 // 1 year
    });
    // Set auth mode to PIN enabled
    await session.defaultSession.cookies.set({
      url: 'ftw://app',
      name: 'authMode',
      value: 'pin',
      expirationDate: Date.now() / 1000 + 365 * 24 * 60 * 60
    });
    return { success: true, isNewPin: true };
  } else {
    // Verify existing PIN
    const enteredHash = hashPin(enteredPin);
    if (enteredHash === storedPinHash[0].value) {
      return { success: true };
    } else {
      return { success: false, message: 'Incorrect PIN' };
    }
  }
});

ipcMain.handle('check-pin-setup', async () => {
  const { session } = require('electron');
  const storedPinHash = await session.defaultSession.cookies.get({ name: 'appPinHash' });
  return storedPinHash.length > 0;
});

ipcMain.handle('get-auth-mode', async () => {
  const { session } = require('electron');
  const authModeCookie = await session.defaultSession.cookies.get({ name: 'authMode' });
  return authModeCookie.length > 0 ? authModeCookie[0].value : 'none';
});

app.whenReady().then(async () => {
  await createMainWindow();
  
  // Check authentication mode
  const { session } = require('electron');
  const authModeCookie = await session.defaultSession.cookies.get({ name: 'authMode' });
  const authMode = authModeCookie.length > 0 ? authModeCookie[0].value : 'none';
  
  if (authMode === 'pin' || authMode === 'both') {
    createPinWindow();
  } else {
    mainWindow.show();
  }
  
  // Application menu with settings
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Security Settings',
          click: () => createSettingsWindow()
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

// Settings window for PIN configuration
function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }
  
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js')
    }
  });

  const settingsHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 30px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f5f5f5;
        }
        h2 { color: #333; margin-bottom: 30px; }
        .option {
          background: white;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }
        .option:hover { border-color: #667eea; }
        .option.selected { border-color: #667eea; background: #f0f3ff; }
        .option-title { font-weight: 600; font-size: 16px; color: #333; margin-bottom: 5px; }
        .option-desc { font-size: 14px; color: #666; }
        button {
          width: 100%;
          height: 45px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover { opacity: 0.9; }
        .current { font-size: 12px; color: #7f8c8d; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h2>🔐 Security Settings</h2>
      <div class="current" id="current">Current mode: Loading...</div>
      
      <div class="option" data-mode="none">
        <div class="option-title">📧 Username & Password Only</div>
        <div class="option-desc">Use web login credentials (no PIN)</div>
      </div>
      
      <div class="option" data-mode="pin">
        <div class="option-title">🔢 PIN Only</div>
        <div class="option-desc">Quick 4-digit PIN access (desktop only)</div>
      </div>
      
      <div class="option" data-mode="both">
        <div class="option-title">🔒 Both PIN & Username/Password</div>
        <div class="option-desc">Maximum security (PIN + web login)</div>
      </div>
      
      <button onclick="saveSettings()">Save Settings</button>
      
      <script>
        let selectedMode = 'none';
        
        window.electronAPI.getAuthMode().then((mode) => {
          selectedMode = mode;
          updateUI();
        });
        
        document.querySelectorAll('.option').forEach(option => {
          option.addEventListener('click', () => {
            selectedMode = option.dataset.mode;
            updateUI();
          });
        });
        
        function updateUI() {
          const modes = { none: 'Username & Password Only', pin: 'PIN Only', both: 'Both PIN & Password' };
          document.getElementById('current').textContent = 'Current mode: ' + modes[selectedMode];
          
          document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.mode === selectedMode) {
              opt.classList.add('selected');
            }
          });
        }
        
        function saveSettings() {
          window.electronAPI.saveAuthMode(selectedMode);
        }
      </script>
    </body>
    </html>
  `;

  settingsWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(settingsHtml)}`);
  
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

ipcMain.handle('save-auth-mode', async (event, mode) => {
  const { session } = require('electron');
  await session.defaultSession.cookies.set({
    url: 'ftw://app',
    name: 'authMode',
    value: mode,
    expirationDate: Date.now() / 1000 + 365 * 24 * 60 * 60
  });
  authMode = mode;
  
  // If setting to PIN mode and no PIN exists, prompt for PIN creation
  if ((mode === 'pin' || mode === 'both')) {
    const storedPinHash = await session.defaultSession.cookies.get({ name: 'appPinHash' });
    if (storedPinHash.length === 0) {
      return { success: true, needsPinSetup: true };
    }
  }
  
  return { success: true, needsPinSetup: false };
});

// PIN verification successful - show main window
ipcMain.on('pin-verified', () => {
  if (pinWindow) {
    pinWindow.close();
    pinWindow = null;
  }
  if (mainWindow) {
    mainWindow.show();
  }
});

// Skip PIN - use web login only
ipcMain.on('skip-pin', async () => {
  const { session } = require('electron');
  await session.defaultSession.cookies.set({
    url: 'ftw://app',
    name: 'authMode',
    value: 'none',
    expirationDate: Date.now() / 1000 + 365 * 24 * 60 * 60
  });
  
  if (pinWindow) {
    pinWindow.close();
    pinWindow = null;
  }
  if (mainWindow) {
    mainWindow.show();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow().then(() => {
      if (authMode === 'pin' || authMode === 'both') {
        createPinWindow();
      } else {
        mainWindow.show();
      }
    });
  }
});
