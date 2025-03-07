
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

// Lire le fichier package.json existant
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

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
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log("Scripts Electron ajoutés au fichier package.json.");
