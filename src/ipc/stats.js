const os = require('os');
const { ipcMain, app } = require('electron');
const { execFile } = require('child_process');
const si = require('../si');

function cpuSample() {
  let idle = 0, total = 0;
  for (const c of os.cpus()) {
    for (const k in c.times) total += c.times[k];
    idle += c.times.idle;
  }
  return { idle, total };
}
let lastCpu = cpuSample();

let gpuInfo = { gpu: null, vram: null };
function pollGpu(getWin, getConfig) {
  async function tick() {
    if (!si || getConfig().gpuStats === false) return;
    const win = getWin();
    if (win && !win.isVisible()) { setTimeout(tick, 15000); return; }
    try {
      const g = await si.graphics();
      const list = g.controllers || [];
      const c = list.find(x => x.utilizationGpu != null) || list[0];
      if (c) {
        gpuInfo = {
          gpu: c.utilizationGpu != null ? Math.round(c.utilizationGpu) : null,
          vram: (c.memoryUsed != null && c.memoryTotal) ? Math.round((c.memoryUsed / c.memoryTotal) * 100) : null,
        };
      }
    } catch {}
    setTimeout(tick, 15000);
  }
  tick();
}

let _netIface = null, _netPrev = null;
async function netRates() {
  if (_netIface === null) { try { _netIface = await si.networkInterfaceDefault(); } catch { _netIface = ''; } }
  let nets = [];
  try { nets = await si.networkStats(_netIface || '*'); } catch {}
  if (!nets.length && _netIface) { _netIface = ''; try { nets = await si.networkStats('*'); } catch {} }
  let rxT = 0, txT = 0;
  for (const n of nets) {
    if (/loopback|^lo$/i.test(n.iface || '')) continue;
    rxT += n.rx_bytes || 0; txT += n.tx_bytes || 0;
  }
  const now = Date.now();
  let rx = 0, tx = 0;
  if (_netPrev && now > _netPrev.t) {
    const dt = (now - _netPrev.t) / 1000;
    rx = Math.max(0, (rxT - _netPrev.rxT) / dt);
    tx = Math.max(0, (txT - _netPrev.txT) / dt);
  }
  _netPrev = { t: now, rxT, txT };
  return { rx, tx, rxT, txT };
}

let _cpuName = null;
const PROTECTED = /^(system|system idle process|registry|smss|csrss|wininit|winlogon|services|lsass|svchost|dwm|fontdrvhost|memory compression)(\.exe)?$/i;

function register() {
  ipcMain.handle('stats', () => {
    const now = cpuSample();
    const di = now.idle - lastCpu.idle;
    const dt = now.total - lastCpu.total;
    lastCpu = now;
    return {
      cpu: dt > 0 ? Math.round((1 - di / dt) * 100) : 0,
      ram: Math.round((1 - os.freemem() / os.totalmem()) * 100),
      gpu: gpuInfo.gpu, vram: gpuInfo.vram, uptime: os.uptime(),
    };
  });

  ipcMain.handle('stats:full', async () => {
    if (!si) return { error: 'systeminformation missing' };
    try {
      if (!_cpuName) { const c = await si.cpu(); _cpuName = c.brand || ''; }
      const [load, speed, temp, mem, disks] = await Promise.all([
        si.currentLoad(),
        si.cpuCurrentSpeed().catch(() => null),
        si.cpuTemperature().catch(() => null),
        si.mem(),
        si.fsSize().catch(() => []),
      ]);
      const net = await netRates();
      return {
        name: _cpuName,
        cpu: Math.round(load.currentLoad),
        cores: load.cpus.map(c => Math.round(c.load)),
        ghz: speed && speed.avg ? speed.avg : null,
        temp: temp && temp.main != null ? Math.round(temp.main) : null,
        mem: {
          total: mem.total, used: mem.total - mem.available, avail: mem.available,
          cache: mem.buffcache || 0, free: mem.free,
          swapTotal: mem.swaptotal || 0, swapUsed: mem.swapused || 0,
        },
        gpu: gpuInfo.gpu, vram: gpuInfo.vram,
        disks: disks.filter(d => d.size > 0).map(d => ({ name: d.mount || d.fs, used: d.used, size: d.size, pct: Math.round(d.use || 0) })),
        net,
        uptime: os.uptime(),
      };
    } catch (e) { return { error: String(e) }; }
  });

  ipcMain.handle('stats:procs', async () => {
    if (!si) return [];
    try {
      const p = await si.processes();
      return p.list
        .filter(x => x.name !== 'System Idle Process')
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 24)
        .map(x => ({ pid: x.pid, name: x.name, user: x.user, cpu: x.cpu, mem: (x.memRss || 0) * 1024 }));
    } catch { return []; }
  });

  ipcMain.handle('proc:kill', (_e, pid, name, tree) => new Promise((resolve) => {
    pid = Number(pid);
    if (!Number.isInteger(pid) || pid <= 4) return resolve({ error: 'refused' });
    if (pid === process.pid || app.getAppMetrics().some(m => m.pid === pid)) return resolve({ error: 'that is part of argus' });
    if (PROTECTED.test(String(name || ''))) return resolve({ error: 'protected system process' });
    if (process.platform === 'win32') {
      const a = ['/PID', String(pid), '/F']; if (tree) a.push('/T');
      execFile('taskkill', a, { windowsHide: true }, (err) => resolve(err ? { error: 'could not end it (admin may be needed)' } : { ok: true }));
    } else {
      if (tree) execFile('pkill', ['-KILL', '-P', String(pid)], () => {});
      try { process.kill(pid, 'SIGKILL'); resolve({ ok: true }); }
      catch (e) { resolve({ error: e.code === 'EPERM' ? 'not permitted' : 'could not end it' }); }
    }
  }));
}

module.exports = { register, pollGpu };