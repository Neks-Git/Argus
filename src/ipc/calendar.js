const { ipcMain } = require('electron');
const { getSettings } = require('../config');

function icsParse(txt) {
  const lines = txt.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const evs = []; let cur = null;
  for (const ln of lines) {
    if (ln === 'BEGIN:VEVENT') { cur = {}; continue; }
    if (ln === 'END:VEVENT') { if (cur) evs.push(cur); cur = null; continue; }
    if (!cur) continue;
    const i = ln.indexOf(':');
    if (i < 0) continue;
    const key = ln.slice(0, i).split(';')[0].toUpperCase(), val = ln.slice(i + 1);
    cur[key] = val;
    if (key === 'EXDATE') (cur.EX = cur.EX || []).push(...val.split(','));
  }
  return evs;
}
function icsDate(v) {
  const m = /^(\d{4})(\d\d)(\d\d)(?:T(\d\d)(\d\d)(\d\d)(Z)?)?$/.exec(v || '');
  if (!m) return null;
  const allDay = !m[4];
  const t = m[7]
    ? Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6])
    : new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)).getTime();
  return { t, allDay };
}
function icsExpand(evs, from, to) {
  const out = [], ovr = new Set();
  for (const e of evs) if (e['RECURRENCE-ID']) { const r = icsDate(e['RECURRENCE-ID']); if (r) ovr.add(e.UID + '|' + new Date(r.t).toDateString()); }
  for (const e of evs) {
    const s = icsDate(e.DTSTART);
    if (!s || /CANCELLED/i.test(e.STATUS || '')) continue;
    const en = icsDate(e.DTEND), dur = en ? en.t - s.t : (s.allDay ? 864e5 : 0);
    const title = (e.SUMMARY || '(no title)').replace(/\\([,;nN\\])/g, (m, c) => /n/i.test(c) ? ' ' : c);
    const push = (t) => { if (t + dur >= from && t <= to) out.push({ title, start: t, end: t + dur, allDay: s.allDay }); };
    if (!e.RRULE || e['RECURRENCE-ID']) { push(s.t); continue; }

    const R = {};
    e.RRULE.split(';').forEach(p => { const [k, v] = p.split('='); R[k] = v; });
    const iv = +R.INTERVAL || 1, cnt = +R.COUNT || Infinity;
    const until = R.UNTIL ? (icsDate(R.UNTIL) || { t: Infinity }).t : Infinity;
    const ex = new Set((e.EX || []).map(x => { const d = icsDate(x); return d ? new Date(d.t).toDateString() : ''; }));
    const days = R.BYDAY ? R.BYDAY.split(',').map(x => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].indexOf(x.slice(-2))) : null;
    const d0 = new Date(s.t), sd = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
    const tod = s.t - sd.getTime();
    let n = isFinite(cnt) ? 0 : Math.max(0, Math.floor((from - s.t) / 864e5) - 1), count = 0;
    for (let g = 0; g < 20000; g++, n++) {
      const day = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate() + n), t = day.getTime() + tod;
      if (t > to || t > until) break;
      let ok = false;
      if (R.FREQ === 'DAILY') ok = n % iv === 0;
      else if (R.FREQ === 'WEEKLY') {
        const wk = Math.floor((n + (sd.getDay() + 6) % 7) / 7);
        ok = wk % iv === 0 && (days ? days.includes(day.getDay()) : day.getDay() === sd.getDay());
      } else if (R.FREQ === 'MONTHLY') {
        const mo = ((day.getFullYear() - sd.getFullYear()) * 12 + day.getMonth() - sd.getMonth()) % iv === 0;
        if (days) {
          const num = parseInt(R.BYDAY) || 0, dim = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate();
          ok = mo && days.includes(day.getDay()) && (!num || (num > 0 ? Math.ceil(day.getDate() / 7) === num : day.getDate() + 7 > dim));
        } else ok = mo && day.getDate() === sd.getDate();
      } else if (R.FREQ === 'YEARLY') ok = day.getDate() === sd.getDate() && day.getMonth() === sd.getMonth() && (day.getFullYear() - sd.getFullYear()) % iv === 0;
      if (!ok) continue;
      if (++count > cnt) break;
      if (ex.has(day.toDateString()) || ovr.has(e.UID + '|' + day.toDateString())) continue;
      push(t);
    }
  }
  return out;
}

let _cal = null, _calAt = 0, _calUrl = '';

module.exports = {
  register() {
    ipcMain.handle('cal:events', async (_e, force) => {
      const url = (getSettings().calendarUrl || '').trim().replace(/^webcal:/i, 'https:');
      if (!/^https:\/\//i.test(url)) return { needsUrl: true };
      if (!force && _cal && _calUrl === url && Date.now() - _calAt < 600000) return _cal;
      try {
        const r = await fetch(url);
        if (!r.ok) return { error: 'calendar error ' + r.status };
        const from = new Date(); from.setHours(0, 0, 0, 0);
        const events = icsExpand(icsParse(await r.text()), from.getTime(), from.getTime() + 45 * 864e5)
          .sort((a, b) => a.start - b.start).slice(0, 300);
        _cal = { events }; _calAt = Date.now(); _calUrl = url;
        return _cal;
      } catch { return { error: 'could not reach calendar' }; }
    });
  },
};