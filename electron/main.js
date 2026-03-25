const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup not installed, skip this step
}

let mainWindow;
let serverProcess;

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Paths - adjust for packaged app
const getAppPath = () => {
  if (isDev) {
    return path.join(__dirname, '..');
  }
  // In production, resources are in resources/app.asar or resources/app
  return path.join(process.resourcesPath, 'app');
};

const appPath = getAppPath();
const serverPath = path.join(appPath, '.next', 'standalone', 'server.js');
const dbPath = path.join(appPath, 'db', 'custom.db');

console.log('=== AutoParts Stock ===');
console.log('isDev:', isDev);
console.log('appPath:', appPath);
console.log('serverPath:', serverPath);
console.log('dbPath:', dbPath);
console.log('server exists:', fs.existsSync(serverPath));

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'AutoParts Stock - Gestion de Stock',
    show: false,
  });

  // Load the Next.js app
  const startUrl = isDev 
    ? (process.env.ELECTRON_START_URL || 'http://localhost:3000')
    : 'http://localhost:3000';
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready, showing...');
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Create application menu
  const menuTemplate = [
    {
      label: 'Fichier',
      submenu: [
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectAll', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'forceReload', label: 'Forcer l\'actualisation' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Taille normale' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
        { type: 'separator' },
        { 
          label: 'Outils de développement',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.openDevTools();
            }
          }
        }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos d\'AutoParts Stock',
              message: 'AutoParts Stock v1.0.0',
              detail: 'Application de gestion de stock de pièces automobiles.\n\nDéveloppée avec Next.js et Electron.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// Start the Next.js server
function startServer() {
  return new Promise((resolve, reject) => {
    // Check if server file exists
    if (!fs.existsSync(serverPath)) {
      console.error('Server file not found:', serverPath);
      reject(new Error('Server file not found'));
      return;
    }

    const { spawn } = require('child_process');
    
    console.log('Starting server from:', serverPath);
    console.log('Working directory:', appPath);
    
    // Start the Next.js server
    serverProcess = spawn('node', [serverPath], {
      cwd: appPath,
      env: { 
        ...process.env, 
        PORT: '3000',
        NODE_ENV: 'production'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server stdout: ${data}`);
      if (data.toString().includes('Ready') || data.toString().includes('started')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server stderr: ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(`Server exited with code ${code}, signal ${signal}`);
    });

    // Resolve after timeout if server doesn't output Ready
    setTimeout(() => {
      console.log('Server startup timeout, assuming ready...');
      resolve();
    }, 5000);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  console.log('App ready, starting...');
  
  try {
    // Start Next.js server in production
    if (!isDev) {
      console.log('Starting Next.js server...');
      await startServer();
      console.log('Next.js server started');
    }
    
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Erreur de démarrage', `L'application n'a pas pu démarrer:\n${error.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC handlers for database operations
ipcMain.handle('get-db-path', () => {
  return dbPath;
});
