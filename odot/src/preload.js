const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetchAPI: (url) => ipcRenderer.invoke('fetch-api', url),
  readInFile: (url) => ipcRenderer.invoke('readInFile', url)
});