const { app, BrowserWindow, globalShortcut, ipcMain, powerSaveBlocker } = require('electron');
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
      // Kiosk TV: keep timers, rAF and the Page Visibility state "visible" even
      // when Windows reports the window occluded (toast, installer, HDMI blip);
      // Chromium pauses hidden media otherwise. Autoplay needs no gesture here.
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required',
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

  // Renderer "[tv]" lines (watchdog recoveries, reload reasons) land in the
  // device's electron-log file so they can be read without DevTools.
  mainWindow.webContents.on('console-message', (_e, _level, message) => {
    if (typeof message === 'string' && message.startsWith('[tv]')) log.info(message);
  });
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    log.error('[tv] renderer gone:', details && details.reason, '- reloading');
    mainWindow && mainWindow.webContents.reload();
  });
  mainWindow.webContents.on('unresponsive', () => log.warn('[tv] renderer unresponsive'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // The TV must never let Windows blank the screen or sleep the box.
  const blocker = powerSaveBlocker.start('prevent-display-sleep');
  log.info('[tv] powerSaveBlocker active:', powerSaveBlocker.isStarted(blocker));
  createWindow();
  log.transports.file.level = 'info';
  setupUpdater({ autoUpdater, app, globalShortcut, ipcMain, role: 'display', log });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
