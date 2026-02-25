const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let apiProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // ← Esta línea es clave, carga Vite dev server
  mainWindow.loadURL('http://localhost:5173');

  // Abre DevTools automáticamente en desarrollo
  mainWindow.webContents.openDevTools();
}

function startApi() {
  apiProcess = spawn('node', ['server/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

app.whenReady().then(() => {
  startApi();
  createWindow();
});

app.on('window-all-closed', () => {
  if (apiProcess) apiProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
