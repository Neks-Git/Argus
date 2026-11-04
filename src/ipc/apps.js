const { app, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { readJson, writeJson } = require('../config');

const appsFile = () => path.join(app.getPath('userData'), 'apps.json');

async function appsWithIcons() {
  const list = readJson(appsFile(), []);
  return Promise.all(list.map(async a => {
    let icon = '';
    try { icon = (await app.getFileIcon(a.path, { size: 'large' })).toDataURL(); } catch {}
    return { ...a, icon };
  }));
}

module.exports = {
  register({ getWin }) {
    ipcMain.handle('apps:list', () => appsWithIcons());

    ipcMain.handle('apps:add', async () => {
      const r = await dialog.showOpenDialog(getWin(), {
        properties: ['openFile', 'multiSelect'],
        filters: [{ name: 'Programs', extensions: ['exe', 'lnk', 'bat', 'url'] }, { name: 'All files', extensions: ['*'] }],
      });
      if (!r.canceled) {
        const list = readJson(appsFile(), []);
        for (const p of r.filePaths) {
          if (!list.some(a => a.path === p)) list.push({ path: p, name: path.basename(p, path.extname(p)) });
        }
        writeJson(appsFile(), list);
      }
      return appsWithIcons();
    });

    ipcMain.handle('apps:launch', (_e, p) => {
      if (readJson(appsFile(), []).some(a => a.path === p)) return shell.openPath(p);
    });

    ipcMain.handle('apps:remove', (_e, p) => {
      writeJson(appsFile(), readJson(appsFile(), []).filter(a => a.path !== p));
      return appsWithIcons();
    });
  },
};