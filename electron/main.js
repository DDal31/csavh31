
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createWindow() {
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/club-logo.png')
  });

  // Charger l'application
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    // Ouvrir les outils de développement
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Créer la fenêtre lorsque Electron est prêt
app.whenReady().then(createWindow);

// Quitter lorsque toutes les fenêtres sont fermées
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
