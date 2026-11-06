/* =============================================================================
   PRELOAD
   ============================================================================= */
module.exports = `
const { contextBridge, ipcRenderer } = require('electron');

const CFG_PREFIX = '--hud-config=';
const arg = process.argv.find(a => a.startsWith(CFG_PREFIX));
const CONFIG = arg ? JSON.parse(Buffer.from(arg.slice(CFG_PREFIX.length), 'base64').toString()) : {};

contextBridge.exposeInMainWorld('hud', {
  win: (action) => ipcRenderer.invoke('win:ctl', action),
  setInteractive: (on) => ipcRenderer.invoke('win:interactive', on),
  openExternal: (url) => ipcRenderer.invoke('openExternal', url),
  stats: () => ipcRenderer.invoke('stats'),
  statsFull: () => ipcRenderer.invoke('stats:full'),
  statsProcs: () => ipcRenderer.invoke('stats:procs'),
  spotifyLogin: () => ipcRenderer.invoke('spotify:login'),
  spotifyState: () => ipcRenderer.invoke('spotify:state'),
  spotifyControl: (action, value) => ipcRenderer.invoke('spotify:control', action, value),
  spotifyPlaylists: (force) => ipcRenderer.invoke('spotify:playlists', force),
  spotifyPlay: (uri) => ipcRenderer.invoke('spotify:playContext', uri),
  spotifyQueue: () => ipcRenderer.invoke('spotify:queue'),
  spotifyArtist: (id) => ipcRenderer.invoke('spotify:artist', id),
  spotifyTracks: (id) => ipcRenderer.invoke('spotify:tracks', id),
  spotifyPlayTrack: (ctx, track) => ipcRenderer.invoke('spotify:playTrack', ctx, track),
  steamGames: (force) => ipcRenderer.invoke('steam:games', force),
  steamLaunch: (appid, installed) => ipcRenderer.invoke('steam:launch', appid, installed),
  steamOpen: (appid) => ipcRenderer.invoke('steam:open', appid),
  steamDownloads: () => ipcRenderer.invoke('steam:downloads'),
  onOpenTab: (cb) => ipcRenderer.on('tab:open', (_e, url) => cb(url)),
  onNav: (cb) => ipcRenderer.on('nav', (_e, n) => cb(n)),
  onFillState: (cb) => ipcRenderer.on('fill:state', (_e, on) => cb(on)),
  config: () => CONFIG,
  spotifyLaunch: () => ipcRenderer.invoke('spotify:launch'),
  weather: () => ipcRenderer.invoke('weather:get'),
  auroraGet: () => ipcRenderer.invoke('aurora:get'),
  settingsGet: () => ipcRenderer.invoke('settings:get'),
  settingsSet: (patch) => ipcRenderer.invoke('settings:set', patch),
  fmPlaces: () => ipcRenderer.invoke('fm:places'),
  fmScan: (p) => ipcRenderer.invoke('fm:scan', p),
  fmCancel: () => ipcRenderer.invoke('fm:cancel'),
  fmChildren: (id) => ipcRenderer.invoke('fm:children', id),
  fmReveal: (p) => ipcRenderer.invoke('fm:reveal', p),
  fmOpen: (p) => ipcRenderer.invoke('fm:open', p),
  fmTrash: (p) => ipcRenderer.invoke('fm:trash', p),
  fmDelete: (p) => ipcRenderer.invoke('fm:delete', p),
  fmStat: (p) => ipcRenderer.invoke('fm:stat', p),
  fmCopy: (t) => ipcRenderer.invoke('fm:copy', t),
  procKill: (pid, name, tree) => ipcRenderer.invoke('proc:kill', pid, name, tree),
  appsList: () => ipcRenderer.invoke('apps:list'),
  appsAdd: () => ipcRenderer.invoke('apps:add'),
  appsLaunch: (p) => ipcRenderer.invoke('apps:launch', p),
  appsRemove: (p) => ipcRenderer.invoke('apps:remove', p),
  calEvents: (force) => ipcRenderer.invoke('cal:events', force),
  clipList: () => ipcRenderer.invoke('clip:list'),
  clipCopy: (id) => ipcRenderer.invoke('clip:copy', id),
  clipPin: (id) => ipcRenderer.invoke('clip:pin', id),
  clipDel: (id) => ipcRenderer.invoke('clip:del', id),
  clipClear: () => ipcRenderer.invoke('clip:clear'),
  clipPause: (on) => ipcRenderer.invoke('clip:pause', on),
  onClip: (cb) => ipcRenderer.on('clip:changed', () => cb()),
  onFmProgress: (cb) => ipcRenderer.on('fm:progress', (_e, d) => cb(d)),
});
`;