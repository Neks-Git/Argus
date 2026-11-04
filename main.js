process.env.UV_THREADPOOL_SIZE = '64';

/* =============================================================================
   Argus v0.9.0 (beta) — glass HUD
   =============================================================================
   One transparent HUD: home / browser / Discord / Steam / Files / Spotify /
   Resources / Clipboard / Settings.

   Sidebar (top → bottom): notifications · daylight+clock+aurora · Spotify ·
   weather · calendar · downloads · clipboard.
   Sidebar scrolls if tiles don't fit.

   Icons
     argus.ico  — app icon for the Windows .exe (electron-builder)
     argus.png  — app icon shown in the dock (falls back to ◢◤ text if
                  the file isn't next to main.js)

   Run
     npm install
     (config.json next to main.js, argus.ico + argus.png in the same place)
     npm start

   Config (config.json)
     display, mode, width, height, clickThroughGaps, gpuStats,
     toggleHotkey, fillHotkey, clipHotkey, keepWebviewsAlive,
     steamPath, steamId64
     (glassBlur / glassTint live in settings.json now — config.glassBlur
      is migrated on first run, then ignored)

   Hotkeys (all rebindable in config.json)
     toggleHotkey  Control+Alt+Space  hide/show argus
     fillHotkey    Control+Alt+F      toggle fill-screen / restore
     clipHotkey    Control+Alt+V      jump to clipboard history

   Settings (settings.json in userData)
     location, units, username, searchEngine, customSearchUrl, calendarUrl,
     glassBlur (0-30), glassTint (20-100)

   Clipboard
     Polls the system clipboard every 800ms. Text and images. Password
     managers that flag their copies (exclude/concealed/password in formats)
     are ignored.

   Aurora
     NOAA planetary K-index vs. your weather location's geomagnetic latitude.

   Calendar
     Paste a Google Calendar "secret address in iCal format" URL in Settings.

   License
     Copyright Neks 2026 · CC BY-NC-SA 4.0
   ============================================================================= */

const { app, BrowserWindow, ipcMain, shell, globalShortcut, screen, session, desktopCapturer, webContents } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const config = require('./src/config');
config.setRoot(__dirname);
const { ensureConfig, getConfig, getSettings, setSettings } = config;

const PRELOAD_SRC = require('./src/preload-src');
const HTML_SRC   = require('./src/html-src');

if (!app.requestSingleInstanceLock()) app.quit();

let win;
let pinned = false;
let prevBounds = null;

const TMP_DIR = app.getPath('temp');
const PRELOAD_PATH = path.join(TMP_DIR, 'argus-preload.js');
const HTML_PATH    = path.join(TMP_DIR, 'argus-index.html');
const ICON_DST     = path.join(TMP_DIR, 'argus-logo.png');

fs.writeFileSync(PRELOAD_PATH, PRELOAD_SRC, 'utf8');
fs.writeFileSync(HTML_PATH, HTML_SRC, 'utf8');

try { fs.copyFileSync(path.join(__dirname, 'argus.png'), ICON_DST); } catch {}
app.on('before-quit', () => { try { fs.unlinkSync(ICON_DST); } catch {} });

function pickDisplay(cfg) {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  if (Number.isInteger(cfg.display) && displays[cfg.display]) return displays[cfg.display];
  return displays.find(d => d.id !== primary.id) || primary;
}

async function saveWebSessions() {
  const ds = session.fromPartition('persist:discord');
  const list = webContents.getAllWebContents().filter(w => !w.isDestroyed() && w.session === ds);
  await Promise.all(list.map(w => new Promise((resolve) => {
    const t = setTimeout(resolve, 2500);
    w.on('will-prevent-unload', (ev) => ev.preventDefault());
    w.once('did-navigate', () => { clearTimeout(t); setTimeout(resolve, 250); });
    w.loadURL('about:blank').catch(() => {});
  })));
  flushAll();
}

function toggleFill() {
  if (!win) return false;
  const b = win.getBounds();
  const wa = screen.getDisplayMatching(b).workArea;
  const near = (a, c) => Math.abs(a - c) <= 2;
  const isFull = near(b.x, wa.x) && near(b.y, wa.y) && near(b.width, wa.width) && near(b.height, wa.height);
  let on;
  if (isFull) {
    if (prevBounds) { win.setBounds(prevBounds); prevBounds = null; on = false; }
    else on = true;
  } else {
    prevBounds = b;
    win.setBounds(wa);
    on = true;
  }
  if (!win.isDestroyed()) win.webContents.send('fill:state', on);
  return on;
}

function createWindow() {
  const cfg = getConfig();
  const windowed = cfg.mode === 'window';
  const b = pickDisplay(cfg).workArea;

  const size = windowed
    ? { width: cfg.width || 1280, height: cfg.height || 720, center: true }
    : { x: b.x, y: b.y, width: b.width, height: b.height };

  const payload = Buffer.from(JSON.stringify({
    glassBlur: cfg.glassBlur === undefined ? 10 : cfg.glassBlur,
    keepWebviewsAlive: !!cfg.keepWebviewsAlive,
  })).toString('base64');

  win = new BrowserWindow({
    ...size,
    icon: path.join(__dirname, 'argus.png'),
    frame: false, transparent: true, resizable: false, hasShadow: false,
    backgroundColor: '#00000000', show: false,
    webPreferences: {
      preload: PRELOAD_PATH, contextIsolation: true, nodeIntegration: false,
      webviewTag: true, backgroundThrottling: true,
      additionalArguments: ['--hud-config=' + payload],
    },
  });

  let closing = false;
  win.on('close', (e) => {
    if (closing) return;
    e.preventDefault();
    closing = true;
    saveWebSessions().finally(() => { if (win && !win.isDestroyed()) win.destroy(); });
  });

  win.loadURL(pathToFileURL(HTML_PATH).href);
  win.once('ready-to-show', () => {
    win.show();
    if (cfg.clickThroughGaps !== false) win.setIgnoreMouseEvents(true, { forward: true });
  });

  win.webContents.on('did-attach-webview', (_e, wc) => {
    const inBrowser = wc.session === session.fromPartition('persist:browser');
    wc.setWindowOpenHandler(({ url }) => {
      if (inBrowser && /^https?:/.test(url) && win && !win.isDestroyed()) win.webContents.send('tab:open', url);
      else if (/^(https?|steam):/.test(url)) shell.openExternal(url);
      return { action: 'deny' };
    });
    const steamNav = (e, url) => {
      url = url || e.url;
      if (/^steam:/i.test(url)) { e.preventDefault(); shell.openExternal(url); }
    };
    wc.on('will-navigate', steamNav);
    wc.on('will-frame-navigate', steamNav);
  });
}

function toggleWindow() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  else if (win.isVisible()) win.hide();
  else { win.show(); win.focus(); }
}

const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0';
function setupBrowserSession() {
  const ses = session.fromPartition('persist:browser');
  ses.setUserAgent(FIREFOX_UA);
  ses.webRequest.onBeforeSendHeaders((details, cb) => {
    const h = details.requestHeaders;
    for (const k of Object.keys(h)) if (/^sec-ch-ua/i.test(k)) delete h[k];
    h['User-Agent'] = FIREFOX_UA;
    cb({ requestHeaders: h });
  });
}

const PARTS = ['persist:discord', 'persist:browser', 'persist:steam'];
function flushAll() {
  for (const p of PARTS) {
    try { const s = session.fromPartition(p); s.flushStorageData(); s.cookies.flushStore(); } catch {}
  }
}
app.on('before-quit', flushAll);
setInterval(flushAll, 30000);

app.whenReady().then(() => {
  ensureConfig();
  session.defaultSession.setDisplayMediaRequestHandler((_req, cb) => {
    desktopCapturer.getSources({ types: ['screen'] })
      .then(src => cb({ video: src[0], audio: 'loopback' }))
      .catch(() => cb({}));
  });
  setupBrowserSession();
  createWindow();
  const cfg = getConfig();
  try { globalShortcut.register(cfg.toggleHotkey || 'Control+Alt+Space', toggleWindow); } catch {}
  try { globalShortcut.register(cfg.fillHotkey || 'Control+Alt+F', toggleFill); } catch {}
  try {
    globalShortcut.register(cfg.clipHotkey || 'Control+Alt+V', () => {
      if (!win) return;
      win.show(); win.focus();
      win.webContents.send('nav', 'clipboard');
    });
  } catch {}

  const getWin = () => win;

  ipcMain.handle('settings:get', () => getSettings());
  ipcMain.handle('settings:set', (_e, patch) => setSettings(patch));

  require('./src/ipc/stats').register();
  require('./src/ipc/apps').register({ getWin });
  require('./src/ipc/spotify').register();
  require('./src/ipc/steam').register();
  require('./src/ipc/weather').register();
  require('./src/ipc/aurora').register();
  require('./src/ipc/calendar').register();
  require('./src/ipc/clipboard').register({ getWin });
  require('./src/ipc/files').register({ getWin });

  require('./src/ipc/stats').pollGpu(getWin, getConfig);
  require('./src/ipc/clipboard').clipPoll(getWin);
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { if (win && !win.isDestroyed()) win.close(); else app.quit(); });

ipcMain.handle('win:ctl', (_e, action) => {
  if (!win) return false;
  if (action === 'min') win.minimize();
  if (action === 'close') win.close();
  if (action === 'pin') { pinned = !pinned; win.setAlwaysOnTop(pinned); return pinned; }
  if (action === 'fill') return toggleFill();
  return pinned;
});

ipcMain.handle('win:interactive', (_e, on) => {
  if (!win || getConfig().clickThroughGaps === false) return;
  win.setIgnoreMouseEvents(!on, { forward: true });
});

ipcMain.handle('openExternal', (_e, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) shell.openExternal(url);
});