const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  readSave: () => ipcRenderer.invoke('save:read'),
  writeSave: (save) => ipcRenderer.invoke('save:write', save),
  toggleFullscreen: () => ipcRenderer.invoke('window:fullscreen'),
  quit: () => ipcRenderer.invoke('window:quit')
});
