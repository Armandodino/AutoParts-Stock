const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getDbPath: () => ipcRenderer.invoke('get-db-path'),
  backupDatabase: (backupPath) => ipcRenderer.invoke('backup-database', backupPath),
  restoreDatabase: (restorePath) => ipcRenderer.invoke('restore-database', restorePath),
  
  // Platform info
  platform: process.platform,
  
  // App info
  isElectron: true
});
