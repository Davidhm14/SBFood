require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const trial  = require('./licensing/trial');
const serial = require('./licensing/serial');

let mainWindow;
let apiProcess;

// ─── IPC Handlers ───────────────────────────────────────────
ipcMain.handle('license:check', () => {
  return trial.getStatus();
});

ipcMain.handle('license:activate', (_, serialInput) => {
  const result = serial.validate(serialInput);
  if (result.valid) {
    trial.activate(result);
    return { success: true, message: '✅ Licencia activada correctamente' };
  }
  return { success: false, message: result.message };
});

// ─── Iniciar API Express ─────────────────────────────────────
function startApi() {
  apiProcess = spawn('node', ['server/index.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
}

// ─── Crear ventana principal ─────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// ─── App lifecycle ───────────────────────────────────────────
app.whenReady().then(() => {
  trial.init();   // ← inicializa trial en primera instalación
  startApi();
  createWindow();
});

app.on('window-all-closed', () => {
  if (apiProcess) apiProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
