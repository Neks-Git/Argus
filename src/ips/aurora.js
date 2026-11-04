const { ipcMain } = require('electron');
const { getSettings } = require('../config');
const { geocode } = require('../geo');

let _kp = null, _kpAt = 0;

module.exports = {
  register() {
    ipcMain.handle('aurora:get', async () => {
      try {
        if (_kp === null || Date.now() - _kpAt > 600000) {
          const r = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
          if (!r.ok) return { error: 'noaa ' + r.status };
          const a = await r.json();
          const last = a[a.length - 1];
          _kp = Array.isArray(last) ? Number(last[1]) : Number(last.Kp != null ? last.Kp : last.kp_index);
          _kpAt = Date.now();
        }
        const q = (getSettings().location || '').trim();
        const loc = q ? await geocode(q) : null;
        if (!loc || !Number.isFinite(_kp)) return { error: 'no data' };
        const gm = Math.abs(loc.lat) - 2.5;
        return { kp: _kp, need: Math.max(0, (66.5 - gm) / 2.1) };
      } catch { return { error: 'offline' }; }
    });
  },
};