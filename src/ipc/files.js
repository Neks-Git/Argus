const { ipcMain, shell, clipboard, app } = require('electron');
const fs = require('fs');
const path = require('path');
const si = require('../si');

const FM_MAX_FILES = 300;
let scanId = 0, scanRoot = null, nodeSeq = 0;
const nodeIndex = new Map();

const fmLim = { n: 0, max: 32, q: [] };
async function fmSlot(fn) {
  if (fmLim.n >= fmLim.max) await new Promise(r => fmLim.q.push(r));
  fmLim.n++;
  try { return await fn(); }
  finally { fmLim.n--; const r = fmLim.q.shift(); if (r) r(); }
}

function fmNode(name, full, parent) {
  const n = { id: ++nodeSeq, name, path: full, parent, size: 0, ownSize: 0, files: 0, dirs: 0, kids: [], big: [], other: { size: 0, count: 0 } };
  nodeIndex.set(n.id, n);
  return n;
}

async function fmRead(node, token, st) {
  const subdirs = [], names = [];
  let ents;
  try { ents = await fs.promises.readdir(node.path, { withFileTypes: true }); }
  catch { st.errors++; return subdirs; }
  for (const d of ents) {
    if (d.isSymbolicLink()) continue;
    if (d.isDirectory()) subdirs.push(d.name);
    else if (d.isFile()) names.push(d.name);
  }
  if (token !== scanId) return subdirs;

  const base = node.path.endsWith(path.sep) ? node.path : node.path + path.sep;
  const list = new Array(names.length);
  let bad = 0;
  await Promise.all(names.map((n, i) =>
    fs.promises.lstat(base + n).then(s => { list[i] = { name: n, size: s.size }; }, () => { bad++; })));
  st.errors += bad;
  const files = bad ? list.filter(Boolean) : list;

  let total = 0;
  for (const f of files) {
    total += f.size;
    if (f.size > st.minTop) st.top.push({ path: base + f.name, name: f.name, size: f.size });
  }
  if (st.top.length > 2000) { st.top.sort((a, b) => b.size - a.size); st.top.length = 200; st.minTop = st.top[199].size; }

  files.sort((a, b) => b.size - a.size);
  node.big = files.slice(0, FM_MAX_FILES);
  for (let i = FM_MAX_FILES; i < files.length; i++) { node.other.size += files[i].size; node.other.count++; }
  node.ownSize = total; node.files = files.length;
  st.files += files.length; st.bytes += total; st.cur = node.path;
  return subdirs;
}

async function fmWalk(node, token, st) {
  if (token !== scanId) return;
  const subs = await fmSlot(() => fmRead(node, token, st));
  if (token !== scanId) return;
  const kids = subs.map(n => fmNode(n, path.join(node.path, n), node));
  await Promise.all(kids.map(k => fmWalk(k, token, st)));
  if (token !== scanId) return;
  kids.sort((a, b) => b.size - a.size);
  node.kids = kids;
  node.size = node.ownSize; node.dirs = kids.length;
  for (const k of kids) { node.size += k.size; node.files += k.files; node.dirs += k.dirs; }
}

function fmLocate(p) {
  if (!scanRoot || typeof p !== 'string') return null;
  const rel = path.relative(scanRoot.path, p);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const parts = rel.split(path.sep);
  let n = scanRoot;
  for (let i = 0; i < parts.length - 1; i++) { n = n.kids.find(k => k.name === parts[i]); if (!n) return null; }
  return { parent: n, name: parts[parts.length - 1] };
}

async function fmRemove(p, permanent) {
  const loc = fmLocate(p);
  if (!loc) return { error: 'outside the scanned folder' };
  const { parent, name } = loc;
  const dirNode = parent.kids.find(k => k.name === name);
  const fileI = dirNode ? -1 : parent.big.findIndex(f => f.name === name);
  if (!dirNode && fileI < 0) return { error: 'not part of the scan' };
  try {
    if (permanent) await fs.promises.rm(p, { recursive: true, force: false });
    else await shell.trashItem(p);
  } catch { return { error: permanent ? 'could not delete' : 'could not move to the recycle bin' }; }
  let size, files, dirs;
  if (dirNode) { size = dirNode.size; files = dirNode.files; dirs = dirNode.dirs + 1; parent.kids = parent.kids.filter(k => k !== dirNode); }
  else { size = parent.big[fileI].size; files = 1; dirs = 0; parent.big.splice(fileI, 1); }
  for (let a = parent; a; a = a.parent) { a.size -= size; a.files -= files; a.dirs -= dirs; }
  return { ok: true, size: scanRoot.size, files: scanRoot.files, dirs: scanRoot.dirs };
}

module.exports = {
  register({ getWin }) {
    ipcMain.handle('fm:places', async () => {
      let drives = [];
      if (si) {
        try {
          drives = (await si.fsSize()).filter(d => d.size > 0).map(d => {
            let m = d.mount || d.fs;
            if (/^[A-Za-z]:$/.test(m)) m += '\\';
            return { name: d.mount || d.fs, path: m, size: d.size, used: d.used };
          });
        } catch {}
      }
      const places = [];
      for (const [label, key] of [['Home', 'home'], ['Desktop', 'desktop'], ['Documents', 'documents'], ['Downloads', 'downloads'], ['Pictures', 'pictures'], ['Videos', 'videos'], ['Music', 'music'], ['AppData', 'appData']]) {
        try { const p = app.getPath(key); if (fs.existsSync(p)) places.push({ name: label, path: p }); } catch {}
      }
      return { drives, places };
    });

    ipcMain.handle('fm:scan', async (_e, p) => {
      if (typeof p !== 'string' || !p.trim()) return { error: 'enter a folder path' };
      try { if (!(await fs.promises.stat(p)).isDirectory()) return { error: 'that is a file, pick a folder' }; }
      catch { return { error: 'cannot open that path' }; }

      const token = ++scanId;
      nodeIndex.clear(); nodeSeq = 0;
      const root = fmNode(path.basename(p) || p, p, null);
      scanRoot = root;
      const st = { files: 0, bytes: 0, errors: 0, cur: p, top: [], minTop: 0 };
      const tick = setInterval(() => {
        const win = getWin();
        if (win && !win.isDestroyed()) win.webContents.send('fm:progress', { files: st.files, bytes: st.bytes, cur: st.cur });
      }, 250);
      try { await fmWalk(root, token, st); } finally { clearInterval(tick); }
      if (token !== scanId) return { cancelled: true };
      st.top.sort((a, b) => b.size - a.size);
      return { id: root.id, name: root.name, path: p, size: root.size, files: root.files, dirs: root.dirs, errors: st.errors, top: st.top.slice(0, 100) };
    });

    ipcMain.handle('fm:cancel', () => { scanId++; });

    ipcMain.handle('fm:children', (_e, id) => {
      const n = nodeIndex.get(id);
      if (!n) return { size: 0, rows: [] };
      let rows = n.kids.map(k => ({ id: k.id, name: k.name, path: k.path, dir: true, size: k.size, files: k.files }));
      for (const f of n.big) rows.push({ name: f.name, path: path.join(n.path, f.name), dir: false, size: f.size });
      if (n.other.count) rows.push({ other: true, name: n.other.count + ' smaller files', size: n.other.size, files: n.other.count });
      rows.sort((a, b) => b.size - a.size);
      if (rows.length > 400) {
        const rest = rows.slice(400);
        rows = rows.slice(0, 400);
        rows.push({ other: true, name: rest.length + ' more items', size: rest.reduce((s, r) => s + r.size, 0) });
      }
      return { size: n.size, rows };
    });

    ipcMain.handle('fm:reveal', (_e, p) => { if (fmLocate(p)) shell.showItemInFolder(p); });
    ipcMain.handle('fm:open', async (_e, p) => { if (fmLocate(p)) return shell.openPath(p); });
    ipcMain.handle('fm:trash', (_e, p) => fmRemove(p, false));
    ipcMain.handle('fm:delete', (_e, p) => fmRemove(p, true));
    ipcMain.handle('fm:copy', (_e, t) => { clipboard.writeText(String(t).slice(0, 4096)); });
    ipcMain.handle('fm:stat', async (_e, p) => {
      if (!fmLocate(p)) return { error: 'outside the scanned folder' };
      try { const s = await fs.promises.stat(p); return { birthtimeMs: s.birthtimeMs, mtimeMs: s.mtimeMs }; }
      catch { return { error: 'unreadable' }; }
    });
  },
};