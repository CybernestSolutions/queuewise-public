const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
    autoHideMenuBar: true, // Hide the menu bar
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'out/queuewise-public-view/index.html'),
      icon: path.join(__dirname, 'src/assets/', 'icon-glow.ico'),
      protocol: 'file:',
      slashes: true,
    })
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });


  mainWindow.setFullScreen(true); // Set to false if you want to exit full screen.
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
