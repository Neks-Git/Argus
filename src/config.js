const { app } = require('electron');
const path = require('path');
const fs = require('fs');

let _root = null;
function setRoot(root) { _root = root; }

function getConfigDir() {
  if (!app.isPackaged) return _root;
  if (process.env.PORTABLE_EXECUTABLE_DIR) return process.env.PORTABLE_EXECUTABLE_DIR;
  return path.dirname(app.getPath('exe'));
}
const configFile    = () => path.join(getConfigDir(), 'config.json');
const configExample = () => path.join(getConfigDir(), 'config.example.json');

function ensureConfig() {
  const CONFIG_FILE = configFile();
  if (fs.existsSync(CONFIG_FILE)) return;
  try {
    const CONFIG_EXAMPLE = configExample();
    if (fs.existsSync(CONFIG_EXAMPLE)) {
      fs.copyFileSync(CONFIG_EXAMPLE, CONFIG_FILE);
    } else {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({
        spotifyClientId: '', steamApiKey: '', steamId64: '',
        display: null, mode: 'screen', clickThroughGaps: true,
        gpuStats: true, toggleHotkey: 'Control+Alt+Space',
        fillHotkey: 'Control+Alt+F', clipHotkey: 'Control+Alt+V',
        keepWebviewsAlive: false,
      }, null, 2));
    }
  } catch { /* read-only folder — proceed with defaults */ }
}

const readJson  = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const writeJson = (f, v)  => fs.writeFileSync(f, JSON.stringify(v, null, 2));

let _cfg = null;
const getConfig = () => _cfg || (_cfg = readJson(configFile(), {}));

const SETTINGS_DEFAULT = { location: 'Helsinki', units: 'c', username: 'neks', searchEngine: 'duckduckgo', customSearchUrl: '', calendarUrl: '', glassBlur: 10, glassTint: 70 };
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
let _set = null;
const getSettings = () => {
  if (_set) return _set;
  const s = readJson(settingsFile(), {});
  if (s.glassBlur === undefined) {
    const cfgBlur = getConfig().glassBlur;
    if (typeof cfgBlur === 'number' && cfgBlur >= 0) {
      s.glassBlur = cfgBlur;
      try { writeJson(settingsFile(), s); } catch {}
    }
  }
  _set = { ...SETTINGS_DEFAULT, ...s };
  return _set;
};
function setSettings(patch) {
  const next = { ...getSettings() };
  for (const k of Object.keys(SETTINGS_DEFAULT)) {
    if (patch && k in patch) {
      const v = patch[k];
      if (typeof v === 'string') next[k] = v.slice(0, 600);
      else if (typeof v === 'number' || typeof v === 'boolean') next[k] = v;
    }
  }
  if (next.units !== 'c' && next.units !== 'f') next.units = 'c';
  if (typeof next.glassBlur !== 'number' || !isFinite(next.glassBlur)) next.glassBlur = 10;
  if (typeof next.glassTint !== 'number' || !isFinite(next.glassTint)) next.glassTint = 70;
  next.glassBlur = Math.max(0, Math.min(30, Math.round(next.glassBlur)));
  next.glassTint = Math.max(20, Math.min(100, Math.round(next.glassTint)));
  _set = next;
  writeJson(settingsFile(), _set);
  return _set;
}

module.exports = {
  setRoot, getConfigDir, ensureConfig, readJson, writeJson, getConfig,
  SETTINGS_DEFAULT, settingsFile, getSettings, setSettings,
};