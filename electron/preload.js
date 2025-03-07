
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Exposition sécurisée d'APIs au processus de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // Version de l'application
  getAppVersion: () => process.env.npm_package_version || 'version inconnue',
  
  // Information sur la plateforme
  getPlatformInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.versions
  })
});

// Initialisation sécurisée de la fenêtre
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM entièrement chargé et analysé dans le contexte Electron');
  
  // Ajout d'une classe pour identifier l'environnement Electron
  document.body.classList.add('electron-app');
});

// Capturer les erreurs non gérées et les journaliser
window.addEventListener('error', (event) => {
  console.error('Erreur non gérée dans le processus de rendu:', event.error);
});

// Intercepter les rejets de promesse non gérés
window.addEventListener('unhandledrejection', (event) => {
  console.error('Rejet de promesse non géré:', event.reason);
});
