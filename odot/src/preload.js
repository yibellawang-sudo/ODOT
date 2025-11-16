const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetchAPI: (message) => ipcRenderer.invoke('fetch-api', message),
  readInFile: (type) => ipcRenderer.invoke('readInFile', type),
  getExtensionData: () => ipcRenderer.invoke('get-extension-data'),
  analyzeWithAI: (sites) => ipcRenderer.invoke('analyze-with-ai', sites),
  
  getTrackerData: () => ipcRenderer.invoke('get-tracker-data'),
  onTrackerDataUpdated: (callback) => {
    ipcRenderer.on('tracker-data-updated', (event, data) => callback(data));
  }
});