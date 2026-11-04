const { app, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { getConfig, readJson, writeJson } = require('../config');

const tokFile = () => path.join(app.getPath('userData'), 'spotify.json');
const REDIRECT = 'http://127.0.0.1:8888/callback';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SCOPES = 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative';

let _loggingIn = false;

async function spotifyLogin() {
  if (_loggingIn) return false;
  const clientId = getConfig().spotifyClientId;
  if (!clientId) return false;
  _loggingIn = true;
  try {
    const verifier = crypto.randomBytes(48).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const authUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
      client_id: clientId, response_type: 'code', redirect_uri: REDIRECT,
      code_challenge_method: 'S256', code_challenge: challenge, scope: SCOPES,
    });
    const code = await new Promise((resolve, reject) => {
      const srv = http.createServer((req, res) => {
        const u = new URL(req.url, 'http://127.0.0.1:8888');
        if (u.pathname !== '/callback') { res.end(); return; }
        res.end('<body style="font-family:sans-serif;background:#111;color:#fff;padding:40px">Connected. You can close this tab.</body>');
        srv.close();
        const c = u.searchParams.get('code');
        c ? resolve(c) : reject(new Error('no code'));
      });
      srv.on('error', reject);
      srv.listen(8888, '127.0.0.1');
      setTimeout(() => { srv.close(); reject(new Error('timeout')); }, 120000);
      shell.openExternal(authUrl);
    }).catch(() => null);
    if (!code) return false;
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', code, redirect_uri: REDIRECT,
        client_id: clientId, code_verifier: verifier,
      }),
    });
    if (!r.ok) return false;
    const j = await r.json();
    writeJson(tokFile(), {
      access_token: j.access_token, refresh_token: j.refresh_token,
      expires_at: Date.now() + j.expires_in * 1000,
    });
    return true;
  } finally { _loggingIn = false; }
}

async function getToken() {
  const s = readJson(tokFile(), null);
  if (!s) return null;
  if (Date.now() < s.expires_at - 30000) return s.access_token;
  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token', refresh_token: s.refresh_token,
        client_id: getConfig().spotifyClientId,
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const n = {
      access_token: j.access_token,
      refresh_token: j.refresh_token || s.refresh_token,
      expires_at: Date.now() + j.expires_in * 1000,
    };
    writeJson(tokFile(), n);
    return n.access_token;
  } catch { return null; }
}

async function spotifyApi(method, ep, params, retried) {
  const t = await getToken();
  if (!t) return null;
  const url = 'https://api.spotify.com/v1' + ep + (params ? '?' + new URLSearchParams(params) : '');
  try {
    const r = await fetch(url, { method, headers: { Authorization: 'Bearer ' + t } });
    if (r.status === 401 && !retried) {
      const st = readJson(tokFile(), null);
      if (st) { st.expires_at = 0; writeJson(tokFile(), st); }
      return spotifyApi(method, ep, params, true);
    }
    if (r.status === 204 || !r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function spotifyState() {
  if (!getConfig().spotifyClientId) return { connected: false, needsConfig: true };
  const t = await getToken();
  if (!t) return { connected: false };
  const d = await spotifyApi('GET', '/me/player');
  if (!d || !d.item) return { connected: true, idle: true };
  const it = d.item;
  return {
    connected: true, playing: d.is_playing, title: it.name,
    artist: (it.artists || []).map(a => a.name).join(', ') || (it.show && it.show.name) || '',
    art: (it.album && it.album.images && it.album.images[0] && it.album.images[0].url)
      || (it.images && it.images[0] && it.images[0].url) || '',
    progress: d.progress_ms || 0, duration: it.duration_ms || 0,
    volume: (d.device && d.device.supports_volume !== false && d.device.volume_percent != null) ? d.device.volume_percent : null,
    context: d.context ? d.context.uri : null,
  };
}

async function spotifyRaw(method, ep, params, body) {
  const t = await getToken();
  if (!t) return { status: 0 };
  const url = 'https://api.spotify.com/v1' + ep + (params ? '?' + new URLSearchParams(params) : '');
  try {
    const headers = { Authorization: 'Bearer ' + t };
    if (body) headers['Content-Type'] = 'application/json';
    const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let json = null;
    try { json = await r.json(); } catch {}
    return { status: r.status, json };
  } catch { return { status: -1 }; }
}

let _pl = null, _plAt = 0;

module.exports = {
  register() {
    ipcMain.handle('spotify:login', () => spotifyLogin());
    ipcMain.handle('spotify:state', () => spotifyState());
    ipcMain.handle('spotify:control', async (_e, action, value) => {
      switch (action) {
        case 'play': return spotifyApi('PUT', '/me/player/play');
        case 'pause': return spotifyApi('PUT', '/me/player/pause');
        case 'next': return spotifyApi('POST', '/me/player/next');
        case 'prev': return spotifyApi('POST', '/me/player/previous');
        case 'seek': return spotifyApi('PUT', '/me/player/seek', { position_ms: String(Math.round(value)) });
        case 'volume': return spotifyApi('PUT', '/me/player/volume', { volume_percent: String(Math.max(0, Math.min(100, Math.round(value)))) });
      }
      return null;
    });

    ipcMain.handle('spotify:playlists', async (_e, force) => {
      if (!getConfig().spotifyClientId) return { error: 'add spotifyClientId to config.json' };
      if (!force && _pl && Date.now() - _plAt < 300000) return { playlists: _pl };
      const out = [];
      for (let off = 0; off < 200; off += 50) {
        const r = await spotifyRaw('GET', '/me/playlists', { limit: '50', offset: String(off) });
        if (r.status === 0 || r.status === 401 || r.status === 403) return { reconnect: true, error: 'reconnect spotify to load playlists' };
        if (r.status !== 200 || !r.json) return { error: 'spotify error ' + r.status };
        for (const p of r.json.items || []) {
          if (!p) continue;
          out.push({
            uri: p.uri, name: p.name,
            img: p.images && p.images.length ? p.images[p.images.length - 1].url : '',
            count: p.items && p.items.total != null ? p.items.total : (p.tracks ? p.tracks.total : null),
          });
        }
        if (!r.json.next) break;
      }
      _pl = out; _plAt = Date.now();
      return { playlists: out };
    });

    ipcMain.handle('spotify:playContext', async (_e, uri) => {
      if (typeof uri !== 'string' || !uri.startsWith('spotify:')) return { error: 'bad uri' };
      let r = await spotifyRaw('PUT', '/me/player/play', null, { context_uri: uri });
      if (r.status === 404) {
        const dv = await spotifyRaw('GET', '/me/player/devices');
        const list = (dv.json && dv.json.devices) || [];
        const dev = list.find(d => d.is_active) || list[0];
        if (!dev) return { error: 'open spotify on a device first' };
        r = await spotifyRaw('PUT', '/me/player/play', { device_id: dev.id }, { context_uri: uri });
      }
      if (r.status === 403) return { error: 'needs spotify premium' };
      return r.status >= 200 && r.status < 300 ? { ok: true } : { error: 'spotify error ' + r.status };
    });
  },
};