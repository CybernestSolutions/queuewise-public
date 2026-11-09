// Shared auto-update policy. Keep byte-identical across QueueWise Electron apps
// (scripts/check-updater-sync.js). Feed URL comes from electron-builder `publish`
// (generic provider, public HTTPS) -> app-update.yml; no tokens on devices.
const CHECK_FIRST_MS = 10 * 1000;
const CHECK_EVERY_MS = 30 * 60 * 1000;
const URGENT_RE = /\[urgent\]/i;
const IDLE_CHANNEL = 'qw-updater:idle';

function notesOf(info) {
  const n = info && info.releaseNotes;
  return Array.isArray(n) ? n.map((x) => x.note || '').join('\n') : String(n || '');
}

function setupUpdater({ autoUpdater, app, globalShortcut, ipcMain, role, onReady, now = () => new Date(), setTimer = setTimeout, log = console }) {
  let downloaded = false;
  let urgent = false;
  let idle = false;
  let installing = false;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true; // covers "install on next app start"

  const check = () => {
    try {
      Promise.resolve(autoUpdater.checkForUpdates()).catch((e) => log.error('Update check failed:', e));
    } catch (e) {
      log.error('Update check failed:', e);
    }
  };

  const install = () => {
    if (installing || !downloaded) return;
    installing = true;
    log.info('Installing update now');
    autoUpdater.quitAndInstall(true, true);
  };

  const msUntil5am = () => {
    const d = now();
    const t = new Date(d);
    t.setHours(5, 0, 0, 0);
    if (t <= d) t.setDate(t.getDate() + 1);
    return t - d;
  };

  const loop = () => {
    check();
    setTimer(loop, CHECK_EVERY_MS);
  };
  setTimer(loop, CHECK_FIRST_MS);

  autoUpdater.on('error', (e) => log.error('Updater error:', e));
  autoUpdater.on('update-available', (i) => log.info('Update available:', i && i.version));
  autoUpdater.on('update-downloaded', (info) => {
    downloaded = true;
    urgent = URGENT_RE.test(notesOf(info));
    log.info(`Update ${info && info.version} downloaded (urgent=${urgent}); install at 05:00 or next start`);
    setTimer(install, msUntil5am()); // normal path, and fallback for urgent kiosk/teller
    if (onReady) onReady({ urgent, version: info && info.version }); // lets a UI offer "restart now"
    if (urgent && (role === 'display' || (role === 'kiosk' && idle))) install();
  });

  ipcMain.on(IDLE_CHANNEL, (_e, value) => {
    idle = value === true;
    if (idle && downloaded && urgent && role === 'kiosk') install();
  });

  const hotkey = 'Control+Shift+U';
  if (!globalShortcut.register(hotkey, () => (downloaded ? install() : check()))) {
    log.warn(`Could not register ${hotkey}`);
  }
  app.on('will-quit', () => globalShortcut.unregisterAll());
  return { installNow: install };
}

module.exports = { setupUpdater, IDLE_CHANNEL };
