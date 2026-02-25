const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkLicense:   ()       => ipcRenderer.invoke('license:check'),
  activateLicense: (serial) => ipcRenderer.invoke('license:activate', serial),
});
