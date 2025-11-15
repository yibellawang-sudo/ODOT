const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetchAPI: (url) => ipcRenderer.invoke('fetch-api', url)
});