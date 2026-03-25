const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Handle electron-squirrel-startup
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {}

let mainWindow;
let loadingWindow;
let serverProcess;

// Find the server.js file recursively
function findServerJs(dir, maxDepth = 10) {
  if (maxDepth <= 0) return null;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // Check for server.js in current directory
    if (entries.some(e => e.name === 'server.js' && e.isFile())) {
      return path.join(dir, 'server.js');
    }
    
    // Search in subdirectories
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        const found = findServerJs(path.join(dir, entry.name), maxDepth - 1);
        if (found) return found;
      }
    }
  } catch (e) {}
  
  return null;
}

// Get server path
function getServerPath() {
  console.log('=== Finding server.js ===');
  console.log('resourcesPath:', process.resourcesPath);
  console.log('exe path:', app.getPath('exe'));
  console.log('isPackaged:', app.isPackaged);
  
  const possibleBasePaths = [
    process.resourcesPath,
    path.dirname(app.getPath('exe')),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', '..', '..'),
  ];
  
  for (const basePath of possibleBasePaths) {
    console.log('Searching in:', basePath);
    
    // Check direct paths
    const directPaths = [
      path.join(basePath, 'server.js'),
      path.join(basePath, '.next', 'standalone', 'server.js'),
      path.join(basePath, 'app', 'server.js'),
      path.join(basePath, 'app', '.next', 'standalone', 'server.js'),
    ];
    
    for (const p of directPaths) {
      console.log('  Checking:', p, '->', fs.existsSync(p));
      if (fs.existsSync(p)) return p;
    }
    
    // Search recursively
    const found = findServerJs(basePath);
    if (found) {
      console.log('  Found recursively:', found);
      return found;
    }
  }
  
  return null;
}

// Create loading window
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadingWindow.loadURL(`data:text/html,
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          border-radius: 10px;
        }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 20px; }
        .logo span { color: #f59e0b; }
        .spinner {
          width: 50px; height: 50px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status { margin-top: 20px; font-size: 14px; opacity: 0.8; text-align: center; padding: 0 20px; }
      </style>
    </head>
    <body>
      <div class="logo">Auto<span>Parts</span> Stock</div>
      <div class="spinner"></div>
      <div class="status" id="status">Démarrage en cours...</div>
    </body>
    </html>
  `);

  loadingWindow.on('closed', () => { loadingWindow = null; });
  return loadingWindow;
}

function updateLoadingStatus(status) {
  if (loadingWindow) {
    loadingWindow.webContents.executeJavaScript(
      `document.getElementById('status').textContent = '${status}'`
    );
  }
}

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'AutoParts Stock',
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.once('ready-to-show', () => {
    if (loadingWindow) loadingWindow.close();
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    updateLoadingStatus(`Erreur: ${errorDescription}`);
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Fichier', submenu: [{ role: 'quit', label: 'Quitter' }] },
    { label: 'Affichage', submenu: [
      { role: 'reload', label: 'Actualiser' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Plein écran' },
      { type: 'separator' },
      { label: 'Outils de développement', click: () => mainWindow?.webContents.openDevTools() }
    ]},
    { label: 'Aide', submenu: [
      { label: 'À propos', click: () => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'À propos',
          message: 'AutoParts Stock v1.0',
          detail: 'Application de gestion de stock de pièces automobiles.'
        });
      }}
    ]}
  ]));
}

// Start server
function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath();
    console.log('Server path:', serverPath);
    
    if (!serverPath) {
      reject(new Error('Server file not found. Please reinstall the application.'));
      return;
    }

    updateLoadingStatus('Démarrage du serveur...');
    
    const serverDir = path.dirname(serverPath);
    console.log('Server directory:', serverDir);
    
    serverProcess = spawn('node', [serverPath], {
      cwd: serverDir,
      env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      console.log('Server:', data.toString());
      if (data.toString().includes('Ready') || data.toString().includes('listening')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start:', error);
      reject(error);
    });

    setTimeout(() => {
      console.log('Timeout, assuming server is ready...');
      resolve();
    }, 8000);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  console.log('=== AutoParts Stock v1.0 ===');
  
  createLoadingWindow();

  try {
    if (app.isPackaged) {
      updateLoadingStatus('Initialisation...');
      await startServer();
      updateLoadingStatus('Chargement...');
    }
    
    await new Promise(r => setTimeout(r, 2000));
    createMainWindow();
    
  } catch (error) {
    console.error('Startup error:', error);
    updateLoadingStatus(`Erreur: ${error.message}`);
    dialog.showErrorBox('Erreur de démarrage', `L'application n'a pas pu démarrer:\n${error.message}`);
    setTimeout(() => app.quit(), 5000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
