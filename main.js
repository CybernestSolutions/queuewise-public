const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;

/* ------------------ AUTO UPDATER SETUP ------------------ */
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
/* -------------------------------------------------------- */

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'out/queuewise-public-view/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.setFullScreen(true);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* ------------------ APP LIFECYCLE ------------------ */
app.whenReady().then(() => {
  createWindow();


autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'CybernestSolutions',
  repo: 'queuewise-public',
  private: true,
  token: process.env.GH_TOKEN
});

  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 5000);

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 1000 * 60 * 30);
});

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
});

autoUpdater.on('update-not-available', () => {
  log.info('No update available');
});

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded — installing...');
  setTimeout(() => {
    autoUpdater.quitAndInstall(false, true);
  }, 3000);
});

autoUpdater.on('error', (err) => {
  log.error('Updater error:', err);
});
