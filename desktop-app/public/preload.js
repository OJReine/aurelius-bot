const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getStreams: () => ipcRenderer.invoke('db-get-streams'),
  createStream: (streamData) => ipcRenderer.invoke('db-create-stream', streamData),
  updateStream: (id, updates) => ipcRenderer.invoke('db-update-stream', id, updates),
  deleteStream: (id) => ipcRenderer.invoke('db-delete-stream', id),
  
  // Settings operations
  getSettings: () => ipcRenderer.invoke('db-get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('db-set-settings', settings),
  
  // Data import/export
  exportData: () => ipcRenderer.invoke('db-export-data'),
  importData: (data) => ipcRenderer.invoke('db-import-data', data),
  
  // Menu events
  onMenuNewStream: (callback) => ipcRenderer.on('menu-new-stream', callback),
  onMenuImportData: (callback) => ipcRenderer.on('menu-import-data', callback),
  onMenuExportData: (callback) => ipcRenderer.on('menu-export-data', callback),
  onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});
