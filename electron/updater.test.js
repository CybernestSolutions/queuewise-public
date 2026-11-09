const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { setupUpdater, IDLE_CHANNEL } = require('./updater');

function make(role, start = '2026-11-10T14:00:00') {
  let t = new Date(start).getTime();
  const timers = [];
  const calls = { check: 0, install: [] };
  const au = new EventEmitter();
  au.checkForUpdates = () => (calls.check++, Promise.resolve());
  au.quitAndInstall = (...a) => calls.install.push(a);
  au.setFeedURL = () => assert.fail('setFeedURL must not be called');
  const ipcMain = new EventEmitter();
  const keys = {};
  const globalShortcut = { register: (k, fn) => ((keys[k] = fn), true), unregisterAll() {} };
  const log = { info() {}, warn() {}, error() {} };
  setupUpdater({
    autoUpdater: au, app: new EventEmitter(), globalShortcut, ipcMain, role, log,
    now: () => new Date(t),
    setTimer: (fn, ms) => timers.push({ fn, at: t + ms }),
  });
  const tick = (ms) => {
    const end = t + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      const i = timers.findIndex((x) => x.at <= end);
      if (i < 0) break;
      const [x] = timers.splice(i, 1);
      t = Math.max(t, x.at);
      x.fn();
    }
    t = end;
  };
  const download = (notes) => au.emit('update-downloaded', { version: '2.0.0', releaseNotes: notes });
  const H = 3600e3;
  return { au, calls, ipcMain, keys, tick, download, H };
}

test('normal release: no install until 05:00', () => {
  const s = make('display');
  s.download('bug fixes');
  s.tick(14 * s.H); // 14:00 -> 04:00
  assert.equal(s.calls.install.length, 0);
  s.tick(1 * s.H + 1000); // past 05:00
  assert.deepEqual(s.calls.install, [[true, true]]);
});

test('urgent display installs immediately', () => {
  const s = make('display');
  s.download('[urgent] fix');
  assert.equal(s.calls.install.length, 1);
});

test('urgent release notes as array', () => {
  const s = make('display');
  s.download([{ version: '2', note: '[URGENT] x' }]);
  assert.equal(s.calls.install.length, 1);
});

test('urgent kiosk waits for idle true', () => {
  const s = make('kiosk');
  s.download('[urgent] fix');
  assert.equal(s.calls.install.length, 0);
  s.ipcMain.emit(IDLE_CHANNEL, {}, false);
  assert.equal(s.calls.install.length, 0);
  s.ipcMain.emit(IDLE_CHANNEL, {}, true);
  assert.equal(s.calls.install.length, 1);
});

test('urgent kiosk already idle installs on download', () => {
  const s = make('kiosk');
  s.ipcMain.emit(IDLE_CHANNEL, {}, true);
  s.download('[urgent]');
  assert.equal(s.calls.install.length, 1);
});

test('urgent kiosk without idle report installs at 05:00', () => {
  const s = make('kiosk');
  s.download('[urgent] fix');
  s.tick(14 * s.H);
  assert.equal(s.calls.install.length, 0);
  s.tick(1 * s.H + 1000);
  assert.equal(s.calls.install.length, 1);
});

test('idle true does not install a normal release', () => {
  const s = make('kiosk');
  s.download('plain');
  s.ipcMain.emit(IDLE_CHANNEL, {}, true);
  assert.equal(s.calls.install.length, 0);
});

test('hotkey checks, then installs once downloaded', () => {
  const s = make('kiosk');
  const before = s.calls.check;
  s.keys['Control+Shift+U']();
  assert.equal(s.calls.check, before + 1);
  s.download('plain');
  s.keys['Control+Shift+U']();
  assert.equal(s.calls.install.length, 1);
});

test('checks at 10s then every 30 min', () => {
  const s = make('display');
  s.tick(9000);
  assert.equal(s.calls.check, 0);
  s.tick(2000);
  assert.equal(s.calls.check, 1);
  s.tick(30 * 60 * 1000 * 2);
  assert.equal(s.calls.check, 3);
});

test('no token / feed override in updater or main', () => {
  for (const f of ['updater.js', '../main.js']) {
    const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
    assert.doesNotMatch(src, /setFeedURL|GH_TOKEN|tokens*[:=]/i, f);
  }
});
