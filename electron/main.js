
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
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
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    icon: path.join(__dirname, '../public/club-logo.png')
  });

  // Permettre la création de fenêtres DevTools en développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Gérer les erreurs
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('La page n\'a pas pu être chargée');
    // Retry loading or show an error page
    if (isDev) {
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:8080');
      }, 5000);
    }
  });

  // Configurer le Content Security Policy pour bloquer les scripts non sécurisés
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' https: wss:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: wss:;"]
      }
    });
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Créer la fenêtre lorsque Electron est prêt
app.whenReady().then(() => {
  createWindow();
  
  // Gérer les erreurs non gérées
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });
});

// Quitter lorsque toutes les fenêtres sont fermées
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
