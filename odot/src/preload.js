const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getExtensionData: () => ipcRenderer.invoke('get-extension-data'),
  
  analyzeWithAI: (sites) => ipcRenderer.invoke('analyze-with-ai', sites),
  
  // Legacy fetch API (keep for compatibility)
  fetchAPI: (url) => ipcRenderer.invoke('fetch-api', url)
});