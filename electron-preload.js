const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  verifyPin: (pin) => {
    ipcRenderer.invoke('verify-pin', pin).then((result) => {
      if (result.success) {
        ipcRenderer.send('pin-verified');
      } else {
        ipcRenderer.send('pin-result', result);
      }
    });
  },
  
  skipPin: () => {
    ipcRenderer.send('skip-pin');
  },
  
  checkPinSetup: () => {
    return ipcRenderer.invoke('check-pin-setup');
  },
  
  getAuthMode: () => {
    return ipcRenderer.invoke('get-auth-mode');
  },
  
  saveAuthMode: (mode) => {
    ipcRenderer.invoke('save-auth-mode', mode).then((result) => {
      if (result.success) {
        alert('Settings saved! Restart the app to apply changes.');
        window.close();
      }
    });
  },
  
  onPinResult: (callback) => {
    ipcRenderer.on('pin-result', (event, result) => callback(result));
  }
});
