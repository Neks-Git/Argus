const fs = require('fs');
const path = require('path');
const os = require('os');
const { ipcMain, shell } = require('electron');
const { getConfig } = require('../config');

const readText = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
const SKIP_APPS = /^(Steamworks|Proton|Steam Linux Runtime|Steam Controller Configs)/i;

function steamRoot() {
  const c = getConfig();
  if (c.steamPath && fs.existsSync(c.steamPath)) return c.steamPath;
  const home = os.homedir();
  return [
    'C:\\Program Files (x86)\\Steam', 'C:\\Program Files\\Steam',
    path.join(home, '.steam', 'steam'), path.join(home, '.local', 'share', 'Steam'),
    path.join(home, 'Library', 'Application Support', 'Steam'),
  ].find(p => fs.existsSync(p)) || null;
}

function steamLibs(root) {
  const libs = new Set([root]);
  const lf = readText(path.join(root, 'steamapps', 'libraryfolders.vdf'));
  for (const m of lf.matchAll(/"path"\s+"([^"]+)"/g)) libs.add(m[1].replace(/\\\\/g, '\\'));
  return [...libs];
}

function parseSteamLocal() {
  const root = steamRoot();
  if (!root) return null;
  const libs = new Set([root]);
  const lf = readText(path.join(root, 'steamapps', 'libraryfolders.vdf'));
  for (const m of lf.matchAll(/"path"\s+"([^"]+)"/g)) libs.add(m[1].replace(/\\\\/g, '\\'));

  const kv = (s, k) => { const m = s.match(new RegExp('"' + k + '"\\s+"([^"]*)"', 'i')); return m ? m[1] : null; };
  const games = [];
  for (const lib of libs) {
    const dir = path.join(lib, 'steamapps');
    let files = [];
    try { files = fs.readdirSync(dir).filter(f => /^appmanifest_\d+\.acf$/.test(f)); } catch { continue; }
    for (const f of files) {
      const s = readText(path.join(dir, f));
      const appid = Number(kv(s, 'appid')), name = kv(s, 'name'), flags = Number(kv(s, 'StateFlags') || 0);
      if (!appid || !name || !(flags & 4) || SKIP_APPS.test(name)) continue;
      games.push({ appid, name, lastPlayed: Number(kv(s, 'LastPlayed') || 0) });
    }
  }

  let steamId = null;
  const lu = readText(path.join(root, 'config', 'loginusers.vdf'));
  for (const m of lu.matchAll(/"(\d{17})"\s*\{([^}]*)\}/g)) if (/"MostRecent"\s+"1"/.test(m[2])) steamId = m[1];
  if (!steamId) { const m = lu.match(/"(\d{17})"/); steamId = m ? m[1] : null; }
  return { games, steamId };
}

let _steam = null, _steamAt = 0;
async function steamLibrary(force) {
  if (!force && _steam && Date.now() - _steamAt < 60000) return _steam;
  const { steamApiKey, steamId64 } = getConfig();
  const local = parseSteamLocal();
  const map = new Map();
  for (const g of (local ? local.games : [])) {
    map.set(g.appid, { appid: g.appid, name: g.name, playtime: 0, lastPlayed: g.lastPlayed, installed: true });
  }

  let note = '';
  const id = steamId64 || (local && local.steamId);
  if (steamApiKey && id) {
    try {
      const r = await fetch('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?' + new URLSearchParams({
        key: steamApiKey, steamid: id, include_appinfo: '1', include_played_free_games: '1',
      }));
      if (!r.ok) note = 'steam api error ' + r.status;
      else {
        const j = await r.json();
        const owned = (j.response && j.response.games) || [];
        if (!owned.length) note = 'steam returned no games, set your profile game details to public';
        for (const g of owned) {
          const cur = map.get(g.appid);
          map.set(g.appid, {
            appid: g.appid, name: g.name || (cur && cur.name) || String(g.appid),
            playtime: g.playtime_forever || 0,
            lastPlayed: g.rtime_last_played || (cur && cur.lastPlayed) || 0,
            installed: !!cur,
          });
        }
      }
    } catch { note = 'could not reach steam api'; }
  } else if (!steamApiKey) note = 'showing installed games only, add steamApiKey to config.json for your full library';
  else note = 'could not detect your steamId64, add it to config.json';

  const games = [...map.values()].sort((a, b) => b.lastPlayed - a.lastPlayed || b.playtime - a.playtime || a.name.localeCompare(b.name));
  _steam = games.length
    ? { games, note }
    : { error: note || (steamRoot() ? 'no games found' : 'steam not found, set steamPath in config.json') };
  _steamAt = Date.now();
  return _steam;
}

const _dl = {};

module.exports = {
  register() {
    ipcMain.handle('steam:games', (_e, force) => steamLibrary(force));

    ipcMain.handle('steam:launch', (_e, appid, installed) => {
      const id = Number(appid);
      if (Number.isInteger(id) && id > 0) shell.openExternal((installed === false ? 'steam://install/' : 'steam://rungameid/') + id);
    });

    ipcMain.handle('steam:open', (_e, appid) => {
      const id = Number(appid);
      if (Number.isInteger(id) && id > 0) shell.openExternal('steam://nav/games/details/' + id);
    });

    ipcMain.handle('steam:downloads', () => {
      const root = steamRoot();
      if (!root) return [];
      const kv = (s, k) => { const m = s.match(new RegExp('"' + k + '"\\s+"([^"]*)"', 'i')); return m ? m[1] : null; };
      const now = Date.now(), out = [], seen = new Set();
      for (const lib of steamLibs(root)) {
        const dir = path.join(lib, 'steamapps');
        let files = [];
        try { files = fs.readdirSync(dir).filter(f => /^appmanifest_\d+\.acf$/.test(f)); } catch { continue; }
        for (const f of files) {
          const s = readText(path.join(dir, f));
          const appid = Number(kv(s, 'appid')), name = kv(s, 'name');
          const total = Number(kv(s, 'BytesToDownload') || 0), done = Number(kv(s, 'BytesDownloaded') || 0);
          if (!appid || !name || !total || done >= total) continue;
          seen.add(appid);
          let d = _dl[appid];
          if (!d) d = _dl[appid] = { bytes: done, t: now, speed: 0, moved: now };
          if (done !== d.bytes) {
            const inst = Math.max(0, (done - d.bytes) / ((now - d.t) / 1000));
            d.speed = d.speed ? d.speed * 0.5 + inst * 0.5 : inst;
            d.bytes = done; d.t = now; d.moved = now;
          } else if (now - d.moved > 10000) d.speed = 0;
          out.push({ appid, name, total, done, speed: d.speed, stalled: now - d.moved > 10000 });
        }
      }
      for (const k of Object.keys(_dl)) if (!seen.has(Number(k))) delete _dl[k];
      return out;
    });
  },
};