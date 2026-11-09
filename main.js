const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { setupUpdater } = require('./electron/updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/queuewise-public-view/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.setFullScreen(true);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  log.transports.file.level = 'info';
  setupUpdater({ autoUpdater, app, globalShortcut, ipcMain, role: 'display', log });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
