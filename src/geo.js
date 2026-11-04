const _geo = {};
async function geocode(q) {
  const key = q.toLowerCase();
  if (_geo[key]) return _geo[key];
  const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({ name: q, count: '1', language: 'en' }));
  if (!r.ok) return null;
  const j = await r.json();
  const p = j.results && j.results[0];
  if (!p) return null;
  return (_geo[key] = { lat: p.latitude, lon: p.longitude, name: [p.name, p.country_code].filter(Boolean).join(', ') });
}
module.exports = { geocode };