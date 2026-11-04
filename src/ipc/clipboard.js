const { ipcMain, clipboard, nativeImage, app } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { readJson, writeJson } = require('../config');

const clipFile = () => path.join(app.getPath('userData'), 'clipboard.json');
const clipDir  = () => path.join(app.getPath('userData'), 'clips');

let CLIP = null, clipPaused = false, _cbSig = '', _cbFm = '', _cbTick = 0, _cbSeq = 0, _cbSaveT = null;
const clipGet  = () => CLIP || (CLIP = readJson(clipFile(), []));
const clipId   = () => Date.now() * 100 + (_cbSeq++ % 100);
const clipSave = () => { clearTimeout(_cbSaveT); _cbSaveT = setTimeout(() => { try { writeJson(clipFile(), clipGet()); } catch {} }, 500); };
app.on('before-quit', () => { try { if (CLIP) writeJson(clipFile(), CLIP); } catch {} });

function clipDrop(c) {
  if (c.file) { try { fs.unlinkSync(path.join(clipDir(), c.file)); } catch {} }
  const l = clipGet(), i = l.indexOf(c);
  if (i >= 0) l.splice(i, 1);
}
function clipPrune() {
  let ni = 0;
  clipGet().filter(c => !c.pin).forEach((c, i) => {
    if (c.type === 'img') ni++;
    if (i >= 150 || (c.type === 'img' && ni > 30)) clipDrop(c);
  });
}
const clipBump = (c) => { const l = clipGet(); l.splice(l.indexOf(c), 1); c.t = Date.now(); l.unshift(c); };

function clipPoll(getWin) {
  setTimeout(() => clipPoll(getWin), 800);
  if (clipPaused) return;
  try {
    const fm = clipboard.availableFormats();
    if (fm.some(f => /exclude|concealed|password/i.test(f))) return;
    const txt = clipboard.readText();
    if (txt && txt.trim()) {
      if (txt === _cbSig) return;
      _cbSig = txt;
      if (txt.length > 100000) return;
      const ex = clipGet().find(c => c.type === 'text' && c.text === txt);
      if (ex) clipBump(ex);
      else clipGet().unshift({ id: clipId(), type: 'text', text: txt, t: Date.now(), pin: false });
    } else if (fm.some(f => /^image\//.test(f))) {
      const key = fm.join(',');
      if (key === _cbFm && ++_cbTick % 6) return;
      _cbFm = key;
      const img = clipboard.readImage();
      if (img.isEmpty()) return;
      const png = img.toPNG();
      const hash = crypto.createHash('md5').update(png).digest('hex');
      if (hash === _cbSig) return;
      _cbSig = hash;
      const ex = clipGet().find(c => c.hash === hash);
      if (ex) clipBump(ex);
      else {
        fs.mkdirSync(clipDir(), { recursive: true });
        const id = clipId(), sz = img.getSize();
        fs.writeFileSync(path.join(clipDir(), id + '.png'), png);
        const thumb = img.resize({ width: Math.min(200, sz.width) }).toDataURL();
        clipGet().unshift({ id, type: 'img', file: id + '.png', hash, thumb, w: sz.width, h: sz.height, t: Date.now(), pin: false });
      }
    } else return;
    clipPrune(); clipSave();
    const win = getWin();
    if (win && !win.isDestroyed()) win.webContents.send('clip:changed');
  } catch {}
}

module.exports = {
  clipPoll,
  register() {
    ipcMain.handle('clip:list', () => ({
      paused: clipPaused,
      items: clipGet().map(c => c.type === 'img'
        ? { id: c.id, type: 'img', thumb: c.thumb, w: c.w, h: c.h, t: c.t, pin: !!c.pin }
        : { id: c.id, type: 'text', text: c.text.slice(0, 600), len: c.text.length, t: c.t, pin: !!c.pin }),
    }));
    ipcMain.handle('clip:copy', (_e, id) => {
      const c = clipGet().find(x => x.id === id);
      if (!c) return false;
      if (c.type === 'img') {
        const img = nativeImage.createFromPath(path.join(clipDir(), c.file));
        if (img.isEmpty()) return false;
        clipboard.writeImage(img);
      } else clipboard.writeText(c.text);
      return true;
    });
    ipcMain.handle('clip:pin', (_e, id) => { const c = clipGet().find(x => x.id === id); if (c) { c.pin = !c.pin; clipSave(); } });
    ipcMain.handle('clip:del', (_e, id) => { const c = clipGet().find(x => x.id === id); if (c) { clipDrop(c); clipSave(); } });
    ipcMain.handle('clip:clear', () => { clipGet().filter(c => !c.pin).forEach(clipDrop); clipSave(); });
    ipcMain.handle('clip:pause', (_e, on) => { clipPaused = !!on; return clipPaused; });
  },
};