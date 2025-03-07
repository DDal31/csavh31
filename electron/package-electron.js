
const fs = require('fs');
const path = require('path');

// Lire le fichier package.json existant
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Ajouter les scripts Electron
packageJson.scripts = {
  ...packageJson.scripts,
  "electron:dev": "concurrently \"cross-env ELECTRON=true vite dev\" \"electron electron/main.js\"",
  "electron:build": "vite build && electron-builder",
  "electron:build:mac": "vite build && electron-builder --mac",
  "electron:build:win": "vite build && electron-builder --win",
  "electron:build:linux": "vite build && electron-builder --linux"
};

// Ajouter la propriété main pour Electron
packageJson.main = "electron/main.js";

// Écrire le fichier package.json mis à jour
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log("Scripts Electron ajoutés au fichier package.json.");
