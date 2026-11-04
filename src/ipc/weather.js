const { ipcMain } = require('electron');
const { getSettings } = require('../config');
const { geocode } = require('../geo');

module.exports = {
  register() {
    ipcMain.handle('weather:get', async () => {
      const s = getSettings();
      const q = (s.location || '').trim();
      if (!q) return { error: 'set a location in settings' };
      try {
        const loc = await geocode(q);
        if (!loc) return { error: 'location not found' };
        const f = s.units === 'f';
        const r = await fetch('https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
          latitude: String(loc.lat), longitude: String(loc.lon), timezone: 'auto', forecast_days: '4',
          temperature_unit: f ? 'fahrenheit' : 'celsius',
          wind_speed_unit: f ? 'mph' : 'kmh',
          current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,relative_humidity_2m',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration',
        }));
        if (!r.ok) return { error: 'weather api error ' + r.status };
        const j = await r.json();
        const c = j.current, d = j.daily;
        const off = (j.utc_offset_seconds || 0) * 1000;
        const at = (str) => Date.parse(str + ':00Z') - off;
        return {
          place: loc.name, units: f ? 'f' : 'c',
          temp: c.temperature_2m, feels: c.apparent_temperature, code: c.weather_code,
          wind: c.wind_speed_10m, hum: c.relative_humidity_2m, isDay: !!c.is_day,
          days: d.time.map((t, i) => ({ date: t, code: d.weather_code[i], hi: d.temperature_2m_max[i], lo: d.temperature_2m_min[i] })),
          sun: (d.sunrise && d.sunrise[0] && d.sunset && d.sunset[0]) ? {
            rise: at(d.sunrise[0]), set: at(d.sunset[0]),
            len: d.daylight_duration[0], delta: d.daylight_duration[1] - d.daylight_duration[0],
          } : null,
        };
      } catch { return { error: 'could not reach weather api' }; }
    });
  },
};