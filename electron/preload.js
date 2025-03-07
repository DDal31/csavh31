
// preload.js
const { contextBridge } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any necessary functions here that need to communicate with the main process
  // Example: getAppVersion: () => process.env.npm_package_version
});

// Safe initialization of window
window.addEventListener('DOMContentLoaded', () => {
  // You can initialize renderer-specific code here if needed
  console.log('DOM fully loaded and parsed in Electron context');
});
